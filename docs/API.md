# API Reference

Base URL: `http://localhost:8000/api/v1`

All endpoints return JSON. Localization is controlled per-request via headers
(or query params):

| Header        | Example            | Purpose |
|---------------|--------------------|---------|
| `X-Locale`    | `ar`               | Language for translated content (`?lang=ar` also works) |
| `X-Currency`  | `EUR`              | Currency for prices (`?currency=EUR` also works) |
| `Authorization` | `Bearer <token>` | Authenticated requests |
| `X-Cart-Token`  | `<uuid>`         | Guest cart identity (returned by cart endpoints) |

Authentication uses **Laravel Sanctum** personal access tokens.

---

## Localization

### `GET /localization`
Returns available languages, currencies, and the currently resolved selections.

```json
{
  "languages": [{ "code": "en", "native_name": "English", "is_rtl": false }],
  "currencies": [{ "code": "USD", "symbol": "$", "symbol_position": "before" }],
  "active_locale": "en",
  "active_currency": "USD"
}
```

---

## Catalog

### `GET /products`
Paginated catalog. Query params:

| Param       | Description |
|-------------|-------------|
| `q`         | Search term (matches translated name/short description) |
| `category`  | Category slug |
| `vendor`    | Vendor slug |
| `featured`  | `1` to only return featured products |
| `min_price`, `max_price` | Price range (in base currency) |
| `sort`      | `newest` \| `price_asc` \| `price_desc` \| `popular` \| `rating` |
| `per_page`  | Page size (max 48) |

Each item includes `name` (translated), `price` + `price_formatted` (converted),
`on_sale`, `vendor`, `category`, `rating`.

### `GET /products/{slug}`
Full product detail: gallery `images`, `description`, and approved `reviews`.

### `GET /categories`
Active root categories with nested `children`.

### `GET /categories/{slug}`
A single category with children.

### `GET /vendors` · `GET /vendors/{slug}` · `GET /vendors/{slug}/products`
Vendor directory, single store, and a store's products.

---

## Cart

Works for guests (via `X-Cart-Token`) and logged-in users (via bearer token).
Responses include `cart_token` for guests to persist.

| Method & path | Body | Description |
|---------------|------|-------------|
| `GET /cart` | — | Current cart with converted line totals |
| `POST /cart/items` | `{ product_id, quantity }` | Add / increment an item |
| `PATCH /cart/items/{item}` | `{ quantity }` | Set quantity (0 removes) |
| `DELETE /cart/items/{item}` | — | Remove an item |

---

## Authentication

### `POST /auth/register`
`{ name, email, password, password_confirmation, phone? }` → `{ token, user }`

### `POST /auth/login`
`{ email, password }` → `{ token, user }`

### `GET /auth/me` *(auth)* — current user
### `POST /auth/logout` *(auth)* — revoke current token

---

## Orders & Checkout *(auth)*

### `POST /checkout`
Converts the user's cart into an order. A multi-vendor cart produces a parent
order plus one **sub-order per vendor**.

```json
{
  "payment_method": "cod",
  "coupon_code": "WELCOME10",
  "shipping_address": {
    "name": "John Doe",
    "phone": "+1 555 0100",
    "line1": "123 Main St",
    "city": "New York",
    "country": "USA",
    "postal_code": "10001"
  }
}
```

Response: the parent order with `sub_orders[]`, each holding its vendor's items
and totals, plus any coupon `discount_total`.

### `GET /orders` — paginated order history
### `GET /orders/{number}` — a single order with items and sub-orders

---

## Reviews *(auth)*

### `POST /products/{slug}/reviews`
`{ rating: 1-5, title?, body? }` — one review per user per product; the product's
aggregate `rating` and `total_reviews` are recalculated automatically.

---

## Vendor dashboard *(auth + `vendor`/`admin` role)*

All routes are prefixed `/vendor` and scoped to the authenticated user's store.
Accessing another store's product/order returns `403`.

