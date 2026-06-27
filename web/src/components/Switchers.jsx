import { useTranslation } from 'react-i18next'
import { useLocalization } from '../store/localization'
import { useCart } from '../store/cart'

/** Dropdown to change the UI + content language (re-fetches localized data). */
export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { languages, setLanguage } = useLocalization()
  const fetchCart = useCart((s) => s.fetch)

  const options = languages.length
    ? languages
    : [{ code: 'en', native_name: 'English' }, { code: 'ar', native_name: 'العربية' }, { code: 'fr', native_name: 'Français' }]

  return (
    <select
      aria-label="Language"
      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      value={i18n.language}
      onChange={(e) => {
        setLanguage(e.target.value)
        fetchCart() // prices/labels come back in the new locale
      }}
    >
      {options.map((l) => (
        <option key={l.code} value={l.code}>
          {l.native_name || l.code}
        </option>
      ))}
    </select>
  )
}

/** Dropdown to change the display currency (re-fetches converted prices). */
export function CurrencySwitcher() {
  const { currencies, currency, setCurrency } = useLocalization()
  const fetchCart = useCart((s) => s.fetch)

  const options = currencies.length ? currencies : [{ code: 'USD', symbol: '$' }]

  return (
    <select
      aria-label="Currency"
      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      value={currency}
      onChange={(e) => {
        setCurrency(e.target.value)
        fetchCart()
      }}
    >
      {options.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} {c.symbol ? `(${c.symbol})` : ''}
        </option>
      ))}
    </select>
  )
}
