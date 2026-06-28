import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { vendorApi } from '../api'

export default function Products() {
  const { t, i18n } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    vendorApi
      .products({ per_page: 50 })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const fallback = i18n.options.fallbackLng?.[0] || 'en'
  const nameOf = (p) => p.translations?.[i18n.language]?.name || p.translations?.[fallback]?.name || p.slug

  const onDelete = async (id) => {
    if (!confirm(t('dashboard.products.confirm_delete'))) return
    await vendorApi.deleteProduct(id)
    load()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.nav.products')}</h1>
        <Link to="/dashboard/products/new" className="btn-primary">
          + {t('dashboard.products.add')}
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('dashboard.products.empty')}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('dashboard.products.product')}</th>
                <th className="p-3 text-start">{t('dashboard.products.price')}</th>
                <th className="p-3 text-start">{t('dashboard.products.stock')}</th>
                <th className="p-3 text-start">{t('dashboard.products.state')}</th>
                <th className="p-3 text-end">{t('dashboard.products.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnail} alt="" className="h-10 w-10 rounded object-cover bg-slate-100" />
                      <span className="font-medium text-slate-800">{nameOf(p)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-700">
                    {p.currency} {p.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-slate-700">{p.stock}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.is_active ? t('dashboard.products.active') : t('dashboard.products.inactive')}
                    </span>
                  </td>
                  <td className="p-3 text-end">
                    <Link to={`/dashboard/products/${p.id}/edit`} className="font-medium text-brand-600 hover:underline">
                      {t('dashboard.products.edit')}
                    </Link>
                    <button onClick={() => onDelete(p.id)} className="ms-4 font-medium text-rose-600 hover:underline">
                      {t('dashboard.products.delete')}
                    </button>
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
