/**
 * Blood Donation Notification Transformer Service
 * Manages notification logic for blood requests:
 * - Finds eligible donors (donation date >= 2 months, blood type compatible)
 * - Sends Gmail notifications to matching donors
 */

const { transporter, GMAIL_USER } = require("../config/gmailConfig");
const { isCompatibleDonor } = require("../utils/bloodTypeMatchings");
const prisma = require('../config/prisma');

/**
 * Checks if a donor is eligible based on donation date
 * A donor is eligible if they last donated >= 2 months ago
 * @param {Date} lastDonationDate - The date of the donor's last donation
 * @returns {boolean} - True if donor can donate (2+ months have passed)
 */
function isEligibleByDonationDate(lastDonationDate) {
  // If lastDonationDate is null/undefined, donor is eligible (new donor)
  if (!lastDonationDate) {
    return true;
  }

  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days

  return lastDonationDate <= twoMonthsAgo;
}

/**
 * Returns days until donor is eligible again
 * Used for informational purposes
 * @param {Date} lastDonationDate - The date of the donor's last donation
 * @returns {number} - Days remaining until eligible (0 if already eligible)
 */
function getDaysUntilEligible(lastDonationDate) {
  if (!lastDonationDate) return 0;

  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(
    0,
    Math.ceil((twoMonthsAgo - lastDonationDate) / (1000 * 60 * 60 * 24)),
  );

  return daysLeft;
}

/**
 * Generates HTML email template for blood donation request
 * @param {Object} donor - Donor information {name, bloodType}
 * @param {Object} request - Blood request information {bloodGroup, location, deadline, requesterName}
 * @returns {string} - HTML email body
 */
