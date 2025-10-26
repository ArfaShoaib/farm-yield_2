// ===================================
// FILE: frontend/src/components/ReportCard.jsx
// Individual Report Card Component
// ===================================

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { MapPin, Package, Calendar, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { reportAPI } from '../utils/api';
import { getExplorerUrl, shortenAddress } from '../utils/solana';

const ReportCard = ({ report, onVote }) => {
  const { connected, publicKey } = useWallet();
  const [voting, setVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (!connected) {
      alert('Please connect your wallet to vote');
      return;
    }

    setVoting(true);
    try {
      await reportAPI.vote(report._id, voteType, '');
      alert(`Vote submitted: ${voteType}`);
      if (onVote) onVote();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Images */}
      {report.images && report.images.length > 0 && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={report.images[0].url}
            alt={report.cropType}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[report.status]}`}>
              {report.status}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {report.cropType.toUpperCase()}
            </h3>
            <p className="text-sm text-gray-500">
              by {shortenAddress(report.farmerWallet)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
              <Package className="w-5 h-5" />
              {report.quantity.value} {report.quantity.unit}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {report.location.address.district}, {report.location.address.province}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>

          {report.metadata.marketPrice && (
            <div className="text-sm text-gray-600">
              <strong>Market Price:</strong> PKR {report.metadata.marketPrice}/{report.quantity.unit}
            </div>
          )}
        </div>

        {/* Verification Info */}
        {report.status === 'pending' && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 mb-2">Community Verification</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold">{report.verification.votes.approve}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold">{report.verification.votes.reject}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500">Need 3 approvals</span>
            </div>
          </div>
        )}

        {/* Blockchain Info */}
        {report.blockchain.mintTxSignature && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 mb-1">Blockchain Verified</p>
            <a
              href={getExplorerUrl(report.blockchain.mintTxSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View cNFT on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Actions */}
        {report.status === 'pending' && connected && (
          <div className="flex gap-2">
            <button
              onClick={() => handleVote('approve')}
              disabled={voting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleVote('reject')}
              disabled={voting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}

        {report.status === 'verified' && (
          <div className="text-center text-sm text-green-600 font-semibold">
            ✓ Verified by Community
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;

