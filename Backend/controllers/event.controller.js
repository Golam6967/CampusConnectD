const Event = require('../models/Event');
const Society = require('../models/Society');
const prisma = require('../src/config/prisma');
const { createNotification, createNotificationForMany } = require('../utils/notificationHelper');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { societyId, category, month, upcoming, userEmail } = req.query;

    let query = {};

    if (societyId) {
      query.societyId = societyId;
    }

    if (category) {
      query.category = category;
    }

    if (month) {
      // month format: YYYY-MM
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query).sort({ date: 1 }).select('-__v');

    const eventsWithDetails = events.map(event => ({
      ...event.toObject(),
      currentParticipants: event.registrations.length,
      isRegistered: userEmail ? event.registrations.includes(userEmail) : false
    }));

    res.status(200).json({
      success: true,
      events: eventsWithDetails
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;
    const event = await Event.findById(id).select('-__v');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventData = {
      ...event.toObject(),
      currentParticipants: event.registrations.length,
      isRegistered: userEmail ? event.registrations.includes(userEmail) : false
    };

    res.status(200).json({
      success: true,
      event: eventData
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      societyId,
      category,
      date,
      time,
      venue,
      description,
      imageUrl,
      maxParticipants,
      registrationDeadline,
      userEmail // TODO: Get from auth token
    } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Verify society exists and user is admin
    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Check if user is admin
    if (!society.admins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create events for this society'
      });
    }

    const event = new Event({
      title,
      societyId,
      societyName: society.name,
      category,
      date,
      time,
      venue,
      description,
      imageUrl,
      maxParticipants,
      registrationDeadline,
      registrations: [],
      createdBy: userEmail
    });

    await event.save();

    // Notify all society followers about the new event
    if (society.followers && society.followers.length > 0) {
      try {
        // Get creator's userId for exclusion
        let creatorUserId = null;
        try {
          const creator = await prisma.users.findUnique({
            where: { email: userEmail },
            select: { users_id: true }
          });
          creatorUserId = creator?.users_id;
        } catch (err) {
          console.error('[Notification] Creator lookup failed:', err.message);
        }

        const followerUsers = await prisma.users.findMany({
          where: { email: { in: society.followers } },
          select: { users_id: true }
        });
        const followerIds = followerUsers.map(u => u.users_id);
        if (followerIds.length > 0) {
          await createNotificationForMany(
            'event',
            `New Event: ${title}`,
            `${society.name} posted a new event on ${new Date(date).toLocaleDateString()}. Venue: ${venue}`,
            followerIds,
            { eventId: event._id.toString(), societyId: societyId },
            creatorUserId  // Exclude the event creator from notifications
          );
        }
      } catch (lookupErr) {
        console.error('[Notification] Follower lookup failed:', lookupErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: {
        ...event.toObject(),
        currentParticipants: 0
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.registrations;
    delete updates.createdBy;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.societyId;

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Notify all registered participants about event update
    if (event.registrations && event.registrations.length > 0) {
      try {
        const regUsers = await prisma.users.findMany({
          where: { email: { in: event.registrations } },
          select: { users_id: true }
        });
        const regIds = regUsers.map(u => u.users_id);
        if (regIds.length > 0) {
          await createNotificationForMany(
            'event',
            'Event Details Updated',
            `"${event.title}" has been updated. Please check the latest date, time, and venue.`,
            regIds,
            { eventId: id },
            req.verifiedUser?.user_id  // Exclude the person who made the update
          );
        }
      } catch (lookupErr) {
        console.error('[Notification] Registrant lookup failed:', lookupErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Notify all registered participants that event is cancelled
    if (event.registrations && event.registrations.length > 0) {
      try {
        const regUsers = await prisma.users.findMany({
          where: { email: { in: event.registrations } },
          select: { users_id: true }
        });
        const regIds = regUsers.map(u => u.users_id);
        if (regIds.length > 0) {
          await createNotificationForMany(
            'event',
            'Event Cancelled',
            `The event "${event.title}" has been cancelled.`,
            regIds,
            { eventId: id },
            req.verifiedUser?.user_id  // Exclude the person who deleted the event
          );
        }
      } catch (lookupErr) {
        console.error('[Notification] Registrant lookup failed:', lookupErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body; // TODO: Get from auth token

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is enabled (has a deadline or max participants)
    if (!event.registrationDeadline && !event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available for this event'
      });
    }

    // Check if already registered
    if (event.registrations.includes(userEmail)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full (only if maxParticipants is defined)
    if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked'
      });
    }

    // Check if registration deadline has passed (only if deadline is set)
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    event.registrations.push(userEmail);
    await event.save();

    // Notify the registrant
    try {
      const regUser = await prisma.users.findUnique({
        where: { email: userEmail },
        select: { users_id: true }
      });
      if (regUser) {
        await createNotification(
          'event',
          'Event Registration Confirmed ✅',
          `You are registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()} at ${event.venue}.`,
          regUser.users_id,
          { eventId: id }
        );
      }
    } catch (lookupErr) {
      console.error('[Notification] User lookup failed:', lookupErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
};

// Unregister from event
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body; // TODO: Get from auth token

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.registrations = event.registrations.filter(email => email !== userEmail);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({
      success: false,
      message: 'Error unregistering from event',
      error: error.message
    });
  }
};
