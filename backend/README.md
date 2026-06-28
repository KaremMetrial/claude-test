# Bazario Backend (Laravel 11 API)

The REST API powering the Bazario marketplace — multivendor, multilingual and
multi-currency. Both the web storefront and the mobile app consume this single
API.

## Highlights
- **Multivendor**: vendors/stores, per-vendor products, orders split per vendor.
- **Multilingual**: translation side-tables (`product_translations`,
  `category_translations`) + locale middleware (en/ar/fr, extendable).
- **Multi-currency**: `currencies` table with exchange rates; `CurrencyService`
  converts + formats on output.
- **Auth**: Sanctum tokens with `customer` / `vendor` / `admin` roles.
- **Commerce**: cart (guest + user), coupon engine, checkout, reviews, wishlists.

## Quick start

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

See [`../docs/INSTALL.md`](../docs/INSTALL.md) for full setup and
[`../docs/API.md`](../docs/API.md) for the endpoint reference.

## Architecture

```
app/
├── Http/
│   ├── Controllers/Api/   REST controllers (catalog, cart, checkout, auth, ...)
│   ├── Middleware/         SetLocale, EnsureUserHasRole
│   └── Resources/          API transformers (translation + currency aware)
├── Models/                 Eloquent models (+ HasTranslations trait)
├── Services/               CurrencyService, CheckoutService
└── Traits/                 HasTranslations
database/
├── migrations/             Schema (multivendor + multilang)
└── seeders/                Realistic demo catalog
lang/                       en/ar/fr translations (php + json)
routes/api.php              Versioned API (/api/v1)
```

## Key design notes
- **Translations** use a side-table per entity. `HasTranslations::translate()`
  resolves active locale → fallback locale → any available, so the storefront
  never renders blanks.
- **Currency** is resolved once per request (`CurrencyService` is a scoped
  singleton) and applied inside API Resources, so prices are always converted
  and formatted for the caller's selected currency.
- **Checkout** groups cart items by vendor and creates a parent order with one
  sub-order per vendor — the foundation for per-vendor fulfilment and payouts.
