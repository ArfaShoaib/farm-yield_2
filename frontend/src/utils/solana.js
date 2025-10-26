// ===================================
// FILE: frontend/src/utils/solana.js
// Solana Wallet Utilities
// ===================================

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const connection = new Connection(RPC_URL, 'confirmed');

export const getBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
};

export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const getExplorerUrl = (signature, type = 'tx') => {
  const baseUrl = NETWORK === 'devnet' 
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com?cluster=${NETWORK}`;
  return `${baseUrl}/${type}/${signature}`;
};

export const requestAirdrop = async (publicKey) => {
  try {
    const signature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    throw error;
  }
};
