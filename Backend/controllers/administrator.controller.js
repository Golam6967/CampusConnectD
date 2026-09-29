const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma.js");
const generateJWT = require("../middleware/auth.middleware.js");
const adminAuth = require("../firebase.js");
const Society = require("../models/Society.js");
const Event = require("../models/Event.js");
const Feedback = require("../models/Feedback.js");
const { createNotification } = require('../utils/notificationHelper');

// Hardcoded administrator emails
const ADMINISTRATOR_EMAILS = ["ridwankhan@iut-dhaka.edu"];

/**
 * Administrator Google Sign-in
 * Only allows hardcoded administrator emails to log in
 */
exports.administratorGoogleSignin = async (req, res) => {
  const firebaseIdToken = req.body.token;
  const REQUIRED_DOMAIN = "iut-dhaka.edu";

  if (!firebaseIdToken) {
    return res.status(400).json({ error: "Token is missing." });
  }

  try {
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);

    const userEmail = decodedToken.email;
    const firebaseUID = decodedToken.uid;

    const domain = userEmail.split("@").pop();

    // Check if the domain is correct
    if (domain !== REQUIRED_DOMAIN) {
      await adminAuth.revokeRefreshTokens(firebaseUID);
      return res.status(403).json({
        error: "Unauthorized Domain",
        message: `Only @${REQUIRED_DOMAIN} email allowed.`,
      });
    }

    // Check if the email is in the administrator list
    if (!ADMINISTRATOR_EMAILS.includes(userEmail)) {
      return res.status(403).json({
        error: "Access Denied",
        message: "You do not have administrator privileges.",
      });
    }

    // Generate JWT token
    const token = await generateJWT.generate(decodedToken, res);
    console.log("Generated JWT for administrator:", token);

    // Upsert user in the database
    const user = await prisma.users.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        user_name: decodedToken.name || userEmail.split("@")[0],
        email: userEmail,
      },
      select: {
        users_id: true,
        email: true,
        user_name: true,
        phone_number: true,
        image: true,
        gender: true,
      },
    });

    user.token = token;
    user.isAdministrator = true; // Mark as administrator

    console.log("Administrator login:", user);

    res.status(200).json({
      message: "Administrator Login Successful",
      user,
    });
  } catch (error) {
    console.error("Administrator Authentication Error:", error);
    res.status(401).json({
      error: "Invalid Firebase token",
      message: "There was an error during authentication",
    });
  }
};

/**
 * Middleware to verify if the user is an administrator
 */
exports.verifyAdministrator = async (req, res, next) => {
  try {
    const userEmail = req.verifiedUser?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!ADMINISTRATOR_EMAILS.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: "Administrator access required.",
      });
    }

    next();
  } catch (error) {
    console.error("Administrator verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying administrator status.",
    });
  }
};

/**
 * Get administrator dashboard data
 */
exports.getAdministratorDashboard = async (req, res) => {
  try {
    // Fetch statistics for the administrator dashboard
    // Users from Prisma/PostgreSQL (lowercase for Prisma client)
    const totalUsers = await prisma.users.count();

    // Society, Event, Feedback from MongoDB/Mongoose
    const totalSocieties = await Society.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSocieties,
        totalEvents,
        totalFeedback,
      },
    });
  } catch (error) {
    console.error("Error fetching administrator dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
};

/**
 * Get all pending admin requests across all societies
 */
exports.getAllAdminRequests = async (req, res) => {
  try {
    const societies = await Society.find({
      "adminRequests.status": "pending",
    }).select("name logo adminRequests");

    // Flatten and format admin requests
    const adminRequests = [];

    societies.forEach((society) => {
      if (society.adminRequests && society.adminRequests.length > 0) {
        const pendingRequests = society.adminRequests.filter(
          (req) => req.status === "pending",
        );
        pendingRequests.forEach((request) => {
          adminRequests.push({
            requestId: request._id,
            societyId: society._id,
            societyName: society.name,
            societyLogo: society.logo,
            userEmail: request.userEmail,
            userName: request.userName,
            requestedAt: request.requestedAt,
            status: request.status,
          });
        });
      }
    });

    // Sort by most recent first
    adminRequests.sort(
      (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt),
    );

    res.status(200).json({
      success: true,
      data: adminRequests,
    });
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin requests",
    });
  }
};

/**
 * Approve admin request
 */
exports.approveAdminRequest = async (req, res) => {
  try {
    const { societyId, requestId } = req.body;

    if (!societyId || !requestId) {
      return res.status(400).json({
        success: false,
        message: "Society ID and Request ID are required",
      });
    }

    const society = await Society.findById(societyId);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: "Society not found",
      });
    }

    const request = society.adminRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Admin request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    // Add user to admins array
    if (!society.admins.includes(request.userEmail)) {
      society.admins.push(request.userEmail);
    }

    // Update request status
    request.status = "approved";

    await society.save();

    // Notify the requester
    try {
      const requesterUser = await prisma.users.findUnique({
        where: { email: request.userEmail },
        select: { users_id: true }
      });
      if (requesterUser) {
        await createNotification(
          'society',
          'Admin Request Approved 🎉',
          `Congratulations! Your request to become an admin of "${society.name}" has been approved.`,
          requesterUser.users_id,
          { societyId: societyId }
        );
      }
    } catch (lookupErr) {
      console.error('[Notification] Requester lookup failed:', lookupErr.message);
    }

    res.status(200).json({
      success: true,
      message: `${request.userName} has been approved as an admin for ${society.name}`,
    });
  } catch (error) {
    console.error("Error approving admin request:", error);
    res.status(500).json({
      success: false,
      message: "Error approving admin request",
    });
  }
};

/**
 * Reject admin request
 */
exports.rejectAdminRequest = async (req, res) => {
  try {
    const { societyId, requestId } = req.body;

    if (!societyId || !requestId) {
      return res.status(400).json({
        success: false,
        message: "Society ID and Request ID are required",
      });
    }

    const society = await Society.findById(societyId);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: "Society not found",
      });
    }

    const request = society.adminRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Admin request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    // Update request status
    request.status = "rejected";

    await society.save();

    // Notify the requester
    try {
      const requesterUser = await prisma.users.findUnique({
        where: { email: request.userEmail },
        select: { users_id: true }
      });
      if (requesterUser) {
        await createNotification(
          'society',
          'Admin Request Reviewed',
          `Your request to become an admin of "${society.name}" was not approved at this time.`,
          requesterUser.users_id,
          { societyId: societyId }
        );
      }
    } catch (lookupErr) {
      console.error('[Notification] Requester lookup failed:', lookupErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Request from ${request.userName} has been rejected`,
    });
  } catch (error) {
    console.error("Error rejecting admin request:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting admin request",
    });
  }
};
