import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import { useAuth } from '../store/auth'

export default function Orders() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const user = useAuth((s) => s.user)
  const initialized = useAuth((s) => s.initialized)

  const placed = params.get('placed')

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      setLoading(false)
      return
    }
    api
      .get('/orders')
      .then(({ data }) => setOrders(data.data))
      .finally(() => setLoading(false))
  }, [initialized, user])

  if (initialized && !user) {
    return (
      <div className="container-page py-20 text-center text-slate-500">
        <Link to="/login" className="text-brand-600 underline">{t('auth.sign_in')}</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('orders.title')}</h1>

      {placed && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-emerald-700">
          ✓ {t('checkout.success')} <span className="font-semibold">#{placed}</span>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-500">{t('orders.empty')}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-start text-slate-500">
              <tr>
                <th className="p-4 text-start">{t('orders.order')}</th>
                <th className="p-4 text-start">{t('orders.status')}</th>
                <th className="p-4 text-start">{t('orders.total')}</th>
                <th className="p-4 text-start">{t('orders.date')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold text-slate-800">#{o.number}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{o.status}</span>
                  </td>
                  <td className="p-4 text-slate-700">{o.currency} {o.grand_total}</td>
                  <td className="p-4 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
