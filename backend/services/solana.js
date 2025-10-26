// ===================================
// FILE: backend/services/solana.js
// COMPLETE PROPER IMPLEMENTATION
// ===================================

const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} = require('@solana/web3.js');
const bs58 = require('bs58');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { 
  createTree,
  mintV1,
  mplBubblegum 
} = require('@metaplex-foundation/mpl-bubblegum');
const {
  generateSigner,
  keypairIdentity,
  publicKey,
  percentAmount,
  signerIdentity,
  createSignerFromKeypair
} = require('@metaplex-foundation/umi');
const Report = require('../models/Report');
const User = require('../models/User');
const TxModel = require('../models/Transaction');

// Initialize Solana connection
const connection = new Connection(
  process.env.HELIUS_API_KEY 
    ? `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Load treasury wallet from private key
// let treasuryKeypair;
// try {
//   const privateKeyString = process.env.TREASURY_PRIVATE_KEY;
//   if (!privateKeyString) {
//     console.warn('⚠️  TREASURY_PRIVATE_KEY not set. Rewards will be disabled.');
//   } else {
//     let privateKeyBytes;
//     try {
//       // Try as base58 string first
//       privateKeyBytes = bs58.decode(privateKeyString);
//     } catch (e) {
//       // If that fails, try as JSON array
//       privateKeyBytes = new Uint8Array(JSON.parse(privateKeyString));
//     }
    
//     treasuryKeypair = Keypair.fromSecretKey(privateKeyBytes);
//     console.log('✅ Treasury wallet loaded:', treasuryKeypair.publicKey.toString());
//   }
// } catch (error) {
//   console.error('❌ Failed to load treasury wallet:', error.message);
// }

// Load treasury wallet from private key
// Load treasury wallet from private key
let treasuryKeypair;
try {
  const privateKeyString = process.env.TREASURY_PRIVATE_KEY;
  if (!privateKeyString) {
    console.warn('⚠️  TREASURY_PRIVATE_KEY not set. Rewards will be disabled.');
  } else {
    console.log('🔑 Attempting to load treasury wallet...');
    console.log('   Key starts with:', privateKeyString.substring(0, 10) + '...');
    
    let privateKeyBytes;
    
    // Try base58 decode first (standard Solana format)
    try {
      privateKeyBytes = bs58.decode(privateKeyString);
      console.log('✅ Decoded as base58 string');
    } catch (e1) {
      console.log('⚠️  Base58 decode failed, trying JSON array...');
      // Try JSON array format
      try {
        privateKeyBytes = new Uint8Array(JSON.parse(privateKeyString));
        console.log('✅ Parsed as JSON array');
      } catch (e2) {
        throw new Error(`Invalid key format. Base58 error: ${e1.message}, JSON error: ${e2.message}`);
      }
    }
    
    treasuryKeypair = Keypair.fromSecretKey(privateKeyBytes);
    console.log('✅ Treasury wallet loaded:', treasuryKeypair.publicKey.toString());
  }
} catch (error) {
  console.error('❌ Failed to load treasury wallet:', error.message);
  treasuryKeypair = null;
}


// Initialize UMI for Metaplex
let umi;
let merkleTree;

const initializeUmi = async () => {
  try {
    umi = createUmi(connection.rpcEndpoint).use(mplBubblegum());

    if (treasuryKeypair) {
      // PROPER WAY: Create UMI keypair from Solana web3.js keypair
      const umiKeypair = umi.eddsa.createKeypairFromSecretKey(treasuryKeypair.secretKey);
      const umiSigner = createSignerFromKeypair(umi, umiKeypair);
      umi.use(signerIdentity(umiSigner));
      
      console.log('✅ UMI initialized with signer');
    } else {
      console.warn('⚠️  UMI initialized without signer (treasury not configured)');
    }

    return umi;
  } catch (error) {
    console.error('❌ UMI initialization failed:', error.message);
    throw error;
  }
};

// Create Merkle Tree for cNFTs (run once)
const createMerkleTree = async () => {
  try {
    if (!umi) {
      console.log('Initializing UMI...');
      await initializeUmi();
    }
    
    if (!treasuryKeypair) {
      throw new Error('Treasury wallet not configured. Cannot create Merkle tree.');
    }

    console.log('🌳 Generating Merkle Tree signer...');
    const merkleTreeSigner = generateSigner(umi);
    
    console.log('   Tree will be created at:', merkleTreeSigner.publicKey);
    console.log('   Payer:', treasuryKeypair.publicKey.toString());
    
    // Check balance first
    const balance = await connection.getBalance(treasuryKeypair.publicKey);
    console.log(`   Treasury balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      throw new Error(`Insufficient balance. Need at least 0.1 SOL, have ${balance / LAMPORTS_PER_SOL} SOL`);
    }
    
    console.log('\n🔨 Building create tree transaction...');
    
    // Create tree transaction builder
    const builder = await createTree(umi, {
      merkleTree: merkleTreeSigner,
      maxDepth: 14, // Max 16,384 NFTs
      maxBufferSize: 64,
      canopyDepth: 0,
    });

    console.log('📤 Sending transaction to Solana...');
    console.log('   (This may take 30-60 seconds on devnet)');
    
    // Send and confirm the transaction
    const result = await builder.sendAndConfirm(umi);
    
    merkleTree = merkleTreeSigner.publicKey;
    const signature = bs58.encode(result.signature);
    
    console.log('\n✅ Merkle tree created successfully!');
    console.log('   Tree Address:', merkleTree);
    console.log('   Transaction:', signature);
    console.log('   Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log('\n📝 IMPORTANT: Add this to your .env file:');
    console.log(`   MERKLE_TREE_ADDRESS=${merkleTree}\n`);

    return merkleTree;
  } catch (error) {
    console.error('\n❌ Failed to create Merkle tree:', error.message);
    
    // More detailed error info
    if (error.logs) {
      console.error('Transaction logs:');
      error.logs.forEach(log => console.error('  ', log));
    }
    
    throw error;
  }
};

