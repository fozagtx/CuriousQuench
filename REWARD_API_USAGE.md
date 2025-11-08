# Reward Granting API

## Overview
This API allows authorized services to grant rewards to players on the Curious Quench platform.

## Endpoints

### 1. Grant Reward (POST /api/grant-reward)

Grants rewards to a specific player address.

**Authentication:**
```
Authorization: Bearer YOUR_API_KEY
```

Set `REWARD_API_KEY` in your `.env` file.

**Request Body:**
```json
{
  "playerAddress": "0x...",
  "amount": 100,
  "rank": 2
}
```

**Parameters:**
- `playerAddress` (string, required): The Ethereum address of the player
- `amount` (number, required): The reward amount in QUENCH tokens (will be converted to wei)
- `rank` (number, required): The player's rank (0-4)
  - 0: Beginner
  - 1: Intermediate
  - 2: Advanced
  - 3: Expert
  - 4: Master

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/grant-reward \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-key" \
  -d '{
    "playerAddress": "0x1234567890123456789012345678901234567890",
    "amount": 50,
    "rank": 1
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reward granted successfully",
  "transactionHash": "0x...",
  "blockNumber": "12345678"
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

400 Bad Request:
```json
{
  "success": false,
  "message": "Missing required fields: playerAddress, amount, rank"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "message": "Failed to grant reward",
  "error": "Error details"
}
```

### 2. Start Reward Listener (GET /api/reward-listener)

Starts the automated reward listener that processes RecordValidated events.

**Example:**
```bash
curl http://localhost:3000/api/reward-listener
```

**Response:**
```json
{
  "message": "Reward server started",
  "subscription": "active"
}
```

## Workflow

### Automated Flow (via submit-record):
1. User submits their daily record via `/api/submit-record`
2. System validates and emits `RecordValidated` event
3. Reward listener (if active) picks up the event
4. Automatically calculates reward based on performance
5. Grants reward via smart contract
6. Leaderboard updates automatically

### Manual Flow (via grant-reward):
1. Authorized service makes POST request to `/api/grant-reward`
2. System validates authentication and parameters
3. Grants reward via smart contract
4. Returns transaction hash
5. Leaderboard updates automatically

## Environment Variables Required

```env
# In .env file
REWARD_SERVER_PRIVATE_KEY=0x...
REWARD_API_KEY=your-secret-key-here
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
NEXT_PUBLIC_CHAIN_ID=50312
```

## Security Notes

1. **Keep API Key Secret**: Never commit `REWARD_API_KEY` to git
2. **Private Key Security**: The `REWARD_SERVER_PRIVATE_KEY` must have sufficient STT balance for gas
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Input Validation**: All inputs are validated before processing
5. **Authorization**: Only requests with valid Bearer token are processed

## Testing

To test the API, you can use the following curl command:

```bash
# Add to your .env file first:
# REWARD_API_KEY=test-secret-key-12345

# Then test:
curl -X POST http://localhost:3000/api/grant-reward \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-secret-key-12345" \
  -d '{
    "playerAddress": "0x74CeCe8C927587620FF5171cEd3FA852185252A2",
    "amount": 100,
    "rank": 2
  }'
```

## Monitoring

Check your application logs to see:
- Reward granting events: `💰 Granting reward`
- Successful transactions: `✅ Reward granted! TX:`
- Errors: Check console for detailed error messages
