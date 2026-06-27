import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import ProductCard from '../components/ProductCard'
import Rating from '../components/Rating'
import { useLocalization } from '../store/localization'

export default function VendorPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = useLocalization((s) => s.currency)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([api.get(`/vendors/${slug}`), api.get(`/vendors/${slug}/products`)])
      .then(([v, p]) => {
        if (!active) return
        setVendor(v.data.data)
        setProducts(p.data.data)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug, i18n.language, currency])

  if (loading) return <p className="container-page py-16 text-slate-500">{t('common.loading')}</p>
  if (!vendor) return null

  return (
    <div>
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="container-page py-12">
          <h1 className="text-3xl font-extrabold">{vendor.store_name}</h1>
          {vendor.description && <p className="mt-2 max-w-2xl text-slate-200">{vendor.description}</p>}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <Rating value={vendor.rating} count={vendor.total_reviews} />
            {vendor.country && <span className="text-slate-300">📍 {vendor.city}, {vendor.country}</span>}
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
