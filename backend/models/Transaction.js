// ===================================
// FILE: backend/models/Transaction.js
// Transaction History Model
// ===================================

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txSignature: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['mint_cnft', 'reward', 'vote', 'badge'],
    required: true,
  },
  fromWallet: String,
  toWallet: {
    type: String,
    required: true,
    index: true,
  },
  amount: Number, // SOL amount
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
  },
  metadata: {
    cnftMint: String,
    cropType: String,
    description: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  blockTime: Date,
  slot: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Get user transaction history
transactionSchema.statics.getUserHistory = function(walletAddress) {
  return this.find({
    $or: [
      { fromWallet: walletAddress },
      { toWallet: walletAddress }
    ]
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Transaction', transactionSchema);

