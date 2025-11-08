const { createPublicClient, createWalletClient, http, parseUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config();

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.REWARD_SERVER_PRIVATE_KEY;
const PLAYER_ADDRESS = process.argv[2];

if (!PLAYER_ADDRESS) {
  console.error('Usage: node grant-test-reward.js <player_address>');
  process.exit(1);
}

const somniaChain = {
  id: 50312,
  name: 'Somnia',
  network: 'somnia',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network/'] },
    public: { http: ['https://dream-rpc.somnia.network/'] },
  },
};

const publicClient = createPublicClient({
  chain: somniaChain,
  transport: http(),
});

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: somniaChain,
  transport: http(),
});

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'player', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint8', name: 'rank', type: 'uint8' },
    ],
    name: 'grantReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

async function grantReward() {
  console.log('Granting reward to:', PLAYER_ADDRESS);
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('From:', account.address);
  console.log('---');

  try {
    const amount = parseUnits('100', 18); // 100 QUENCH
    const rank = 3; // A rank

    console.log('Sending transaction...');
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'grantReward',
      args: [PLAYER_ADDRESS, amount, rank],
    });

    console.log('✅ Transaction sent:', hash);
    console.log('Waiting for confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Transaction confirmed!');
    console.log('Block:', receipt.blockNumber.toString());
    console.log('Gas used:', receipt.gasUsed.toString());

    console.log('\nNow check the dashboard - you should see:');
    console.log('- Total Rewards: 100 QUENCH');
    console.log('- Rank: A');
    console.log('- Last Update: Just now');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
  }
}

grantReward();
