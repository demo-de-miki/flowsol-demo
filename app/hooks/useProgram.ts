import { useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { IDL, PROGRAM_ID } from './idl';

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    return new Program(IDL as any, new PublicKey(PROGRAM_ID), provider);
  }, [connection, wallet]);

  return program;
};
