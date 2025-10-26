
// ===================================
// FILE: backend/services/helius.js
// Helius API Integration for Indexing
// ===================================

const axios = require('axios');

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';

// Get asset by mint address (cNFT)
const getAssetByMint = async (mintAddress) => {
  try {
    const response = await axios.post(
      `${HELIUS_BASE_URL}/token-metadata`,
      {
        mintAccounts: [mintAddress]
      },
      {
        params: { 'api-key': HELIUS_API_KEY }
      }
    );

    return response.data[0];
  } catch (error) {
    console.error('Helius getAssetByMint error:', error.message);
    throw error;
  }
};

// Get assets by owner (all NFTs owned by wallet)
const getAssetsByOwner = async (ownerAddress) => {
  try {
    const response = await axios.post(
      `${HELIUS_BASE_URL}/addresses/${ownerAddress}/balances`,
      {},
      {
        params: { 'api-key': HELIUS_API_KEY }
      }
    );

    return response.data.nativeBalance;
  } catch (error) {
    console.error('Helius getAssetsByOwner error:', error.message);
    return null;
  }
};

// Get transaction history
const getTransactionHistory = async (address, before = null) => {
  try {
    const response = await axios.get(
      `${HELIUS_BASE_URL}/addresses/${address}/transactions`,
      {
        params: {
          'api-key': HELIUS_API_KEY,
          before: before,
          limit: 100
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Helius transaction history error:', error.message);
    return [];
  }
};

// Create webhook for transaction monitoring
const createWebhook = async (webhookURL, accountAddresses, transactionTypes = ['Any']) => {
  try {
    const response = await axios.post(
      `${HELIUS_BASE_URL}/webhooks`,
      {
        webhookURL,
        accountAddresses,
        transactionTypes,
        webhookType: 'enhanced'
      },
      {
        params: { 'api-key': HELIUS_API_KEY }
      }
    );

    console.log('✅ Webhook created:', response.data.webhookID);
    return response.data;
  } catch (error) {
    console.error('Webhook creation error:', error.message);
    throw error;
  }
};

// Get compressed NFT proof
const getCompressedNFTProof = async (assetId) => {
  try {
    const response = await axios.post(
      `${HELIUS_BASE_URL}/compressed-nft/proof`,
      { id: assetId },
      {
        params: { 'api-key': HELIUS_API_KEY }
      }
    );

    return response.data;
  } catch (error) {
    console.error('cNFT proof error:', error.message);
    throw error;
  }
};

module.exports = {
  getAssetByMint,
  getAssetsByOwner,
  getTransactionHistory,
  createWebhook,
  getCompressedNFTProof
};

