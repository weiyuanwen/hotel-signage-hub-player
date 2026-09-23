#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCK="${SIGNAGEHUB_DEPLOY_LOCK:-/tmp/signagehub-deploy.lock}"
BACKEND_ENV="${HOME}/hotel-signage-hub-backend/deploy/.env"

exec 9>"$LOCK"
flock 9

cd "$ROOT"
git fetch origin main
git checkout -q main
git reset --hard origin/main

if [ ! -f deploy/.env ]; then
  key=""
  if [ -f "$BACKEND_ENV" ]; then
    key="$(grep -E '^REVERB_APP_KEY=' "$BACKEND_ENV" | head -1 | cut -d= -f2- || true)"
  fi
  cat > deploy/.env <<EOF
VITE_REVERB_APP_KEY=${key}
VITE_REVERB_HOST=ws.signagehub.online
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
EOF
fi

cd deploy
docker compose up -d --build
echo "player $(git -C "$ROOT" rev-parse --short HEAD) up"
