#!/bin/bash
set -e

echo "Installing Python dependencies..."
pip3 install reportlab Pillow 2>/dev/null || echo "Warning: Could not install Python dependencies"

echo "Running database migrations..."
pnpm drizzle-kit migrate

echo "Starting server..."
NODE_ENV=production node dist/index.js

