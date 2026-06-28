import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api'

const statusColor = {
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-rose-50 text-rose-700',
}

export default function Vendors() {
  const { t } = useTranslation()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.vendors({ per_page: 50 }).then((r) => setVendors(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id, status) => {
    const { data } = await adminApi.setVendorStatus(id, status)
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: data.status } : v)))
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('admin.nav.vendors')}</h1>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('admin.vendors.store')}</th>
                <th className="p-3 text-start">{t('admin.vendors.owner')}</th>
                <th className="p-3 text-start">{t('admin.vendors.products')}</th>
                <th className="p-3 text-start">{t('admin.vendors.status')}</th>
                <th className="p-3 text-end">{t('admin.vendors.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="p-3">
                    <p className="font-medium text-slate-800">{v.store_name}</p>
                    <p className="text-xs text-slate-400">{v.city}{v.city && v.country ? ', ' : ''}{v.country}</p>
                  </td>
                  <td className="p-3 text-slate-600">{v.owner?.email}</td>
                  <td className="p-3 text-slate-700">{v.products_count}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[v.status] || 'bg-slate-100'}`}>
                      {t(`admin.vendors.state.${v.status}`)}
                    </span>
                  </td>
                  <td className="p-3 text-end">
                    {v.status !== 'approved' && (
                      <button onClick={() => setStatus(v.id, 'approved')} className="font-medium text-emerald-600 hover:underline">
                        {t('admin.vendors.approve')}
                      </button>
                    )}
                    {v.status !== 'suspended' && (
                      <button onClick={() => setStatus(v.id, 'suspended')} className="ms-4 font-medium text-rose-600 hover:underline">
                        {t('admin.vendors.suspend')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
