const { createPublicClient, http, formatUnits } = require('viem');

const CONTRACT_ADDRESS = '0x9f73cb87a43deae721cbf69cfb8a356e2c7275fa';
const TEST_ADDRESS = process.argv[2] || '0x74CeCe8C927587620FF5171cEd3FA852185252A2';

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

async function testContract() {
  console.log('Testing contract:', CONTRACT_ADDRESS);
  console.log('Test address:', TEST_ADDRESS);
  console.log('---');

  try {
    // Test 1: Check contract exists
    console.log('1. Checking if contract exists...');
    const code = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
    if (code && code !== '0x') {
      console.log('✅ Contract exists');
    } else {
      console.log('❌ Contract not found at this address');
      return;
    }

    // Test 2: Read player data
    console.log('\n2. Reading player data...');
    const data = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: [
        {
          inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
          name: 'getPlayerData',
          outputs: [
            {
              components: [
                { internalType: 'uint256', name: 'totalRewards', type: 'uint256' },
                { internalType: 'uint8', name: 'rank', type: 'uint8' },
                { internalType: 'uint256', name: 'lastUpdate', type: 'uint256' },
              ],
              internalType: 'struct CuriousQuench.PlayerData',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'getPlayerData',
      args: [TEST_ADDRESS],
    });

    console.log('Player data:', {
      totalRewards: formatUnits(data.totalRewards, 18),
      rank: data.rank,
      lastUpdate: data.lastUpdate.toString(),
      lastUpdateDate: data.lastUpdate > 0 ? new Date(Number(data.lastUpdate) * 1000).toISOString() : 'Never',
    });

    if (data.totalRewards > 0) {
      console.log('✅ Player has rewards!');
    } else {
      console.log('⚠️ Player has no rewards yet');
    }

    // Test 3: Get latest RewardGranted events
    console.log('\n3. Checking for RewardGranted events...');
    const latestBlock = await publicClient.getBlockNumber();
    console.log('Latest block:', latestBlock.toString());
    
    const deploymentBlock = BigInt(26896753);
    const fromBlock = latestBlock > 1000n ? latestBlock - 1000n : deploymentBlock;
    
    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'RewardGranted',
        inputs: [
          { type: 'address', indexed: true, name: 'player' },
          { type: 'uint256', indexed: false, name: 'amount' },
          { type: 'uint8', indexed: false, name: 'rank' },
        ],
      },
      fromBlock,
      toBlock: latestBlock,
    });

    console.log(`Found ${logs.length} RewardGranted events in last 1000 blocks`);
    logs.forEach((log, i) => {
      console.log(`Event ${i + 1}:`, {
        player: log.args.player,
        amount: formatUnits(log.args.amount, 18),
        rank: log.args.rank,
        blockNumber: log.blockNumber.toString(),
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

testContract();
