import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import Rating from '../components/Rating'
import { useCart } from '../store/cart'
import { useLocalization } from '../store/localization'

export default function ProductDetail() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const add = useCart((s) => s.add)
  const currency = useLocalization((s) => s.currency)

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        if (!active) return
        setProduct(data.data)
        setActiveImage(data.data.images?.[0]?.url || data.data.thumbnail)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug, i18n.language, currency])

  if (loading) return <p className="container-page py-16 text-slate-500">{t('common.loading')}</p>
  if (!product) return null

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            {(product.images || []).map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${activeImage === img.url ? 'border-brand-500' : 'border-transparent'}`}
              >
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {product.vendor && (
            <Link to={`/vendor/${product.vendor.slug}`} className="text-sm font-semibold text-brand-600 hover:underline">
              {t('product.sold_by')} {product.vendor.store_name}
            </Link>
          )}
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} size="md" />
            <span className="text-sm text-slate-500">{t('product.reviews', { count: product.total_reviews })}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-slate-900">{product.price_formatted}</span>
            {product.on_sale && (
              <span className="text-lg text-slate-400 line-through">{product.compare_at_price_formatted}</span>
            )}
          </div>

          <p className="mt-2 text-sm font-medium">
            {product.in_stock ? (
              <span className="text-emerald-600">● {t('product.in_stock')}</span>
            ) : (
              <span className="text-rose-600">● {t('product.out_of_stock')}</span>
            )}
          </p>

          {product.short_description && <p className="mt-4 text-slate-600">{product.short_description}</p>}

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="input w-20"
            />
            <button onClick={() => add(product.id, qty)} disabled={!product.in_stock} className="btn-primary flex-1">
              {t('product.add_to_cart')}
            </button>
          </div>

          {product.description && (
            <div className="mt-10">
              <h2 className="mb-2 text-lg font-bold text-slate-900">{t('product.description')}</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">{t('product.reviews', { count: product.total_reviews })}</h2>
          <div className="space-y-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{r.author}</span>
                  <Rating value={r.rating} />
                </div>
                {r.title && <p className="mt-2 font-medium text-slate-700">{r.title}</p>}
                {r.body && <p className="mt-1 text-slate-600">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
