import { SDK } from '@somnia-chain/streams';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Define Somnia chain
export const somniaChain = {
  id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '50311'),
  name: 'Somnia',
  network: 'somnia',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL!] },
    public: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL!] },
  },
} as const;

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: somniaChain,
  transport: http(),
});

// Client SDK for frontend (read-only)
export const clientSDK = new SDK({
  public: publicClient,
});

// Server SDK for reward server (write access)
export function getServerSDK() {
  if (!process.env.REWARD_SERVER_PRIVATE_KEY) {
    throw new Error('REWARD_SERVER_PRIVATE_KEY not set');
  }

  const account = privateKeyToAccount(
    process.env.REWARD_SERVER_PRIVATE_KEY as `0x${string}`
  );

  const walletClient = createWalletClient({
    account,
    chain: somniaChain,
    transport: http(),
  });

  return new SDK({
    public: publicClient,
    wallet: walletClient,
  });
}
