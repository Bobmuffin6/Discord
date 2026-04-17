#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/artifacts/discord-clone"
pnpm run build
pnpm exec wrangler pages publish ./dist --project-name discord-clone
