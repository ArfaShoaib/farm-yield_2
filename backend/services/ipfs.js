
// ===================================
// FILE: backend/services/ipfs.js
// IPFS/NFT.Storage Integration
// ===================================

const { NFTStorage, File } = require('nft.storage');

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

if (!NFT_STORAGE_KEY) {
  console.warn('⚠️  NFT_STORAGE_KEY not set. Image uploads will fail.');
}

const client = NFT_STORAGE_KEY ? new NFTStorage({ token: NFT_STORAGE_KEY }) : null;

// Upload file to IPFS
const uploadToIPFS = async (fileBuffer, filename) => {
  try {
    if (!client) {
      throw new Error('NFT.Storage not configured');
    }

    const file = new File([fileBuffer], filename);
    const cid = await client.storeBlob(file);

    console.log(`✅ File uploaded to IPFS: ${cid}`);

    return {
      cid: cid,
      url: `https://nftstorage.link/ipfs/${cid}`,
      gateway: `https://ipfs.io/ipfs/${cid}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error.message);
    throw error;
  }
};

// Upload JSON metadata to IPFS
const uploadMetadata = async (metadata) => {
  try {
    if (!client) {
      throw new Error('NFT.Storage not configured');
    }

    const metadataString = JSON.stringify(metadata);
    const file = new File([metadataString], 'metadata.json', { 
      type: 'application/json' 
    });
    
    const cid = await client.storeBlob(file);

    console.log(`✅ Metadata uploaded to IPFS: ${cid}`);

    return {
      cid: cid,
      url: `https://nftstorage.link/ipfs/${cid}`
    };
  } catch (error) {
    console.error('Metadata upload error:', error.message);
    throw error;
  }
};

// Upload complete NFT (metadata + images)
const uploadNFT = async (name, description, imageBuffer, attributes = []) => {
  try {
    if (!client) {
      throw new Error('NFT.Storage not configured');
    }

    const imageFile = new File([imageBuffer], 'image.jpg', { type: 'image/jpeg' });
    
    const metadata = await client.store({
      name,
      description,
      image: imageFile,
      attributes
    });

    console.log(`✅ NFT uploaded to IPFS: ${metadata.url}`);

    return {
      metadataUrl: metadata.url,
      ipnft: metadata.ipnft,
      data: metadata.data
    };
  } catch (error) {
    console.error('NFT upload error:', error.message);
    throw error;
  }
};

// Get file from IPFS
const getFromIPFS = async (cid) => {
  try {
    const url = `https://nftstorage.link/ipfs/${cid}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`IPFS fetch failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('IPFS fetch error:', error.message);
    throw error;
  }
};

module.exports = {
  uploadToIPFS,
  uploadMetadata,
  uploadNFT,
  getFromIPFS
};

