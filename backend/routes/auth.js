// ===================================
// FILE: backend/routes/auth.js
// Authentication Routes
// ===================================

const express = require('express');
const router = express.Router();
const  User  = require('../models/User');

// Register or get user by wallet
router.post('/login', async (req, res) => {
  try {
    const { walletAddress, username, location } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });

    if (!user) {
      // Create new user
      user = new User({
        walletAddress,
        username: username || `Farmer_${walletAddress.slice(0, 6)}`,
        location: location || {}
      });
      await user.save();
      console.log(`✅ New user registered: ${walletAddress}`);
    } else {
      // Update existing user
      await user.updateActivity();
      console.log(`✅ User logged in: ${walletAddress}`);
    }

    res.json({
      success: true,
      message: user.createdAt === user.updatedAt ? 'User registered successfully' : 'Welcome back!',
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        totalReports: user.totalReports,
        verifiedReports: user.verifiedReports,
        totalEarned: user.totalEarned,
        reputationScore: user.reputationScore,
        badges: user.badges,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// // Register or get user by wallet
// router.post('/login', async (req, res) => {
//   try {
//     const { walletAddress, username, location } = req.body;

//     if (!walletAddress) {
//       return res.status(400).json({
//         success: false,
//         message: 'Wallet address is required'
//       });
//     }

//     // Find or create user
//     let user = await User.findOne({ walletAddress });

//     if (!user) {
//       user = new User({
//         walletAddress,
//         username: username || `Farmer_${walletAddress.slice(0, 6)}`,
//         location: location || {}
//       });
//       await user.save();
//       console.log(`✅ New user registered: ${walletAddress}`);
//     } else {
//       await user.updateActivity();
//     }

//     res.json({
//       success: true,
//       message: user.isNew ? 'User registered successfully' : 'Welcome back!',
//       user: {
//         walletAddress: user.walletAddress,
//         username: user.username,
//         totalReports: user.totalReports,
//         verifiedReports: user.verifiedReports,
//         totalEarned: user.totalEarned,
//         reputationScore: user.reputationScore,
//         badges: user.badges,
//         joinedAt: user.joinedAt
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Login failed',
//       error: error.message
//     });
//   }
// });

// Get user profile
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ 
      walletAddress: req.params.walletAddress 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        totalReports: user.totalReports,
        verifiedReports: user.verifiedReports,
        totalEarned: user.totalEarned,
        reputationScore: user.reputationScore,
        location: user.location,
        badges: user.badges,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'reputation', limit = 10 } = req.query;

    let sortField = 'reputationScore';
    if (type === 'reports') sortField = 'totalReports';
    if (type === 'earnings') sortField = 'totalEarned';

    const users = await User.find()
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select('walletAddress username totalReports verifiedReports totalEarned reputationScore badges');

    res.json({
      success: true,
      leaderboard: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

module.exports = router;

