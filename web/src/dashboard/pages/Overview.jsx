import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { vendorApi } from '../api'

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

export default function Overview() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    vendorApi.stats().then(setStats).catch(() => setError(true))
  }, [])

  if (error) return <p className="text-rose-600">{t('common.error')}</p>
  if (!stats) return <p className="text-slate-500">{t('common.loading')}</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{stats.store.name}</h1>
          <p className="text-sm text-slate-500">
            {t('dashboard.status')}: <span className="font-medium text-emerald-600">{stats.store.status}</span> ·{' '}
            {stats.store.base_currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('dashboard.stats.revenue')} value={`$${stats.revenue_paid.toFixed(2)}`} accent="text-brand-700" />
        <StatCard label={t('dashboard.stats.orders')} value={stats.orders_total} />
        <StatCard label={t('dashboard.stats.pending')} value={stats.orders_pending} accent="text-amber-600" />
        <StatCard label={t('dashboard.stats.units')} value={stats.units_sold} />
        <StatCard label={t('dashboard.stats.products')} value={stats.products_total} />
        <StatCard label={t('dashboard.stats.active')} value={stats.products_active} accent="text-emerald-600" />
        <StatCard label={t('dashboard.stats.out_of_stock')} value={stats.out_of_stock} accent="text-rose-600" />
        <StatCard label={t('dashboard.stats.rating')} value={`★ ${stats.rating.toFixed(1)}`} accent="text-amber-500" />
      </div>
    </div>
  )
}
