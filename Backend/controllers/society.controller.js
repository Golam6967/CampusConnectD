const Society = require('../models/Society');
const prisma = require('../src/config/prisma');
const { createNotification, createNotificationForMany } = require('../utils/notificationHelper');

// Get all societies
exports.getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find().select('-__v');

    const societiesWithCount = societies.map(society => ({
      ...society.toObject(),
      memberCount: society.followers.length,
      isFollowing: false, // TODO: Check against logged-in user
      isAdmin: false // TODO: Check against logged-in user
    }));

    res.status(200).json({
      success: true,
      societies: societiesWithCount
    });
  } catch (error) {
    console.error('Error fetching societies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching societies',
      error: error.message
    });
  }
};

// Get society by ID
exports.getSocietyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;
    const society = await Society.findById(id).select('-__v');

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    const isFollowing = userEmail ? society.followers.includes(userEmail) : false;
    const isAdmin = userEmail ? society.admins.includes(userEmail) : false;

    // Check if user has requested admin status
    let adminRequestStatus = null;
    if (userEmail && society.adminRequests) {
      const request = society.adminRequests.find(req => req.userEmail === userEmail && req.status === 'pending');
      if (request) {
        adminRequestStatus = 'pending';
      }
    }

    const societyData = {
      ...society.toObject(),
      memberCount: society.followers.length,
      isFollowing,
      isAdmin,
      adminRequestStatus
    };

    res.status(200).json({
      success: true,
      society: societyData
    });
  } catch (error) {
    console.error('Error fetching society:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching society',
      error: error.message
    });
  }
};

// Create a new society
exports.createSociety = async (req, res) => {
  try {
    const {
      name,
      logo,
      coverPhoto,
      description,
      establishedYear,
      email,
      facebook,
      website
    } = req.body;

    // Check if society already exists
    const existingSociety = await Society.findOne({ name });
    if (existingSociety) {
      return res.status(400).json({
        success: false,
        message: 'Society with this name already exists'
      });
    }

    const society = new Society({
      name,
      logo,
      coverPhoto,
      description,
      establishedYear,
      email,
      facebook,
      website,
      panelMembers: [],
      pastGallery: [],
      admins: [],
      followers: []
    });

    await society.save();

    res.status(201).json({
      success: true,
      message: 'Society created successfully',
      society
    });
  } catch (error) {
    console.error('Error creating society:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating society',
      error: error.message
    });
  }
};

// Update society information
exports.updateSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, ...updates } = req.body;

    // Verify user is an admin
    const society = await Society.findById(id);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update society information'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.admins;
    delete updates.followers;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedSociety = await Society.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Society updated successfully',
      society: updatedSociety
    });
  } catch (error) {
    console.error('Error updating society:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating society',
      error: error.message
    });
  }
};

// Follow/Unfollow society
exports.toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body; // TODO: Get from auth token

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    const isFollowing = society.followers.includes(userEmail);

    if (isFollowing) {
      // Unfollow
      society.followers = society.followers.filter(email => email !== userEmail);
      await society.save();

      res.status(200).json({
        success: true,
        message: 'Unfollowed society',
        isFollowing: false
      });
    } else {
      // Follow
      society.followers.push(userEmail);
      await society.save();

      res.status(200).json({
        success: true,
        message: 'Following society',
        isFollowing: true
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling follow',
      error: error.message
    });
  }
};

// Request to join as admin
exports.joinAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, userName } = req.body; // TODO: Get from auth token

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    const isAdmin = society.admins.includes(userEmail);

    if (isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Already an admin of this society'
      });
    }

    // Check if user already has a pending request
    const existingRequest = society.adminRequests?.find(
      req => req.userEmail === userEmail && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending admin request for this society'
      });
    }

    // Add admin request instead of directly adding to admins
    if (!society.adminRequests) {
      society.adminRequests = [];
    }

    society.adminRequests.push({
      userEmail,
      userName: userName || userEmail.split('@')[0],
      requestedAt: new Date(),
      status: 'pending'
    });

    await society.save();

    // Notify all existing admins about the new request
    if (society.admins && society.admins.length > 0) {
      try {
        const adminUsers = await prisma.users.findMany({
          where: { email: { in: society.admins } },
          select: { users_id: true }
        });
        const adminIds = adminUsers.map(u => u.users_id);
        
        // Get requester's userId to exclude them if they're already an admin
        let requesterUserId = null;
        if (req.verifiedUser?.user_id) {
          requesterUserId = req.verifiedUser.user_id;
        }
        
        if (adminIds.length > 0) {
          await createNotificationForMany(
            'society',
            'New Admin Request',
            `${userName || userEmail} has requested to become  an admin of "${society.name}". Please review.`,
            adminIds,
            { societyId: id, requesterEmail: userEmail },
            requesterUserId  // Exclude the requester from notifications
          );
        }
      } catch (lookupErr) {
        console.error('[Notification] Admin lookup failed:', lookupErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Admin request sent successfully. Awaiting administrator approval.',
      adminRequestStatus: 'pending'
    });
  } catch (error) {
    console.error('Error requesting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending admin request',
      error: error.message
    });
  }
};

