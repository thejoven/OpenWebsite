#!/bin/sh
set -e

DB_URL="${DATABASE_URL:-file:./data/openwebsite.db}"

case "$DB_URL" in
  file:*)
    DB_PATH="${DB_URL#file:}"
    case "$DB_PATH" in
      /*) DB_DIR="$(dirname "$DB_PATH")" ;;
      *) DB_DIR="prisma/$(dirname "$DB_PATH")" ;;
    esac
    mkdir -p "$DB_DIR"
    ;;
esac

npx prisma migrate deploy
npm run db:seed

exec "$@"
