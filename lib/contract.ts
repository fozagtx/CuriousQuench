export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Contract ABI - Update this after deploying your smart contract
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "rank",
        "type": "uint8"
      }
    ],
    "name": "grantReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalRewards",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "rank",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "lastUpdate",
            "type": "uint256"
          }
        ],
        "internalType": "struct CuriousQuench.PlayerData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "rank",
        "type": "uint8"
      }
    ],
    "name": "RewardGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "newRank",
        "type": "uint8"
      }
    ],
    "name": "RankUpdated",
    "type": "event"
  }
] as const;
