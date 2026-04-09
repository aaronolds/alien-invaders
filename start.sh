#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Building TypeScript..."
npx tsc
echo "Starting Alien Invaders at http://localhost:3000"
node server.js
