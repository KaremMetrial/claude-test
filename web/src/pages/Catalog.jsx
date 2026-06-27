import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { useLocalization } from '../store/localization'

export default function Catalog() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const currency = useLocalization((s) => s.currency)

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get('/products', { params: { q, category, sort, per_page: 12 } })
      .then(({ data }) => {
        if (!active) return
        setProducts(data.data)
        setMeta(data.meta)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [q, category, sort, i18n.language, currency])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    setParams(next)
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {q ? `“${q}”` : category || t('catalog.title')}
          </h1>
          {meta && <p className="text-sm text-slate-500">{t('catalog.results', { count: meta.total })}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">{t('catalog.sort')}</span>
          <select className="input w-auto" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="newest">{t('catalog.sort_newest')}</option>
            <option value="price_asc">{t('catalog.sort_price_asc')}</option>
            <option value="price_desc">{t('catalog.sort_price_desc')}</option>
            <option value="popular">{t('catalog.sort_popular')}</option>
            <option value="rating">{t('catalog.sort_rating')}</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          {t('catalog.no_results')}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
