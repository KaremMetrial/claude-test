import { NavLink, Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth'

const nav = [
  { to: '/dashboard', end: true, key: 'overview', icon: '📊' },
  { to: '/dashboard/products', key: 'products', icon: '📦' },
  { to: '/dashboard/orders', key: 'orders', icon: '🧾' },
  { to: '/dashboard/store', key: 'store', icon: '🏪' },
]

export default function DashboardLayout() {
  const { t } = useTranslation()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-e border-slate-200 bg-white md:flex">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 text-xl font-extrabold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
          {t('app.name')}
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span>{item.icon}</span>
              {t(`dashboard.nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-semibold text-slate-800">{user?.vendor?.store_name || user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button onClick={() => logout()} className="btn-outline mt-3 w-full py-1.5 text-xs">
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <Link to="/" className="text-lg font-extrabold text-brand-700">{t('app.name')}</Link>
          <Link to="/" className="text-sm text-slate-500">← {t('nav.home')}</Link>
        </header>

        {/* Mobile nav */}
        <div className="flex gap-2 overflow-x-auto bg-white px-4 py-2 md:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`
              }
            >
              {t(`dashboard.nav.${item.key}`)}
            </NavLink>
          ))}
        </div>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
