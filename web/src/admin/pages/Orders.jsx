import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api'

const statusColor = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
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
    adminApi.orders({ per_page: 50 }).then((r) => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('admin.nav.orders')}</h1>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('admin.orders.empty')}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('admin.orders.number')}</th>
                <th className="p-3 text-start">{t('admin.orders.customer')}</th>
                <th className="p-3 text-start">{t('admin.orders.vendors')}</th>
                <th className="p-3 text-start">{t('admin.orders.total')}</th>
                <th className="p-3 text-start">{t('admin.orders.status')}</th>
                <th className="p-3 text-start">{t('admin.orders.date')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold text-slate-800">#{o.number}</td>
                  <td className="p-3 text-slate-600">{o.customer?.name}</td>
                  <td className="p-3 text-slate-700">{o.vendors_count}</td>
                  <td className="p-3 text-slate-700">{o.currency} {o.grand_total.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status] || 'bg-slate-100'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
