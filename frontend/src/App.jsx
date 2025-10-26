// ===================================
// FILE: frontend/src/App.jsx
// Main Application Component
// ===================================

import { useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Sprout, Map, FileText, Plus } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import ReportForm from './components/ReportForm';
import MapDashboard from './components/MapDashboard';
import ReportList from './components/ReportList';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const [activeTab, setActiveTab] = useState('form');

  // Solana network setup
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  const tabs = [
    { id: 'form', label: 'Submit Report', icon: Plus },
    { id: 'reports', label: 'All Reports', icon: FileText },
    { id: 'map', label: 'Map View', icon: Map },
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-md">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Sprout className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">FarmYield</h1>
                      <p className="text-sm text-gray-600">Decentralized Agri-Info Network</p>
                    </div>
                  </div>
                  <WalletConnect />
                </div>
              </div>
            </header>

            {/* Navigation */}
            <div className="container mx-auto px-4 py-6">
              <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <main className="container mx-auto px-4 pb-12">
              {activeTab === 'form' && <ReportForm onSuccess={() => setActiveTab('reports')} />}
              {activeTab === 'reports' && <ReportList />}
              {activeTab === 'map' && <MapDashboard />}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
              <div className="container mx-auto px-4 py-6 text-center text-gray-600">
                <p className="text-sm">
                  Built on Solana • Powered by Metaplex Bubblegum & Helius
                </p>
                <p className="text-xs mt-2 text-gray-500">
                  Empowering farmers with blockchain technology 🌾
                </p>
              </div>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

