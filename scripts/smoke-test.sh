#!/usr/bin/env bash
set -euo pipefail

echo "Starting simple smoke tests..."

# Basic health endpoints to verify server responds (adjust paths if needed)
curl -fsS -o /dev/null http://localhost:3000/ || { echo 'Root route failed'; exit 1; }
curl -fsS -o /dev/null http://localhost:3000/login || { echo 'Login route failed'; exit 1; }
echo 'Smoke tests passed.'
