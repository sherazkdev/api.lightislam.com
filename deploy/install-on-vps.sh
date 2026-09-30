#!/usr/bin/env bash
set -euo pipefail

# Run on Ubuntu VPS as root or with sudo, from repo root after git clone.
# Usage: sudo bash deploy/install-on-vps.sh

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

echo "==> App root: $APP_ROOT"

if ! command -v node >/dev/null; then
  echo "Install Node 20+ first (e.g. curl -fsSL https://deb.nodesource.com/setup_20.x | bash -)"
  exit 1
fi

mkdir -p logs

if [[ ! -f .env ]]; then
  echo "Create .env from deploy/env.production.example and fill secrets."
  cp deploy/env.production.example .env
  exit 1
fi

npm ci
npm run build

if ! command -v pm2 >/dev/null; then
  npm install -g pm2
fi

pm2 delete light-islam-reminder-api 2>/dev/null || true
pm2 delete light-islam-reminder-worker 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save

echo ""
echo "PM2 running:"
pm2 status

echo ""
echo "Next steps:"
echo "  1. MongoDB running on 127.0.0.1:27017"
echo "  2. sudo cp deploy/nginx/api.lightislam.com.conf /etc/nginx/sites-available/api.lightislam.com"
echo "  3. sudo ln -sf /etc/nginx/sites-available/api.lightislam.com /etc/nginx/sites-enabled/"
echo "  4. DNS A record: api.lightislam.com -> this server IP"
echo "  5. sudo nginx -t && sudo systemctl reload nginx"
echo "  6. sudo certbot --nginx -d api.lightislam.com"
echo "  7. curl -s http://127.0.0.1:3022/health"
