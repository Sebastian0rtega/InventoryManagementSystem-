#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

npm ci
npm run build
npm run lint
npm run db:test:setup
npm test
