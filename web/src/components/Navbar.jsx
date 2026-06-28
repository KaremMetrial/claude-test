import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher, CurrencySwitcher } from './Switchers'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'

export default function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const cart = useCart((s) => s.cart)

  const itemCount = cart?.item_count ?? 0

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/shop?q=${encodeURIComponent(query)}`)
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
          {t('app.name')}
        </Link>

        <form onSubmit={onSearch} className="hidden flex-1 md:block">
          <input
            className="input"
            placeholder={t('nav.search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav className="hidden items-center gap-5 lg:flex">
          <NavLink to="/shop" className={linkClass}>{t('nav.shop')}</NavLink>
          <NavLink to="/vendor/aurora-electronics" className={linkClass}>{t('nav.vendors')}</NavLink>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <CurrencySwitcher />
          <LanguageSwitcher />

          <Link to="/cart" className="relative rounded-md p-2 hover:bg-slate-100" aria-label={t('nav.cart')}>
            <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="1.7" d="M2.25 3h1.5l1.5 12h12l1.5-9H6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {(user.role === 'vendor' || user.role === 'admin') && (
                <Link to="/dashboard" className="hidden text-sm font-semibold text-brand-600 hover:text-brand-800 sm:block">
                  {t('nav.dashboard')}
                </Link>
              )}
              <Link to="/orders" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block">
                {t('nav.orders')}
              </Link>
              <button onClick={() => logout()} className="btn-outline px-3 py-1.5">{t('nav.logout')}</button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary px-3 py-1.5">{t('nav.login')}</Link>
          )}
        </div>
      </div>
    </header>
  )
}
