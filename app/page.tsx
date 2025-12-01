'use client';

import { WalletConnect } from './components/WalletConnect';
import { CreateStreamForm } from './components/CreateStreamForm';
import { StreamList } from './components/StreamList';
import { useState } from 'react';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStreamCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FlowSol
          </h1>
          <p className="text-gray-600">
            Real-time Payment Streaming on Solana
          </p>
        </header>

        <div className="mb-8 flex justify-center">
          <WalletConnect />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div>
            <CreateStreamForm onStreamCreated={handleStreamCreated} />
          </div>

          <div>
            <StreamList key={refreshKey} />
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Built with Anchor and Next.js on Solana Devnet</p>
        </footer>
      </div>
    </main>
  );
}
