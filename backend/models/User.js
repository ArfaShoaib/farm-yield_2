// ===================================
// FILE: backend/models/User.js
// User/Farmer Model
// ===================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    default: function() {
      return `Farmer_${this.walletAddress.slice(0, 6)}`;
    }
  },
  totalReports: {
    type: Number,
    default: 0,
  },
  verifiedReports: {
    type: Number,
    default: 0,
  },
  totalEarned: {
    type: Number,
    default: 0, // Total SOL earned
  },
  reputationScore: {
    type: Number,
    default: 0, // Based on verified reports
  },
  location: {
    district: String,
    province: String,
    coordinates: {
      lat: Number,
      lng: Number,
    }
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  badges: [{
    type: {
      type: String, // 'first_report', 'verified_10', 'top_contributor'
    },
    earnedAt: Date,
    cnftMint: String, // cNFT mint address for badge
  }],
}, {
  timestamps: true,
});

// Update last active timestamp
userSchema.methods.updateActivity = function() {
  this.lastActive = Date.now();
  return this.save();
};

// Calculate reputation (verified reports / total reports * 100)
userSchema.methods.calculateReputation = function() {
  if (this.totalReports === 0) return 0;
  this.reputationScore = Math.round((this.verifiedReports / this.totalReports) * 100);
  return this.reputationScore;
};

module.exports = mongoose.model('User', userSchema);