// Get or create Merkle Tree
const getMerkleTree = async () => {
  if (merkleTree) return merkleTree;

  if (process.env.MERKLE_TREE_ADDRESS) {
    try {
      merkleTree = publicKey(process.env.MERKLE_TREE_ADDRESS);
      console.log('✅ Using existing Merkle tree:', merkleTree);
      return merkleTree;
    } catch (error) {
      console.error('Invalid MERKLE_TREE_ADDRESS in .env:', error.message);
      return null;
    }
  }

  console.warn('⚠️  No MERKLE_TREE_ADDRESS found. Skipping tree setup.');
  return null;
};

// Mint compressed NFT for crop report
const mintReportCNFT = async (reportId, farmerWallet, metadata) => {
  try {
    if (!umi) await initializeUmi();
    
    if (!treasuryKeypair) {
      console.warn('⚠️  Treasury not configured, skipping cNFT mint');
      return null;
    }
    
    const tree = await getMerkleTree();
    if (!tree) {
      console.warn('⚠️  No Merkle tree available, skipping cNFT mint');
      return null;
    }
    
    console.log(`🎨 Minting cNFT for report ${reportId}...`);
    
    // Prepare metadata
    const nftMetadata = {
      name: `${metadata.cropType.toUpperCase()} Report - ${reportId.slice(0, 8)}`,
      symbol: 'FARMYLD',
      uri: `https://farmyield.app/api/reports/${reportId}/metadata`,
      sellerFeeBasisPoints: percentAmount(0),
      collection: null,
      creators: [
        {
          address: publicKey(farmerWallet),
          verified: false,
          share: 100,
        },
      ],
    };

    const leafOwner = publicKey(farmerWallet);
    const leafDelegate = publicKey(farmerWallet);

    // Mint cNFT
    const mintBuilder = await mintV1(umi, {
      leafOwner,
      leafDelegate,
      merkleTree: tree,
      metadata: nftMetadata,
    });

    const result = await mintBuilder.sendAndConfirm(umi);

    const signature = bs58.encode(result.signature);
    console.log(`✅ cNFT minted: ${signature}`);

    // Update report with blockchain data
    const report = await Report.findById(reportId);
    if (report) {
      report.blockchain.mintTxSignature = signature;
      report.blockchain.treeAddress = tree.toString();
      await report.save();
    }

    // Save transaction
    await TxModel.create({
      txSignature: signature,
      type: 'mint_cnft',
      toWallet: farmerWallet,
      reportId: reportId,
      metadata: {
        cropType: metadata.cropType,
        description: 'Crop report cNFT minted'
      },
      status: 'confirmed',
      blockTime: new Date()
    });

    return signature;
  } catch (error) {
    console.error('❌ cNFT minting failed:', error.message);
    return null;
  }
};

