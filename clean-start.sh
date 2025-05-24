#!/bin/sh
# This script clears browser cache and runs the CentralTeach application

echo "===== CentralTeach Clean Start ====="
echo "Cleaning up any temporary files..."

# Remove any temporary files that might be causing issues
find . -name "*.tmp" -type f -delete

# Create timestamp for versioning
TIMESTAMP=$(date +%s)
echo "Using timestamp for cache busting: $TIMESTAMP"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the server
echo "Starting server with cache disabled..."
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop the server"
NODE_ENV=development BUILD_VERSION=$TIMESTAMP node server.js
