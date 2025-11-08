#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./test-grant-api.sh <wallet_address>"
  exit 1
fi

echo "Testing direct reward grant to: $1"
echo "---"

curl -X POST http://localhost:3000/api/debug-grant \
  -H "Content-Type: application/json" \
  -d "{\"userAddress\": \"$1\"}" \
  2>/dev/null | jq .

echo ""
echo "Now check your dashboard!"