// Send SOL reward to farmer
const sendReward = async (recipientWallet, amountSOL, reportId) => {
  try {
    if (!treasuryKeypair) {
      console.warn('⚠️  Treasury wallet not configured. Skipping reward.');
      return null;
    }

    const recipientPublicKey = new PublicKey(recipientWallet);
    const lamports = amountSOL * LAMPORTS_PER_SOL;

    // Check treasury balance
    const balance = await connection.getBalance(treasuryKeypair.publicKey);
    if (balance < lamports) {
      console.error('❌ Insufficient treasury balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      console.log('💡 Airdrop SOL: solana airdrop 2', treasuryKeypair.publicKey.toString(), '--url devnet');
      return null;
    }

    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryKeypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: Math.floor(lamports),
      })
    );

    // Send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasuryKeypair],
      { commitment: 'confirmed' }
    );

    console.log(`✅ Reward sent: ${amountSOL} SOL to ${recipientWallet}`);
    console.log(`   TX: ${signature}`);

    // Update user earnings
    const user = await User.findOne({ walletAddress: recipientWallet });
    if (user) {
      user.totalEarned += amountSOL;
      await user.save();
    }

    // Save transaction
    await TxModel.create({
      txSignature: signature,
      type: 'reward',
      fromWallet: treasuryKeypair.publicKey.toString(),
      toWallet: recipientWallet,
      amount: amountSOL,
      reportId: reportId,
      metadata: {
        description: 'Report verification reward'
      },
      status: 'confirmed',
      blockTime: new Date()
    });

    return signature;
  } catch (error) {
    console.error('❌ Reward transfer failed:', error.message);
    return null;
  }
};

// Get wallet balance
const getBalance = async (walletAddress) => {
  try {
    const pubKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(pubKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get balance:', error.message);
    return 0;
  }
};

// Verify transaction on-chain
const verifyTransaction = async (signature) => {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    return {
      verified: tx !== null,
      blockTime: tx?.blockTime,
      slot: tx?.slot,
      err: tx?.meta?.err
    };
  } catch (error) {
    console.error('Transaction verification failed:', error.message);
    return { verified: false, error: error.message };
  }
};

// Award badge (mint badge cNFT)
const awardBadge = async (walletAddress, badgeType) => {
  try {
    if (!umi) await initializeUmi();
    
    if (!treasuryKeypair) {
      console.warn('⚠️  Treasury not configured, skipping badge mint');
      return null;
    }
    
    const tree = await getMerkleTree();
    if (!tree) {
      console.warn('⚠️  No Merkle tree available, skipping badge mint');
      return null;
    }

    const badgeMetadata = {
      name: `FarmYield Badge: ${badgeType}`,
      symbol: 'FYBADGE',
      uri: `https://farmyield.app/badges/${badgeType}.json`,
      sellerFeeBasisPoints: percentAmount(0),
      collection: null,
      creators: [
        {
          address: publicKey(walletAddress),
          verified: false,
          share: 100,
        },
      ],
    };

    const leafOwner = publicKey(walletAddress);
    const leafDelegate = publicKey(walletAddress);

    const mintBuilder = await mintV1(umi, {
      leafOwner,
      leafDelegate,
      merkleTree: tree,
      metadata: badgeMetadata,
    });

    const result = await mintBuilder.sendAndConfirm(umi);

    const signature = bs58.encode(result.signature);
    console.log(`✅ Badge awarded: ${badgeType} to ${walletAddress}`);

    // Update user badges
    const user = await User.findOne({ walletAddress });
    if (user) {
      user.badges.push({
        type: badgeType,
        earnedAt: new Date(),
        cnftMint: signature
      });
      await user.save();
    }

    // Save transaction
    await TxModel.create({
      txSignature: signature,
      type: 'badge',
      toWallet: walletAddress,
      metadata: {
        description: `Badge: ${badgeType}`
      },
      status: 'confirmed',
      blockTime: new Date()
    });

    return signature;
  } catch (error) {
    console.error('Badge awarding failed:', error.message);
    return null;
  }
};

module.exports = {
  connection,
  initializeUmi,
  createMerkleTree,
  getMerkleTree,
  mintReportCNFT,
  sendReward,
  getBalance,
  verifyTransaction,
  awardBadge,
  treasuryKeypair
};

