# 🎉 Curious Quench - Deployment Complete!

## ✅ Successfully Deployed

**Contract Address:** `0x9f73cb87a43deae721cbf69cfb8a356e2c7275fa`  
**Network:** Somnia Testnet (Chain ID: 50312)  
**Deployment Block:** 26896753  
**Explorer:** https://shannon-explorer.somnia.network/address/0x9f73cb87a43deae721cbf69cfb8a356e2c7275fa

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   cd /home/devpima/Desktop/cq
   bun dev
   ```

2. **Start the reward listener (in another terminal):**
   ```bash
   curl http://localhost:3000/api/reward-listener
   ```

3. **Access the app:**
   - Open http://localhost:3000
   - Connect your wallet
   - Start tracking your progress!

## 🎮 Features Implemented

### 1. Game-Oriented Leaderboard
- ✅ Real-time updates using Somnia Data Stream SDK
- ✅ User rank highlighting with "YOU" badge
- ✅ Top 3 podium with crown/trophy/medal icons
- ✅ Animated rank badges (D→C→B→A→S)
- ✅ Color-coded ranks with gradients
- ✅ Position medals for top 3 players
- ✅ Automatic refresh on new rewards

### 2. Auto-Redirect Feature
- ✅ Users automatically redirected to dashboard when wallet connects
- ✅ Uses Next.js useRouter and useEffect

### 3. Smart Contract (CuriousQuench)
- ✅ Full ERC20 token implementation
- ✅ Player data tracking (totalRewards, rank, lastUpdate)
- ✅ Reward granting system with access control
- ✅ Owner and reward server roles
- ✅ Token minting on rewards
- ✅ Emergency functions

### 4. Navigation Updates
- ✅ Dashboard link with active highlighting
- ✅ Leaderboard link with trophy icon
- ✅ Mobile-responsive header

## 📁 Project Structure

```
/home/devpima/Desktop/cq/           # Main Next.js app
├── app/
│   ├── page.tsx                    # Landing page (auto-redirect)
│   ├── dashboard/page.tsx          # User dashboard
│   ├── leaderboard/page.tsx        # Game leaderboard
│   └── api/
│       ├── leaderboard/route.ts    # Leaderboard API
│       ├── submit-record/route.ts  # Submit cigarette records
│       └── reward-listener/route.ts # Reward processing
├── components/
│   ├── Header.tsx                  # Navigation (updated)
│   ├── SubmitRecord.tsx           # Daily record form
│   └── RewardBanner.tsx           # Reward notifications
├── lib/
│   ├── contract.ts                # Contract ABI & address
│   ├── somnia-sdk.ts              # Somnia SDK config
│   └── calculations.ts            # Reward calculations
└── .env.local                     # Environment variables

/home/devpima/Desktop/cq-contracts/ # Smart contracts
└── src/
    ├── contracts/Token.sol         # CuriousQuench contract
    ├── scripts/
    │   ├── deploy.ts              # Deployment script
    │   └── export-abi.ts          # ABI export script
    └── hardhat.config.ts          # Hardhat config
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
NEXT_PUBLIC_CHAIN_ID=50312
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9f73cb87a43deae721cbf69cfb8a356e2c7275fa
REWARD_SERVER_ADDRESS=0x74CeCe8C927587620FF5171cEd3FA852185252A2
REWARD_SERVER_PRIVATE_KEY=<your-private-key>
```

## 🎯 How It Works

### Reward Flow
1. User submits daily cigarette count via dashboard
2. Game server validates and calculates performance
3. Game server emits `RecordValidated` event via Somnia SDK
4. Reward listener receives event
5. Reward server calculates reward based on performance:
   - **S Rank (90-100%):** 100 $QUENCH
   - **A Rank (70-89%):** 75 $QUENCH
   - **B Rank (50-69%):** 50 $QUENCH
   - **C Rank (30-49%):** 25 $QUENCH
   - **D Rank (1-29%):** 10 $QUENCH
6. Reward server calls `grantReward()` on smart contract
7. Smart contract mints tokens and updates player data
8. Frontend receives `RewardGranted` event in real-time
9. User sees reward notification banner
10. Leaderboard automatically updates

### Leaderboard Updates
- Subscribes to `RewardGranted` events via Somnia SDK
- Automatically refreshes when any player receives rewards
- Queries events in 1000-block chunks to avoid RPC limits
- Sorts players by total rewards earned
- Highlights current user's position

## 🔗 Important Links

- **Contract Explorer:** https://shannon-explorer.somnia.network/address/0x9f73cb87a43deae721cbf69cfb8a356e2c7275fa
- **Testnet Faucet:** https://testnet.somnia.network/
- **Somnia Docs:** https://docs.somnia.network/
- **Add to Wallet:** https://chainlist.org/?chain=50312&search=somnia

## 🛠️ Maintenance

### If You Redeploy the Contract

1. Deploy new contract:
   ```bash
   cd /home/devpima/Desktop/cq-contracts/src
   npx hardhat run scripts/deploy.ts --network somnia
   ```

2. Update `.env.local` with new contract address

3. Update deployment block in `app/api/leaderboard/route.ts`:
   ```typescript
   const deploymentBlock = BigInt(YOUR_NEW_DEPLOYMENT_BLOCK);
   ```

4. Export new ABI:
   ```bash
   npx hardhat run scripts/export-abi.ts
   ```

### Troubleshooting

**Leaderboard not loading:**
- Check RPC URL is correct
- Verify deployment block number
- Check browser console for errors

**Rewards not received:**
- Ensure reward listener is running
- Check reward server has gas (STT tokens)
- Verify contract address in .env.local

**Build errors:**
- Ensure contracts folder is moved to `/home/devpima/Desktop/cq-contracts/`
- Run `bun run build` to test

## 📊 Contract Functions

### Public Functions
- `transfer(to, amount)` - Transfer tokens
- `approve(spender, amount)` - Approve spending
- `balanceOf(account)` - Get token balance
- `getPlayerData(player)` - Get player stats
- `getRankName(index)` - Get rank name (D, C, B, A, S)

### Owner Functions
- `setRewardServer(address)` - Update reward server
- `transferOwnership(newOwner)` - Transfer ownership
- `emergencyWithdraw()` - Withdraw ETH

### Reward Server Functions
- `grantReward(player, amount, rank)` - Grant rewards to player

## 🎮 Ready to Use!

Your Curious Quench app is fully functional and ready for users!

**Have fun tracking your progress and earning $QUENCH tokens!** 🚀
