# Bazario — Advanced Multivendor Multilingual E‑Commerce Platform

> A production‑ready, full‑stack marketplace solution. Sell products from **multiple vendors**, in **multiple languages** and **currencies**, across **web and mobile**.

Bazario is a complete e‑commerce ecosystem built with a clean, scalable architecture that's ready to deploy and easy to customize. It ships with a **Laravel REST API**, a **React storefront**, and a **React Native mobile app** — all sharing one backend.

---

## ✨ Key Features

- 🏪 **Multivendor** — independent vendor stores, per‑vendor products, orders split by vendor, vendor dashboards.
- 🌍 **Multilingual** — content translations (products, categories) + UI i18n. English, Arabic (RTL), French out of the box.
- 💱 **Multi‑currency** — per‑store base currency with live exchange rates and localized price formatting.
- 🔐 **Token Auth** — Laravel Sanctum, role‑based access (customer / vendor / admin).
- 🛒 **Full commerce flow** — catalog, search & filters, cart, checkout, orders, reviews & ratings, wishlists, coupons.
- 📱 **Three clients, one API** — web (React), mobile (React Native/Expo), and any future client.
- ⚙️ **Developer friendly** — clean PSR‑12 code, API Resources, form requests, seeders with demo data, and documented endpoints.

## 🧱 Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Laravel 11, PHP 8.2+, Sanctum, MySQL/PostgreSQL |
| Web      | React 18, Vite, Tailwind CSS, React Router, react‑i18next, Axios, Zustand |
| Mobile   | React Native (Expo), React Navigation, i18next |

## 📂 Monorepo Layout

```
bazario/
├── backend/   Laravel 11 REST API  (the shared core)
├── web/       React + Vite storefront
├── mobile/    React Native (Expo) app
└── docs/      Setup & API documentation
```

## 🚀 Quick Start

Each app has its own README with full instructions. In short:

```bash
# 1) Backend API
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve            # http://localhost:8000

# 2) Web storefront
cd ../web
npm install
cp .env.example .env         # point VITE_API_URL to the backend
npm run dev                  # http://localhost:5173

# 3) Mobile app
cd ../mobile
npm install
npm start                    # Expo dev server
```

See [`docs/INSTALL.md`](docs/INSTALL.md) for a detailed guide and [`docs/API.md`](docs/API.md) for the full endpoint reference.

## 📸 Demo Accounts (after seeding)

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@bazario.test     | password   |
| Vendor   | vendor@bazario.test    | password   |
| Customer | customer@bazario.test  | password   |

## 📄 License

Distributed under a commercial license. See [`LICENSE`](LICENSE). When selling on a
marketplace (CodeCanyon, etc.), align this with the marketplace's license terms.

---

Built to be sold, deployed, and extended. ⭐
