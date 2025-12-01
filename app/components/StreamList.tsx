'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface Stream {
  address: string;
  sender: string;
  receiver: string;
  ratePerSecond: number;
  startTime: number;
  totalDeposited: number;
  totalWithdrawn: number;
  isActive: boolean;
  claimable: number;
}

export const StreamList = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      loadStreams();
    }
  }, [publicKey]);

  const loadStreams = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      // Here you would fetch streams from the blockchain
      // For demo purposes, we'll use mock data
      const mockStreams: Stream[] = [
        {
          address: 'stream1',
          sender: 'Alice',
          receiver: publicKey.toString(),
          ratePerSecond: 0.001,
          startTime: Date.now() - 3600000,
          totalDeposited: 100,
          totalWithdrawn: 3.6,
          isActive: true,
          claimable: 0.5,
        },
      ];

      setStreams(mockStreams);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (streamAddress: string) => {
    if (!publicKey) return;

    setWithdrawing(streamAddress);
    try {
      // Here you would integrate with the Anchor program to withdraw
      console.log('Withdrawing from stream:', streamAddress);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Withdrawal successful!');
      await loadStreams();
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw');
    } finally {
      setWithdrawing(null);
    }
  };

  const handleCloseStream = async (streamAddress: string) => {
    if (!publicKey) return;

    if (!confirm('Are you sure you want to close this stream?')) {
      return;
    }

    try {
      // Here you would integrate with the Anchor program to close stream
      console.log('Closing stream:', streamAddress);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Stream closed successfully!');
      await loadStreams();
    } catch (error) {
      console.error('Error closing stream:', error);
      alert('Failed to close stream');
    }
  };

  if (!publicKey) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-4">Your Streams</h3>
        <p className="text-gray-600">Please connect your wallet to view streams</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-4">Your Streams</h3>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Your Streams</h3>
        <button
          onClick={loadStreams}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {streams.length === 0 ? (
        <p className="text-gray-600">No active streams found</p>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => (
            <div
              key={stream.address}
              className="p-4 border border-gray-200 rounded-md bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    From: {stream.sender.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-600">
                    Rate: {stream.ratePerSecond} tokens/sec
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  stream.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {stream.isActive ? 'Active' : 'Closed'}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {stream.totalWithdrawn.toFixed(2)} / {stream.totalDeposited} tokens
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(stream.totalWithdrawn / stream.totalDeposited) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Claimable:</p>
                  <p className="text-lg font-semibold text-green-600">
                    {stream.claimable.toFixed(4)} tokens
                  </p>
                </div>

                <div className="flex gap-2">
                  {stream.isActive && stream.receiver === publicKey.toString() && (
                    <button
                      onClick={() => handleWithdraw(stream.address)}
                      disabled={withdrawing === stream.address || stream.claimable === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {withdrawing === stream.address ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}

                  {stream.isActive && stream.sender === publicKey.toString() && (
                    <button
                      onClick={() => handleCloseStream(stream.address)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Close Stream
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
