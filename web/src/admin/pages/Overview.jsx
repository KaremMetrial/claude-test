import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api'

function Stat({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

export default function Overview() {
  const { t } = useTranslation()
  const [s, setS] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    adminApi.stats().then(setS).catch(() => setError(true))
  }, [])

  if (error) return <p className="text-rose-600">{t('common.error')}</p>
  if (!s) return <p className="text-slate-500">{t('common.loading')}</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('admin.nav.overview')}</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t('admin.stats.gmv')} value={`$${s.gmv.toFixed(2)}`} accent="text-brand-700" />
        <Stat label={t('admin.stats.revenue')} value={`$${s.revenue_paid.toFixed(2)}`} accent="text-emerald-600" />
        <Stat label={t('admin.stats.orders')} value={s.orders_total} />
        <Stat label={t('admin.stats.orders_today')} value={s.orders_today} accent="text-amber-600" />
        <Stat label={t('admin.stats.users')} value={s.users_total} />
        <Stat label={t('admin.stats.vendors')} value={s.vendors_total} />
        <Stat label={t('admin.stats.pending_vendors')} value={s.vendors_pending} accent="text-amber-600" />
        <Stat label={t('admin.stats.products')} value={s.products_total} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-900">{t('admin.stats.top_vendors')}</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3 text-start">{t('admin.vendors.store')}</th>
              <th className="p-3 text-start">{t('admin.vendors.products')}</th>
              <th className="p-3 text-start">{t('admin.vendors.rating')}</th>
              <th className="p-3 text-start">{t('admin.vendors.status')}</th>
            </tr>
          </thead>
          <tbody>
            {s.top_vendors.map((v, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="p-3 font-medium text-slate-800">{v.store_name}</td>
                <td className="p-3 text-slate-700">{v.products_count}</td>
                <td className="p-3 text-amber-500">★ {v.rating.toFixed(1)}</td>
                <td className="p-3 text-slate-600">{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
