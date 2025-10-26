
// ===================================
// FILE: backend/routes/transactions.js
// Transaction Routes
// ===================================

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get transaction history for wallet
router.get('/history/:walletAddress', async (req, res) => {
  try {
    const transactions = await Transaction.getUserHistory(
      req.params.walletAddress
    ).limit(100);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Get transaction by signature
router.get('/:signature', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      txSignature: req.params.signature
    }).populate('reportId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
});

module.exports = router;

