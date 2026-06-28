# Installation Guide

This guide walks you through running the full Bazario stack locally and
preparing it for production.

## Requirements

| Tool      | Version |
|-----------|---------|
| PHP       | 8.2+    |
| Composer  | 2.x     |
| Node.js   | 18+ (20+ recommended) |
| Database  | SQLite (dev) or MySQL 8 / PostgreSQL 14 (prod) |

---

## 1. Backend API (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### Configure the database

The default `.env` uses **SQLite** for a zero-config start:

```bash
touch database/database.sqlite      # already created in the repo
```

For MySQL/PostgreSQL, edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bazario
DB_USERNAME=root
DB_PASSWORD=secret
```

### Migrate & seed demo data

```bash
php artisan migrate --seed
php artisan serve            # http://localhost:8000
```

Seeding creates 3 languages, 4 currencies, 2 vendors, 3 categories, a demo
catalog, coupons, and these accounts:

| Role     | Email                  | Password |
|----------|------------------------|----------|
| Admin    | admin@bazario.test     | password |
| Vendor   | vendor@bazario.test    | password |
| Customer | customer@bazario.test  | password |

---

## 2. Web storefront (React)

```bash
cd web
npm install
cp .env.example .env         # set VITE_API_URL=http://localhost:8000/api/v1
npm run dev                  # http://localhost:5173
```

Production build:

```bash
npm run build                # outputs to web/dist
npm run preview              # serve the build locally
```

---

## 3. Mobile app (Expo)

```bash
cd mobile
npm install
npm start
```

Set `expo.extra.apiUrl` in `app.json` to your API URL. On a real device use your
computer's LAN IP, not `localhost`.

---

## Localization

- **Languages** are stored in the `languages` table and exposed at
  `GET /api/v1/localization`. Add a row + translation rows to introduce a new
  language. Set `APP_SUPPORTED_LOCALES` in `.env` to enable it on the API.
- **Currencies** live in the `currencies` table with an `exchange_rate` relative
  to the base currency. Update rates manually or wire a cron job to a rates API.
- The API selects locale via `?lang=`, `X-Locale`, or `Accept-Language`, and
  currency via `?currency=` or `X-Currency`.

## Going to production

1. Set `APP_ENV=production`, `APP_DEBUG=false`, and a strong `APP_KEY`.
2. Use MySQL/PostgreSQL and run `php artisan migrate --force`.
3. `php artisan config:cache route:cache` for performance.
4. Serve `web/dist` from any static host/CDN; set `VITE_API_URL` to the live API.
5. Configure `CORS_ALLOWED_ORIGINS` and `SANCTUM_STATEFUL_DOMAINS` to your domains.
6. Build the mobile app with EAS (`eas build`).
