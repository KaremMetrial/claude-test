import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { vendorApi } from '../api'

const STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

const badgeColor = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
}

export default function Orders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    vendorApi
      .orders({ per_page: 50 })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (id, status) => {
    const { data } = await vendorApi.updateOrderStatus(id, status)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: data.status } : o)))
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('dashboard.nav.orders')}</h1>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('dashboard.orders.empty')}</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">#{o.number}</p>
                  <p className="text-sm text-slate-500">
                    {o.customer?.name} · {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeColor[o.status] || 'bg-slate-100'}`}>
                    {t(`dashboard.orders.status.${o.status}`)}
                  </span>
                  <select
                    className="input w-auto py-1.5 text-sm"
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`dashboard.orders.status.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-slate-600">
                    <span>
                      {it.product_name} × {it.quantity}
                    </span>
                    <span>
                      {o.currency} {it.line_total.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between font-semibold text-slate-800">
                  <span>{t('dashboard.orders.total')}</span>
                  <span>
                    {o.currency} {o.grand_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
