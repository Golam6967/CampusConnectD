const mongoose = require('mongoose');

const panelMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true });

const pastEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: true });

const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/200'
  },
  coverPhoto: {
    type: String,
    default: 'https://via.placeholder.com/1200x400'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  establishedYear: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  facebook: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  panelMembers: [panelMemberSchema],
  pastGallery: [pastEventSchema],
  admins: [{
    type: String, // User email or ID
    trim: true
  }],
  adminRequests: [{
    userEmail: {
      type: String,
      required: true,
      trim: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  followers: [{
    type: String, // User email or ID
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for member count
societySchema.virtual('memberCount').get(function() {
  return this.followers.length;
});

// Ensure virtuals are included in JSON
societySchema.set('toJSON', { virtuals: true });
societySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Society', societySchema);
