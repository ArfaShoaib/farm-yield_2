const fs = require('fs');
const bs58 = require('bs58');

const file = process.argv[2] || './treasury-keypair.json';
const raw = fs.readFileSync(file, 'utf8').trim();

let secretBytes;

try {
  // If file is JSON (array or object), parse it
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    secretBytes = Uint8Array.from(parsed);
  } else if (parsed?.secretKey && Array.isArray(parsed.secretKey)) {
    secretBytes = Uint8Array.from(parsed.secretKey);
  } else {
    throw new Error('Unrecognized JSON keypair format');
  }
} catch (err) {
  // Not a JSON array/object — maybe already a base58 string or raw bytes
  try {
    // if it's already Base58, just print it
    const decoded = bs58.decode(raw);
    // If decode succeeded, raw is base58 already
    console.log('\n✅ Input already looks like a Base58 private key. Use this value:');
    console.log(raw);
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Failed to parse keypair file:', err.message);
    process.exit(1);
  }
}

// bs58 library sometimes exports function as default; support both
const encode = bs58.encode || (bs58.default && bs58.default.encode);

if (!encode) {
  console.error('❌ bs58 encode not available. Try: npm install bs58');
  process.exit(1);
}

const base58Key = encode(secretBytes);

console.log('\n✅ Base58 Private Key:');
console.log(base58Key);
console.log('\n📝 Add this to your .env (NO quotes):');
console.log(`TREASURY_PRIVATE_KEY=${base58Key}\n`);
