'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { somniaChain } from '@/lib/somnia-sdk';
import { injected } from 'wagmi/connectors';

const config = createConfig({
  chains: [somniaChain],
  transports: {
    [somniaChain.id]: http(),
  },
  connectors: [injected()],
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
