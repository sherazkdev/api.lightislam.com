# VPS deploy — Light of Islam Reminder API

## Ports

| Port | Use |
|------|-----|
| **3022** | API (`PORT` in `.env`) — nginx proxies `api.lightislam.com` here |
| **3023** | Not required (free spare). Worker has **no** HTTP port |
| **27017** | MongoDB (localhost only, do not expose publicly) |
| **80 / 443** | Nginx (public) |

## Processes (PM2)

| PM2 name | Script | Role |
|----------|--------|------|
| `light-islam-reminder-api` | `dist/index.js` | HTTP API + Swagger `/docs` |
| `light-islam-reminder-worker` | `dist/worker.js` | Minute cron + daily reschedule + FCM |

## Quick deploy

```bash
cd /var/www/light-islam-api   # your clone path
cp deploy/env.production.example .env   # edit secrets
bash deploy/install-on-vps.sh
```

## Manual PM2

**First deploy on VPS:**

```bash
cp deploy/env.production.example .env   # edit secrets
npm run prod:setup   # ci + tsc build + prune devDeps + pm2 start
pm2 save
pm2 startup   # follow printed command for reboot persistence
```

(`prod:install` uses full `npm ci` so TypeScript is available for `tsc`; `prod:prune` removes devDependencies after build.)

**Every update (after `git pull`):**

```bash
npm run prod:deploy
```

Other commands: `npm run prod:status` | `prod:logs` | `prod:stop`

## Nginx

```bash
sudo cp deploy/nginx/api.lightislam.com.conf /etc/nginx/sites-available/api.lightislam.com
sudo ln -sf /etc/nginx/sites-available/api.lightislam.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.lightislam.com
```

## Verify

```bash
curl -s http://127.0.0.1:3022/health
curl -s https://api.lightislam.com/health
```

Swagger: `https://api.lightislam.com/docs`
