# Bazario Web Storefront (React + Vite)

The customer-facing web storefront for the Bazario marketplace. Built with React
18, Vite and Tailwind CSS, fully internationalized (en/ar/fr with automatic RTL)
and multi-currency.

## Stack
- React 18 + Vite 5
- Tailwind CSS 3
- React Router 6
- react-i18next (UI strings) + API-driven content translation
- Zustand (auth, cart, localization state)
- Axios client injecting locale / currency / auth / guest-cart headers

## Getting started

```bash
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                # http://localhost:5173
npm run build              # production build -> dist/
```

## Structure

```
src/
├── api/client.js          Axios instance + header interceptors
├── store/                 auth, cart, localization (Zustand)
├── components/            Navbar, Footer, ProductCard, switchers, Rating
├── pages/                 Home, Catalog, ProductDetail, Vendor, Cart,
│                          Checkout, Login, Register, Orders, NotFound
├── locales/               en/ar/fr UI translations
└── i18n.js                i18next + <html lang/dir> sync (RTL)
```

## Internationalization
- UI strings come from `src/locales/*.json`.
- Product/category names come **translated from the API** based on the active
  locale header — switching language re-fetches localized content.
- Switching language updates `<html dir>` so Arabic renders right-to-left.
- The currency switcher re-fetches converted prices from the API.
