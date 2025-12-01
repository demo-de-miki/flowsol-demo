'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from '../hooks/useProgram';

interface CreateStreamFormProps {
  onStreamCreated?: () => void;
}

export const CreateStreamForm = ({ onStreamCreated }: CreateStreamFormProps) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const program = useProgram();
  const [receiver, setReceiver] = useState('');
  const [rate, setRate] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !program) return;

    setLoading(true);
    try {
      const receiverPubkey = new PublicKey(receiver);
      const ratePerSecond = new BN(parseFloat(rate) * 1e6);
      const totalAmount = new BN(parseFloat(amount) * 1e6);

      // Derive stream PDA
      const [streamPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from('stream'),
          publicKey.toBuffer(),
          receiverPubkey.toBuffer(),
        ],
        program.programId
      );

      // Derive stream token account PDA
      const [streamTokenAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('stream_vault'), streamPda.toBuffer()],
        program.programId
      );

      // For demo: using a mock token mint
      // In production, you would use a real token mint
      const mockTokenMint = new PublicKey('So11111111111111111111111111111111111111112');

      // Get sender's token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        mockTokenMint,
        publicKey
      );

      console.log('Creating stream with params:', {
        sender: publicKey.toString(),
        receiver: receiverPubkey.toString(),
        ratePerSecond: ratePerSecond.toString(),
        amount: totalAmount.toString(),
      });

      // Call the create_stream instruction
      // Note: This is a simplified version. In production, you need to:
      // 1. Ensure sender has a token account with sufficient balance
      // 2. Handle token account creation if needed
      // 3. Use proper error handling

      /* Uncomment when ready to use with actual deployed program:
      const tx = await program.methods
        .createStream(ratePerSecond, totalAmount)
        .accounts({
          stream: streamPda,
          sender: publicKey,
          receiver: receiverPubkey,
          senderTokenAccount: senderTokenAccount,
          streamTokenAccount: streamTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      */

      // For demo purposes, simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Stream created successfully!\n(Demo mode - no actual transaction)');
      setReceiver('');
      setRate('');
      setAmount('');
      onStreamCreated?.();
    } catch (error) {
      console.error('Error creating stream:', error);
      alert('Failed to create stream: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Please connect your wallet to create a stream</p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Create Payment Stream</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Receiver Address
          </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Enter receiver's public key"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rate (tokens per second)
          </label>
          <input
            type="number"
            step="0.000001"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g., 0.001"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Total Amount
          </label>
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Stream...' : 'Create Stream'}
        </button>
      </form>
    </div>
  );
};