
// ===================================
// FILE: backend/scripts/createMerkleTree.js
// Standalone script to create Merkle Tree
// ===================================

require('dotenv').config();
const { createMerkleTree, initializeUmi, connection, treasuryKeypair } = require('../services/solana');

async function main() {
  try {
    console.log('🌳 FarmYield Merkle Tree Creation\n');
    console.log('═══════════════════════════════════════\n');
    
    // Pre-flight checks
    console.log('🔍 Pre-flight Checks:');
    
    if (!treasuryKeypair) {
      throw new Error('Treasury wallet not configured. Check TREASURY_PRIVATE_KEY in .env');
    }
    console.log('   ✅ Treasury wallet loaded');
    console.log('      Address:', treasuryKeypair.publicKey.toString());
    
    // Check balance
    const balance = await connection.getBalance(treasuryKeypair.publicKey);
    console.log('      Balance:', balance / 1e9, 'SOL');
    
    if (balance < 0.1 * 1e9) {
      console.log('\n❌ Insufficient balance!');
      console.log('   Need at least 0.1 SOL to create Merkle tree');
      console.log('   Run: solana airdrop 2', treasuryKeypair.publicKey.toString(), '--url devnet');
      process.exit(1);
    }
    
    // Check if tree already exists
    if (process.env.MERKLE_TREE_ADDRESS) {
      console.log('\n⚠️  MERKLE_TREE_ADDRESS already set in .env:');
      console.log('   ', process.env.MERKLE_TREE_ADDRESS);
      console.log('\n   If you want to create a new tree, remove this from .env first.');
      process.exit(0);
    }
    
    console.log('   ✅ Balance sufficient');
    console.log('   ✅ Network: devnet');
    
    console.log('\n🚀 Initializing UMI...');
    await initializeUmi();
    
    console.log('\n🔨 Creating Merkle Tree...');
    console.log('   This will take 30-60 seconds on devnet');
    console.log('   Please wait...\n');
    
    const tree = await createMerkleTree();
    
    console.log('═══════════════════════════════════════\n');
    console.log('✅ SUCCESS! Merkle Tree Created\n');
    console.log('📋 NEXT STEPS:\n');
    console.log('1️⃣  Open your .env file');
    console.log('2️⃣  Add this line:\n');
    console.log(`    MERKLE_TREE_ADDRESS=${tree}\n`);
    console.log('3️⃣  Save the file');
    console.log('4️⃣  Restart your server\n');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ CREATION FAILED\n');
    console.error('Error:', error.message);
    
    if (error.logs) {
      console.error('\nTransaction Logs:');
      error.logs.forEach(log => console.error('  ', log));
    }
    
    console.error('\n🔧 Troubleshooting:\n');
    console.error('1. Check treasury balance:');
    console.error('   solana balance', treasuryKeypair?.publicKey.toString(), '--url devnet\n');
    console.error('2. Request airdrop:');
    console.error('   solana airdrop 2', treasuryKeypair?.publicKey.toString(), '--url devnet\n');
    console.error('3. Check Solana network status:');
    console.error('   https://status.solana.com\n');
    console.error('4. Verify RPC endpoint is working:');
    console.error('   curl -X POST -H "Content-Type: application/json"');
    console.error('   -d \'{"jsonrpc":"2.0","id":1,"method":"getHealth"}\'');
    console.error('   https://api.devnet.solana.com\n');
    
    process.exit(1);
  }
}

main();