// Leave admin role
exports.leaveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body; // TODO: Get from auth token

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    society.admins = society.admins.filter(email => email !== userEmail);
    await society.save();

    res.status(200).json({
      success: true,
      message: 'Left admin role',
      isAdmin: false
    });
  } catch (error) {
    console.error('Error leaving admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving admin',
      error: error.message
    });
  }
};

// Add panel member
exports.addPanelMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, name, position, department, batch } = req.body;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Verify user is an admin
    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add panel members'
      });
    }

    society.panelMembers.push({ name, position, department, batch });
    await society.save();

    res.status(200).json({
      success: true,
      message: 'Panel member added',
      society
    });
  } catch (error) {
    console.error('Error adding panel member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding panel member',
      error: error.message
    });
  }
};

// Update panel member
exports.updatePanelMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { userEmail, name, position, department, batch } = req.body;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Verify user is an admin
    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update panel members'
      });
    }

    const member = society.panelMembers.id(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Panel member not found'
      });
    }

    member.name = name || member.name;
    member.position = position || member.position;
    member.department = department || member.department;
    member.batch = batch || member.batch;

    await society.save();

    res.status(200).json({
      success: true,
      message: 'Panel member updated',
      society
    });
  } catch (error) {
    console.error('Error updating panel member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating panel member',
      error: error.message
    });
  }
};

// Delete panel member
exports.deletePanelMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { userEmail } = req.body;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Verify user is an admin
    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete panel members'
      });
    }

    const member = society.panelMembers.id(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Panel member not found'
      });
    }

    member.deleteOne();
    await society.save();

    res.status(200).json({
      success: true,
      message: 'Panel member deleted',
      society
    });
  } catch (error) {
    console.error('Error deleting panel member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting panel member',
      error: error.message
    });
  }
};


// Add past event to gallery
exports.addPastEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, title, date, image, description } = req.body;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Verify user is an admin
    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add past events'
      });
    }

    society.pastGallery.push({ title, date, image, description });
    await society.save();

    res.status(200).json({
      success: true,
      message: 'Past event added',
      society
    });
  } catch (error) {
    console.error('Error adding past event:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding past event',
      error: error.message
    });
  }
};

// Update past event
exports.updatePastEvent = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const { userEmail, title, date, image, description } = req.body;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Verify user is an admin
    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update past events'
      });
    }

    const event = society.pastGallery.id(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Past event not found'
      });
    }

    event.title = title || event.title;
    event.date = date || event.date;
    event.image = image || event.image;
    event.description = description !== undefined ? description : event.description;

    await society.save();

    res.status(200).json({
      success: true,
      message: 'Past event updated',
      society
    });
  } catch (error) {
    console.error('Error updating past event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating past event',
      error: error.message
    });
  }
};

// Delete past event
exports.deletePastEvent = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const { userEmail } = req.body;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Verify user is an admin
    if (userEmail && !society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete past events'
      });
    }

    const event = society.pastGallery.id(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Past event not found'
      });
    }

    event.deleteOne();
    await society.save();

    res.status(200).json({
      success: true,
      message: 'Past event deleted',
      society
    });
  } catch (error) {
    console.error('Error deleting past event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting past event',
      error: error.message
    });
  }
};

// Delete society (Administrator only)
exports.deleteSociety = async (req, res) => {
  try {
    const { id } = req.params;

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    await Society.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Society "${society.name}" has been deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting society:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting society',
      error: error.message
    });
  }
};

// Remove admin from society (Administrator only)
exports.removeAdminFromSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminEmail } = req.body;

    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is required'
      });
    }

    const society = await Society.findById(id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    if (!society.admins.includes(adminEmail)) {
      return res.status(400).json({
        success: false,
        message: 'This user is not an admin of this society'
      });
    }

    society.admins = society.admins.filter(email => email !== adminEmail);
    await society.save();

    res.status(200).json({
      success: true,
      message: `Admin removed from "${society.name}" successfully`,
      society
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing admin',
      error: error.message
    });
  }
};
