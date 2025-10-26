// ===================================
// FILE: frontend/src/components/WalletConnect.jsx
// Wallet Connection Component
// ===================================

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, TrendingUp } from 'lucide-react';
import { getBalance } from '../utils/solana';
import { authAPI, setWalletHeader } from '../utils/api';

const WalletConnect = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      
      // Set wallet header for API calls
      setWalletHeader(walletAddress);
      
      // Login/register user
      authAPI.login(walletAddress)
        .then(res => setUser(res.data.user))
        .catch(err => console.error('Login failed:', err));
      
      // Get balance
      getBalance(walletAddress)
        .then(bal => setBalance(bal))
        .catch(err => console.error('Balance fetch failed:', err));
    } else {
      setWalletHeader(null);
      setUser(null);
      setBalance(0);
    }
  }, [connected, publicKey]);

  return (
    <div className="flex items-center gap-4">
      {connected && user && (
        <div className="hidden md:flex items-center gap-4 bg-white rounded-lg px-4 py-2 shadow">
          <div className="text-right">
            <p className="text-xs text-gray-500">Balance</p>
            <p className="text-sm font-semibold">{balance.toFixed(4)} SOL</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Reports</p>
            <p className="text-sm font-semibold">{user.totalReports}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Reputation</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              {user.reputationScore}
              <TrendingUp className="w-3 h-3 text-green-600" />
            </p>
          </div>
        </div>
      )}
      
      <WalletMultiButton className="!bg-green-600 hover:!bg-green-700" />
    </div>
  );
};

export default WalletConnect;

