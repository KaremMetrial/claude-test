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

## Error format

```json
{ "message": "Human-readable error" }
```

Validation errors (HTTP 422) additionally include an `errors` object keyed by
field name. Localized messages follow the request locale.
