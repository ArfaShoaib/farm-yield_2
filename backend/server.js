require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { authRoutes, reportRoutes, transactionRoutes } = require('./routes');
const { initializeUmi, treasuryKeypair } = require('./services/solana');

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors({
  origin: ['http://localhost:5173','https://preview--crop-chain-rewards.lovable.app/'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: process.env.SOLANA_NETWORK || 'devnet',
    treasuryConfigured: !!treasuryKeypair,
    merkleTreeConfigured: !!process.env.MERKLE_TREE_ADDRESS
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/reports/:id/metadata', async (req, res) => {
  try {
    const Report = require('./models/Report');
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      name: `${report.cropType.toUpperCase()} Report`,
      description: `Crop report from ${report.location.address.district}, ${report.location.address.province}`,
      image: report.images[0]?.url || '',
      attributes: [
        { trait_type: 'Crop Type', value: report.cropType },
        { trait_type: 'Quantity', value: `${report.quantity.value} ${report.quantity.unit}` },
        { trait_type: 'Location', value: `${report.location.address.district}` },
        { trait_type: 'Status', value: report.status },
        { trait_type: 'Report ID', value: report.reportId }
      ],
      properties: {
        category: 'agriculture',
        creators: [{ address: report.farmerWallet, share: 100 }]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    await connectDB();

    try {
      await initializeUmi();
    } catch (error) {
      console.warn('⚠️  Solana initialization skipped:', error.message);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 FarmYield Backend Server Running`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/health\n`);
      
      if (treasuryKeypair && process.env.MERKLE_TREE_ADDRESS) {
        console.log(`✅ Treasury: ${treasuryKeypair.publicKey.toString()}`);
        console.log(`✅ Merkle Tree: ${process.env.MERKLE_TREE_ADDRESS}\n`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();