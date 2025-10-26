// ===================================
// FILE: backend/middleware/auth.js
// Wallet Authentication Middleware
// ===================================

const nacl = require('tweetnacl');
const bs58 = require('bs58');

// Simple wallet verification middleware
const verifyWallet = async (req, res, next) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    
    if (!walletAddress) {
      return res.status(401).json({ 
        success: false, 
        message: 'Wallet address required' 
      });
    }

    // Attach wallet to request
    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

// Verify signature for sensitive operations
const verifySignature = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for signature verification'
      });
    }

    // Decode signature and message
    const signatureUint8 = bs58.decode(signature);
    const messageUint8 = new TextEncoder().encode(message);
    const publicKeyUint8 = bs58.decode(walletAddress);

    // Verify signature
    const verified = nacl.sign.detached.verify(
      messageUint8,
      signatureUint8,
      publicKeyUint8
    );

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Signature verification failed',
      error: error.message
    });
  }
};

module.exports = { verifyWallet, verifySignature };


