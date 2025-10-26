// ===================================
// FILE: backend/models/Vote.js
// Voting Model (for community verification)
// ===================================

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
    index: true,
  },
  voterWallet: {
    type: String,
    required: true,
    index: true,
  },
  voteType: {
    type: String,
    enum: ['approve', 'reject'],
    required: true,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  txSignature: String, // If voting is on-chain
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate votes
voteSchema.index({ reportId: 1, voterWallet: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);


