'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletConnect = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex flex-col items-center space-y-4">
      <WalletMultiButton />
      {connected && publicKey && (
        <div className="text-sm text-gray-600">
          Connected: {publicKey.toString().slice(0, 8)}...
        </div>
      )}
    </div>
  );
};