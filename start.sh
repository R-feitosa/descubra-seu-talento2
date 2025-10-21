#!/bin/bash
set -e

echo "Running database migrations..."
pnpm drizzle-kit migrate

echo "Starting server..."
NODE_ENV=production node dist/index.js

