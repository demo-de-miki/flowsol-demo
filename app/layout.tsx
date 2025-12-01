import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from './components/WalletContextProvider';

export const metadata: Metadata = {
  title: 'FlowSol - Solana Payment Streaming',
  description: 'Real-time payment streaming on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