### `GET /vendor/dashboard/stats`
Headline metrics: product counts, order counts, units sold, paid revenue, rating.

### Products
| Method & path | Description |
|---------------|-------------|
| `GET /vendor/products` | Own products (incl. inactive); `?q=`, `?status=` |
| `POST /vendor/products` | Create — see body below |
| `GET /vendor/products/{id}` | Single product with all translations + images |
| `PUT /vendor/products/{id}` | Update |
| `DELETE /vendor/products/{id}` | Delete |

Create/update body:

```json
{
  "category_id": 1,
  "sku": "BZR-1001",
  "price": 129.99,
  "compare_at_price": 159.99,
  "currency": "USD",
  "stock": 25,
  "is_active": true,
  "is_featured": false,
  "thumbnail": "https://...",
  "translations": {
    "en": { "name": "4K Action Camera", "short_description": "...", "description": "..." },
    "ar": { "name": "كاميرا أكشن 4K" },
    "fr": { "name": "Caméra d'action 4K" }
  },
  "images": ["https://...", "https://..."]
}
```

The fallback locale's `name` is required; other locales are optional and fall
back automatically. A unique `slug` is generated from the name.

### Orders
| Method & path | Description |
|---------------|-------------|
| `GET /vendor/orders` | The store's sub-orders with buyer + items; `?status=` |
| `GET /vendor/orders/{id}` | A single sub-order |
| `PATCH /vendor/orders/{id}/status` | `{ status }` — pending/processing/shipped/completed/cancelled |

### Store profile
| Method & path | Description |
|---------------|-------------|
| `GET /vendor/profile` | Current store details |
| `PUT /vendor/profile` | Update store name, description, contact, base currency |

---

## Admin panel *(auth + `admin` role)*

All routes are prefixed `/admin`.

### `GET /admin/dashboard/stats`
Platform metrics: users, vendors (+ pending), products, orders, GMV, paid
revenue, and top vendors.

### Vendors
| Method & path | Description |
|---------------|-------------|
| `GET /admin/vendors` | All vendors with owner + product counts; `?status=`, `?q=` |
| `PATCH /admin/vendors/{id}/status` | `{ status }` — pending / approved / suspended |

Suspending a vendor immediately hides their store and products from the public
storefront.

### Categories *(with translations)*
| Method & path | Description |
|---------------|-------------|
| `GET /admin/categories` | All categories with translations + product counts |
| `POST /admin/categories` | Create — `{ icon?, is_active, translations: { en:{name,description}, ... } }` |
| `PUT /admin/categories/{id}` | Update |
| `DELETE /admin/categories/{id}` | Delete |

### Currencies
| Method & path | Description |
|---------------|-------------|
| `GET /admin/currencies` | All currencies |
| `POST /admin/currencies` | Create |
| `PUT /admin/currencies/{id}` | Update rate / symbol / flags |
| `DELETE /admin/currencies/{id}` | Delete (the default currency cannot be deleted) |

Setting `is_default: true` atomically unsets the previous default. Changing an
`exchange_rate` instantly reprices the whole catalog for that currency.

### Coupons
| Method & path | Description |
|---------------|-------------|
| `GET /admin/coupons` | All coupons |
| `POST /admin/coupons` | Create — `{ code, type: percent\|fixed, value, min_order_total?, usage_limit?, starts_at?, expires_at?, is_active }` |
| `PUT /admin/coupons/{id}` | Update |
| `DELETE /admin/coupons/{id}` | Delete |

### Orders
| Method & path | Description |
|---------------|-------------|
| `GET /admin/orders` | All customer orders with buyer + vendor/item counts; `?status=`, `?q=` |

---

## Error format

```json
{ "message": "Human-readable error" }
```

Validation errors (HTTP 422) additionally include an `errors` object keyed by
field name. Localized messages follow the request locale.
