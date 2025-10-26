# 🌾 FarmYield - Decentralized Agricultural Information Network

![FarmYield Banner](https://img.shields.io/badge/Solana-Powered-blueviolet) ![License](https://img.shields.io/badge/license-MIT-green) ![Build](https://img.shields.io/badge/build-passing-brightgreen)

**FarmYield** is a blockchain-powered platform that incentivizes small-scale farmers to report crop yields and harvest data by rewarding them with cryptocurrency tokens. By creating a decentralized agricultural information network, FarmYield helps farmers gain access to fair market pricing, government subsidies, and data-driven insights.

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Blockchain Integration](#-blockchain-integration)
- [User Flows](#-user-flows)
- [Setup Instructions](#-setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
---

## 🌍 Problem Statement

Agriculture employs **40% of Pakistan's workforce**, yet small farmers in rural areas face critical challenges:

- **Lack of Market Data**: Farmers have no access to real-time crop yield information, leading to price exploitation by middlemen
- **Information Asymmetry**: Agricultural departments lack ground-level data for policy decisions
- **Subsidy Distribution**: Difficulty in identifying genuine farmers for government aid programs
- **Market Inefficiency**: No transparent pricing mechanisms based on actual supply data

**Result**: Small farmers in regions like Khyber Pakhtunkhwa and rural Punjab are trapped in cycles of poverty despite producing essential crops.

---

## 💡 Solution

**FarmYield** creates a **token-incentivized, decentralized agricultural data network** where:

1. **Farmers submit geo-tagged crop reports** with photos of their harvests
2. **Community verification** ensures data authenticity through voting
3. **Blockchain rewards** (0.01 SOL per verified report) incentivize participation
4. **Public dashboard** displays aggregated data for pricing transparency
5. **Compressed NFTs (cNFTs)** serve as immutable proof of harvest records

### Key Features

✅ **Mobile-First Design**: Simple form for farmers with basic smartphones  
✅ **Instant Crypto Rewards**: Automatic SOL payments upon verification  
✅ **Community Governance**: Peer-to-peer validation prevents fraud  
✅ **Public Data Access**: Open API for researchers, NGOs, and policymakers  
✅ **Low Transaction Costs**: Solana's compressed NFTs cost <$0.001 per mint  
✅ **Offline Support**: Reports can be queued and submitted when online  

---

## 🔗 Blockchain Integration

### Why Solana?

FarmYield leverages **Solana blockchain** for several critical reasons:

1. **Speed**: 65,000 TPS ensures instant reward payments
2. **Low Costs**: Transaction fees <$0.00025 make micro-rewards viable
3. **Scalability**: Can handle millions of farmers without congestion
4. **Finality**: 400ms block times mean instant confirmation

### Blockchain Components

#### 1. Compressed NFTs (cNFTs)
Each verified crop report is minted as a **compressed NFT** using Metaplex Bubblegum:
- **Cost**: <$0.001 per mint (vs $0.02 for standard NFTs)
- **Storage**: Merkle tree compression reduces on-chain data by 99%
- **Purpose**: Immutable proof of harvest records
- **Metadata**: Includes crop type, quantity, location, timestamp

```javascript
// Example cNFT Metadata
{
  "name": "WHEAT Report - RPT-1234",
  "symbol": "FARMYLD",
  "attributes": [
    { "trait_type": "Crop Type", "value": "wheat" },
    { "trait_type": "Quantity", "value": "500 kg" },
    { "trait_type": "Location", "value": "Multan, Punjab" }
  ]
}
```

#### 2. SPL Token Rewards
- **Treasury Wallet**: Holds SOL for automated reward distribution
- **Reward Amount**: 0.01 SOL (~$2 USD at current prices) per verified report
- **Trigger**: Automatic payment when report receives 3+ community approvals
- **Transaction**: Native Solana transfer (System Program)

#### 3. Helius RPC & Indexing
- **Enhanced RPC**: Faster and more reliable than public endpoints
- **Webhooks**: Real-time monitoring of reward transactions
- **Asset API**: Query cNFT ownership and metadata
- **Transaction History**: Track all on-chain activity

#### 4. Solana Actions/Blinks
- **Share-to-Earn**: Generate transaction links for mobile sharing
- **QR Codes**: Offline farmers can generate payment requests
- **Deep Links**: Direct wallet integration for seamless UX

### On-Chain Data Flow

```
1. Farmer submits report → Store metadata in MongoDB
2. Upload images → IPFS (NFT.Storage)
3. Mint cNFT → Metaplex Bubblegum (compressed)
4. Community votes → Off-chain (MongoDB) + optional on-chain
5. Auto-verify at 3 votes → Trigger reward transfer
6. Send 0.01 SOL → Native Solana transfer
7. Update transaction record → MongoDB + Helius webhook
```

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Blockchain**: Solana Web3.js, Metaplex SDKs
- **Storage**: IPFS (NFT.Storage)
- **Indexing**: Helius API

### Frontend
- **Framework**: React 18 + Vite
- **Wallet**: Solana Wallet Adapter
- **Maps**: Leaflet.js (React-Leaflet)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Blockchain Tools
- **Network**: Solana Devnet (Mainnet-ready)
- **Wallets**: Phantom, Solflare
- **NFTs**: Metaplex Bubblegum (cNFTs)
- **RPC**: Helius Enhanced RPC
- **Storage**: NFT.Storage (IPFS)

---

## 👥 User Flows

### Flow 1: Farmer Submits Crop Report

```
1. Connect Phantom Wallet (Devnet)
2. Click "Submit Report" tab
3. Fill form:
   - Select crop type (wheat, rice, cotton, etc.)
   - Enter quantity (kg/tons/maunds)
   - Enable location (auto-fills GPS coordinates)
   - Upload 1-5 photos of harvest
   - Optional: Add market price, soil type
4. Click "Submit Report & Mint cNFT"
5. System:
   - Uploads images to IPFS
   - Stores report in MongoDB
   - Mints compressed NFT to farmer's wallet
   - Status: "Pending Verification"
6. Farmer receives notification: "Report submitted! Awaiting community verification."
```

### Flow 2: Community Verifies Report

```
1. Verifier (any connected wallet) clicks "All Reports" tab
2. Filters by "Pending" status
3. Views report details:
   - Crop photos
   - GPS location on map
   - Farmer's reputation score
4. Clicks "Approve" or "Reject"
5. System:
   - Records vote in database
   - Updates vote counter (e.g., 2/3 approvals)
6. When 3rd approval received:
   - Status changes to "Verified"
   - Treasury automatically sends 0.01 SOL to farmer
   - Farmer's reputation score increases
   - Transaction appears in Solana Explorer
```

### Flow 3: View Market Data on Map

```
1. Click "Map View" tab
2. Interactive map displays:
   - Green markers = Verified reports
   - Yellow markers = Pending reports
3. Filter by crop type (wheat, rice, etc.)
4. Click marker to see:
   - Crop details
   - Quantity harvested
   - Market price (if provided)
   - Verification status
   - Link to Solana Explorer (cNFT transaction)
5. Aggregated stats show:
   - Total reports in region
   - Average yield per crop
   - Price trends
```

### Flow 4: Track Earnings & Reputation

```
1. Farmer's profile displays:
   - Total Reports: 12
   - Verified Reports: 10
   - Total Earned: 0.10 SOL (~$20)
   - Reputation Score: 83%
2. Transaction history shows:
   - Each reward payment
   - cNFT mint confirmations
   - Explorer links for verification
3. Badges earned:
   - "First Report" badge (cNFT)
   - "10 Verified Reports" badge (cNFT)
   - "Top Contributor" badge (cNFT)
```

---

## 🚀 Setup Instructions

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [Atlas free tier](https://www.mongodb.com/cloud/atlas))
- **Solana CLI** ([Installation guide](https://docs.solana.com/cli/install-solana-cli-tools))
- **Phantom Wallet** ([Install extension](https://phantom.app/))
- **Git** ([Download](https://git-scm.com/))

### Clone Repository

```bash
git clone https://github.com/yourusername/farmyield.git
cd farmyield
```

---

## 📦 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Configure `.env`

```env
# Server
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/farmyield
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmyield

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
HELIUS_API_KEY=your_helius_key_here

# Treasury Wallet
TREASURY_PRIVATE_KEY=your_base58_private_key

# IPFS
NFT_STORAGE_KEY=your_nft_storage_key

# Security
JWT_SECRET=your_random_secret_here

# Blockchain
MERKLE_TREE_ADDRESS=
```

### 4. Generate Treasury Wallet

```bash
# Generate new devnet wallet
solana-keygen new --outfile treasury-keypair.json

# Get public key
solana-keygen pubkey treasury-keypair.json
# Output: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# Convert to base58 for .env
node -e "const fs=require('fs'); const bs58=require('bs58'); const k=JSON.parse(fs.readFileSync('treasury-keypair.json')); console.log(bs58.encode(Buffer.from(k)));"

# Airdrop devnet SOL (for rewards)
solana airdrop 2 YOUR_PUBLIC_KEY --url devnet
```

### 5. Get API Keys (All Free)

**Helius API** (Enhanced RPC):
1. Visit [helius.dev](https://helius.dev)
2. Sign up and create project
3. Copy API key to `.env`

**NFT.Storage** (IPFS):
1. Visit [nft.storage](https://nft.storage)
2. Sign up with email
3. Generate API key
4. Copy to `.env`

### 6. Create Merkle Tree (One-Time)

```bash
# Start server first
npm run dev

# In another terminal, create tree
node scripts/createMerkleTree.js

# Output:
# ✅ Merkle tree created: ABC123XYZ...
# Add to .env: MERKLE_TREE_ADDRESS=ABC123XYZ...

# Copy the address to .env, then restart server
```

### 7. Seed Sample Data (Optional)

```bash
node scripts/seedData.js
```

This creates:
- 3 sample users
- 5 crop reports (verified & pending)
- Test data for map visualization

### 8. Start Backend

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Backend runs at: **http://localhost:5001**

### 9. Verify Backend

```bash
# Test health endpoint
curl http://localhost:5001/health

# Expected output:
# {
#   "status": "ok",
#   "timestamp": "2024-10-26T...",
#   "network": "devnet",
#   "treasuryConfigured": true,
#   "merkleTreeConfigured": true
# }
```

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

### 4. Configure `.env`

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 5. Start Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend runs at: **http://localhost:5173**

### 6. Configure Phantom Wallet

1. Install [Phantom extension](https://phantom.app/)
2. Create/import wallet
3. **Switch to Devnet**:
   - Settings → Developer Settings → Change Network → Devnet
4. Request devnet SOL: [faucet.solana.com](https://faucet.solana.com/)

### 7. Test the Application

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Approve Phantom connection
4. Submit a test crop report
5. View report in "All Reports" tab
6. Vote on pending reports
7. Check map visualization

---

## 🔐 Environment Variables

### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5001` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/farmyield` |
| `SOLANA_NETWORK` | Solana network (devnet/mainnet-beta) | Yes | `devnet` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | Yes | `https://api.devnet.solana.com` |
| `HELIUS_API_KEY` | Helius enhanced RPC key | Yes | `abc123...` |
| `TREASURY_PRIVATE_KEY` | Base58 treasury wallet key | Yes | `5J7K8L...` |
| `NFT_STORAGE_KEY` | NFT.Storage API key | Yes | `eyJhbG...` |
| `JWT_SECRET` | JWT signing secret | Yes | `random_secret_string` |
| `MERKLE_TREE_ADDRESS` | cNFT Merkle tree address | Yes | `ABC123XYZ...` |

### Frontend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | `http://localhost:5001/api` |
| `VITE_SOLANA_NETWORK` | Solana network | Yes | `devnet` |
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint | Yes | `https://api.devnet.solana.com` |

---

## 📚 API Documentation

### Authentication

**Login/Register User**
```http
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "7xKXtg2CW...",
  "username": "Farmer Ahmed",
  "location": {
    "district": "Multan",
    "province": "Punjab"
  }
}
```

### Reports

**Submit Crop Report**
```http
POST /api/reports/submit
Content-Type: multipart/form-data
x-wallet-address: 7xKXtg2CW...

{
  "cropType": "wheat",
  "quantity": 500,
  "unit": "kg",
  "latitude": 30.1575,
  "longitude": 71.5249,
  "district": "Multan",
  "province": "Punjab",
  "images": [File, File]
}
```

**Get All Reports**
```http
GET /api/reports?status=verified&cropType=wheat&limit=50
```

**Vote on Report**
```http
POST /api/reports/:id/vote
Content-Type: application/json
x-wallet-address: 9cnaWqT8u...

{
  "voteType": "approve",
  "comment": "Looks legitimate"
}
```

### Map Data

**Get Aggregated Map Data**
```http
GET /api/reports/map/data
```

---

## 🌐 Deployment

### Backend Deployment (Render.com)

1. Push code to GitHub
2. Create account on [Render.com](https://render.com)
3. New Web Service → Connect Repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add all environment variables
6. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Create account on [Vercel.com](https://vercel.com)
3. Import repository
4. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOLANA_NETWORK=devnet
   ```
6. Deploy

### Database (MongoDB Atlas)

1. Create free M0 cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP: 0.0.0.0/0 (for development)
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in backend


### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Test on devnet before PR

---

## 🙏 Acknowledgments

- **Solana Foundation** - For blockchain infrastructure
- **Metaplex** - For compressed NFT standards
- **Helius** - For enhanced RPC and indexing
- **NFT.Storage** - For decentralized IPFS storage
- **OpenStreetMap** - For map visualization

---

## 🚀 Roadmap

- [x] MVP with cNFT minting
- [x] Community verification system
- [x] Interactive map dashboard
- [ ] Mobile app (React Native)
- [ ] SMS-based reporting (for feature phones)
- [ ] Government API integration
- [ ] Multi-language support (Urdu, Punjabi)
- [ ] Mainnet deployment
- [ ] Token governance (DAO)

---

**Built with ❤️ for farmers by farmers**

*Empowering agricultural communities through blockchain technology* 🌾
# farm-yield_2
