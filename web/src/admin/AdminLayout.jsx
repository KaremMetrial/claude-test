import { NavLink, Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth'

const nav = [
  { to: '/admin', end: true, key: 'overview', icon: '📊' },
  { to: '/admin/vendors', key: 'vendors', icon: '🏪' },
  { to: '/admin/categories', key: 'categories', icon: '🗂️' },
  { to: '/admin/currencies', key: 'currencies', icon: '💱' },
  { to: '/admin/coupons', key: 'coupons', icon: '🎟️' },
  { to: '/admin/orders', key: 'orders', icon: '🧾' },
]

export default function AdminLayout() {
  const { t } = useTranslation()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-e border-slate-200 bg-slate-900 text-slate-100 md:flex">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 text-xl font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
          {t('app.name')} <span className="text-xs font-normal text-slate-400">admin</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {t(`admin.nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button onClick={() => logout()} className="mt-3 w-full rounded-lg border border-slate-600 py-1.5 text-xs hover:bg-slate-800">
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex gap-2 overflow-x-auto bg-slate-900 px-4 py-2 md:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300'
                }`
              }
            >
              {t(`admin.nav.${item.key}`)}
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
