
// ===================================
// FILE: backend/models/Report.js
// Crop Report Model
// ===================================

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
  },
  farmerWallet: {
    type: String,
    required: true,
    index: true,
  },
  cropType: {
    type: String,
    required: true,
    enum: ['wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'mango', 'potato', 'onion', 'other'],
  },
  quantity: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'tons', 'maunds', 'acres'],
      default: 'kg',
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere',
    },
    address: {
      district: String,
      province: String,
      village: String,
    }
  },
  images: [{
    ipfsHash: String,
    url: String,
    uploadedAt: Date,
  }],
  metadata: {
    soilType: String,
    irrigation: String,
    fertilizer: String,
    harvestDate: Date,
    marketPrice: Number, // Price per unit
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'flagged'],
    default: 'pending',
  },
  verification: {
    votes: {
      approve: { type: Number, default: 0 },
      reject: { type: Number, default: 0 },
    },
    voters: [{
      wallet: String,
      vote: { type: String, enum: ['approve', 'reject'] },
      votedAt: Date,
    }],
    verifiedBy: String,
    verifiedAt: Date,
    rejectionReason: String,
  },
  blockchain: {
    cnftMint: String, // Compressed NFT mint address
    mintTxSignature: String,
    rewardTxSignature: String,
    rewardAmount: { type: Number, default: 0 }, // SOL amount
    treeAddress: String, // Merkle tree address
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Generate unique report ID
reportSchema.pre('save', function(next) {
  if (!this.reportId) {
    this.reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Static method to get reports by region
reportSchema.statics.getByRegion = function(province, district) {
  const query = {};
  if (province) query['location.address.province'] = province;
  if (district) query['location.address.district'] = district;
  return this.find(query);
};

// Static method to get aggregated data for map
reportSchema.statics.getAggregatedData = async function() {
  return this.aggregate([
    {
      $match: { status: 'verified' }
    },
    {
      $group: {
        _id: {
          district: '$location.address.district',
          cropType: '$cropType',
        },
        totalQuantity: { $sum: '$quantity.value' },
        avgPrice: { $avg: '$metadata.marketPrice' },
        reportCount: { $sum: 1 },
        location: { $first: '$location.coordinates' },
      }
    }
  ]);
};

// Method to verify report
reportSchema.methods.verify = async function(verifierWallet) {
  this.status = 'verified';
  this.verification.verifiedBy = verifierWallet;
  this.verification.verifiedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Method to reject report
reportSchema.methods.reject = async function(reason) {
  this.status = 'rejected';
  this.verification.rejectionReason = reason;
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);

