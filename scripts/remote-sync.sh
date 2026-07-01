#!/usr/bin/env bash
set -euo pipefail

PROJECT="${PROJECT:-10013-swtpower}"
HOST="${HOST:-root@192.168.1.205}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_jwenlee520}"
REMOTE_DIR="${REMOTE_DIR:-/opt/$PROJECT}"
SSHOPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new"

if [ "${1:-}" = "--logs" ]; then
  ssh $SSHOPTS "$HOST" "journalctl -u '$PROJECT-app' -f --no-pager"
  exit 0
fi

rsync -az --delete \
  --exclude ".git/" \
  --exclude ".env" \
  --exclude ".next/" \
  --exclude "node_modules/" \
  --exclude "data/" \
  --exclude "prisma/data/" \
  --exclude "public/uploads/" \
  --exclude "*.log" \
  -e "ssh $SSHOPTS" \
  ./ "$HOST:$REMOTE_DIR/"

if [ "${1:-}" = "--no-build" ]; then
  exit 0
fi

ssh $SSHOPTS "$HOST" "cd '$REMOTE_DIR' && \
  npm config set registry https://registry.npmmirror.com && \
  npm ci && \
  npx prisma migrate deploy && \
  npm run db:seed && \
  npm run build && \
  systemctl restart '$PROJECT-app' && \
  sleep 2 && \
  systemctl --no-pager --full status '$PROJECT-app' && \
  journalctl -u '$PROJECT-app' -n 80 --no-pager"
