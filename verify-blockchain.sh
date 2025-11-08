#!/bin/bash
echo "Checking YOUR data from the blockchain..."
echo "Enter your wallet address:"
read ADDRESS
node test-contract.js "$ADDRESS"