function generateEmailTemplate(donor, request) {
  const deadlineDate = new Date(request.deadline).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
        .section { margin-bottom: 20px; }
        .section h2 { color: #e74c3c; font-size: 16px; margin-top: 0; }
        .info-box { background-color: #f0f0f0; padding: 15px; border-left: 4px solid #e74c3c; margin: 15px 0; }
        .info-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
        .value { color: #333; }
        .cta-button { display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
        .cta-button:hover { background-color: #c0392b; }
        .footer { font-size: 12px; color: #999; text-align: center; padding-top: 20px; border-top: 1px solid #eee; }
        .blood-type-badge { display: inline-block; background-color: #e74c3c; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🩸 Urgent Blood Donation Request</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${donor.name}</strong>,</p>
          
          <p>We have an urgent blood donation request that matches your blood type. Your donation could save a life!</p>
          
          <div class="section">
            <h2>Request Details</h2>
            <div class="info-box">
              <div class="info-row">
                <span class="label">Blood Type Needed:</span>
                <span class="value"><span class="blood-type-badge">${request.bloodGroup}</span></span>
              </div>
              <div class="info-row">
                <span class="label">Your Blood Type:</span>
                <span class="value"><span class="blood-type-badge">${donor.bloodType}</span></span>
              </div>
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${request.location}</span>
              </div>
              <div class="info-row">
                <span class="label">Deadline:</span>
                <span class="value">${deadlineDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Requested By:</span>
                <span class="value">${request.requesterName}</span>
              </div>
              <div class="info-row">
                <span class="label">Requester Email:</span>
                <span class="value"><a href="mailto:${request.requesterEmail}" style="color: #e74c3c; text-decoration: none;">${request.requesterEmail}</a></span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Why You?</h2>
            <p>Your blood type <strong>${donor.bloodType}</strong> is compatible with the requested blood type <strong>${request.bloodGroup}</strong>, and it's been at least 2 months since your last donation. You're eligible to donate!</p>
          </div>

          <div class="section">
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173'}/blood-requests/${request.requestId}" class="cta-button">View Full Request</a>
            </p>
          </div>

          <div class="section">
            <h2>Important Notes</h2>
            <ul>
              <li>Please ensure you're in good health before donating</li>
              <li>Stay hydrated and have a meal before your donation</li>
              <li>If you cannot donate, please reply to let us know</li>
              <li>Every donation matters - thank you for considering this request!</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>CampusConnect Blood Donation System</p>
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Finds eligible donors for a blood request
 * Filters by:
 * - Blood type compatibility
 * - Last donation date >= 2 months ago
 * - Active donors only
 * @param {Object} bloodRequest - Blood request object {bloodGroup, deadline, requesterId}
 * @returns {Promise<Array>} - Array of eligible donors
 */
async function findEligibleDonors(bloodRequest) {
  const requiredBloodType = bloodRequest.blood_group?.trim().toUpperCase();

  if (!requiredBloodType) {
    console.error("Invalid blood group in request");
    return [];
  }

  try {
    // Fetch all active donors
    const allDonors = await prisma.donorRecord.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            users_id: true,
            user_name: true,
            email: true,
            phone_number: true,
          },
        },
      },
    });
    console.log(allDonors);

    // Filter donors based on eligibility criteria
    const eligibleDonors = allDonors.filter((donor) => {
      // Check blood type compatibility
      const donorBloodType = donor.blood_group?.trim().toUpperCase();
      if (!isCompatibleDonor(donorBloodType, requiredBloodType)) {
        return false;
      }

      // Check donation date eligibility (2+ months since last donation)
      //   if (!isEligibleByDonationDate(donor.last_donated)) {
      //     return false;
      //   }

      // Exclude the requester from receiving notifications
      if (donor.userId === bloodRequest.requesterId) {
        return false;
      }

      return true;
    });

    return eligibleDonors;
  } catch (error) {
    console.error("Error finding eligible donors:", error);
    return [];
  }
}

/**
 * Sends individual email notification to a donor
 * @param {Object} donor - Donor object with user details
 * @param {Object} bloodRequest - Blood request details
 * @param {Object} requester - Requester user details
 * @returns {Promise<Object>} - {success, messageId, error}
 */
async function sendNotificationEmail(donor, bloodRequest, requester) {
  if (!GMAIL_USER || !transporter) {
    console.warn("Gmail not configured, skipping email notification");
    return { success: false, error: "Gmail not configured" };
  }

  if (!donor.user.email) {
    console.warn(`Donor ${donor.user.user_name} has no email address`);
    return { success: false, error: "No email address" };
  }

  try {
    const mailOptions = {
      from: GMAIL_USER,
      to: donor.user.email,
      subject: `🩸 URGENT: Blood Donation Request - ${bloodRequest.blood_group} @ ${new Date(bloodRequest.deadline).toLocaleDateString()}`,
      html: generateEmailTemplate(
        {
          name: donor.user.user_name,
          bloodType: donor.blood_group,
        },
        {
          bloodGroup: bloodRequest.blood_group,
          location: bloodRequest.location,
          deadline: bloodRequest.deadline,
          requesterName: requester.user_name,
          requesterEmail: requester.email,
          requestId: bloodRequest.request_id,
        },
      ),
      replyTo: requester.email,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✓ Email sent to ${donor.user.email} (Message ID: ${info.messageId})`,
    );

    return {
      success: true,
      messageId: info.messageId,
      donorEmail: donor.user.email,
    };
  } catch (error) {
    console.error(
      `✗ Failed to send email to ${donor.user.email}:`,
      error.message,
    );
    return {
      success: false,
      donorEmail: donor.user.email,
      error: error.message,
    };
  }
}

/**
 * MAIN TRANSFORMER: Processes blood request and sends notifications to eligible donors
 * @param {Object} bloodRequest - The blood request object from database
 * @returns {Promise<Object>} - Notification results summary
 */
async function transformBloodRequestToNotification(bloodRequest) {
  console.log(
    `\n📋 Processing blood request #${bloodRequest.request_id} for ${bloodRequest.blood_group}`,
  );

  // Get requester details
  let requester;
  try {
    requester = await prisma.users.findUnique({
      where: { users_id: bloodRequest.requesterId },
      select: { user_name: true, email: true, phone_number: true },
    });

    if (!requester) {
      console.error("Requester not found");
      return {
        success: false,
        error: "Requester not found",
        notificationsSent: 0,
      };
    }
  } catch (error) {
    console.error("Error fetching requester:", error);
    return { success: false, error: error.message, notificationsSent: 0 };
  }

  // Find eligible donors
  console.log("🔍 Finding eligible donors...");
  const eligibleDonors = await findEligibleDonors(bloodRequest);
  console.log(`✓ Found ${eligibleDonors.length} eligible donors`);

  // Send notifications to all eligible donors
  const results = {
    requestId: bloodRequest.request_id,
    bloodType: bloodRequest.blood_group,
    totalEligible: eligibleDonors.length,
    notificationsSent: 0,
    notificationsFailed: 0,
    sentTo: [],
    failedDonors: [],
  };

  if (eligibleDonors.length === 0) {
    console.log("⚠️ No eligible donors found for this request");
    return { ...results, success: true };
  }

  console.log(`📧 Sending ${eligibleDonors.length} email notifications...`);

  for (const donor of eligibleDonors) {
    const emailResult = await sendNotificationEmail(
      donor,
      bloodRequest,
      requester,
    );

    if (emailResult.success) {
      results.notificationsSent++;
      results.sentTo.push({
        donorId: donor.donor_id,
        donorName: donor.user.user_name,
        email: donor.user.email,
        bloodType: donor.blood_group,
      });
    } else {
      results.notificationsFailed++;
      results.failedDonors.push({
        donorId: donor.donor_id,
        donorName: donor.user.user_name,
        email: donor.user.email,
        error: emailResult.error,
      });
    }

    // Add small delay to avoid Gmail API rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Notification Summary:`);
  console.log(
    `   - Sent: ${results.notificationsSent}/${results.totalEligible}`,
  );
  console.log(`   - Failed: ${results.notificationsFailed}`);

  return {
    success: true,
    ...results,
  };
}

module.exports = {
  transformBloodRequestToNotification,
  findEligibleDonors,
  sendNotificationEmail,
  isEligibleByDonationDate,
  getDaysUntilEligible,
  generateEmailTemplate,
};
