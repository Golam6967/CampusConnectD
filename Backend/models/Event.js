const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  societyName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Workshop', 'Competition', 'Seminar', 'Other']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: false,
    trim: true
  },
  venue: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/800x400'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  registrationDeadline: {
    type: Date,
    required: false
  },
  registrations: [{
    type: String, // User email or ID
    trim: true
  }],
  createdBy: {
    type: String, // User email or ID who created the event
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for current participants
eventSchema.virtual('currentParticipants').get(function() {
  return this.registrations.length;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
