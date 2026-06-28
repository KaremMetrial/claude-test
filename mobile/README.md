# Bazario Mobile (React Native / Expo)

The native mobile client for the Bazario marketplace. It consumes the same
Laravel API as the web storefront, so it inherits multivendor, multilingual
(en/ar/fr with RTL) and multi-currency behaviour automatically.

## Stack
- Expo SDK 51 / React Native 0.74
- React Navigation (bottom tabs + native stack)
- i18next + expo-localization (auto device-language detection + RTL)
- Zustand for cart & localization state
- Axios client mirroring the web header contract (locale / currency / auth / guest-cart)

## Getting started

```bash
npm install
npm start          # opens the Expo dev server (press a / i / w)
```

Point the app at your API by editing `expo.extra.apiUrl` in `app.json`
(or set `EXPO_PUBLIC_API_URL`). When running on a physical device, use your
machine's LAN IP instead of `localhost`, e.g. `http://192.168.1.10:8000/api/v1`.

## Screens
| Screen   | Purpose |
|----------|---------|
| Home     | Hero, category chips, featured products grid (pull-to-refresh) |
| Product  | Gallery, price (converted), stock, description, reviews, add-to-cart |
| Cart     | Quantity stepper, remove, live subtotal in the selected currency |
| Account  | Language switcher (with RTL), currency switcher |

## Notes
- Switching to/from Arabic flips the layout via `I18nManager`. Native requires an
  app reload to fully apply RTL — the app shows a prompt when this happens.
- Product images load from remote URLs in the demo seed data; replace with your
  CDN/storage URLs in production.
