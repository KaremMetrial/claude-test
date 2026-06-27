import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { useLocalization } from '../store/localization'

export default function Home() {
  const { t, i18n } = useTranslation()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = useLocalization((s) => s.currency)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      api.get('/products', { params: { featured: 1, per_page: 8 } }),
      api.get('/categories'),
    ])
      .then(([p, c]) => {
        if (!active) return
        setFeatured(p.data.data)
        setCategories(c.data.data)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // Re-fetch when language or currency changes so content stays localized.
  }, [i18n.language, currency])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="container-page grid items-center gap-8 py-16 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">{t('home.hero_title')}</h1>
            <p className="mt-4 max-w-lg text-lg text-brand-100">{t('home.hero_subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn bg-white px-6 text-brand-700 hover:bg-brand-50">
                {t('home.shop_now')}
              </Link>
              <a href="#categories" className="btn border border-white/40 px-6 text-white hover:bg-white/10">
                {t('home.browse_categories')}
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://picsum.photos/seed/bazario-hero/640/420"
              alt=""
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container-page py-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">{t('home.categories')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="card flex flex-col items-center gap-2 p-5 text-center hover:border-brand-300 hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">★</span>
              <span className="text-sm font-medium text-slate-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{t('home.featured')}</h2>
          <Link to="/shop" className="text-sm font-semibold text-brand-600 hover:underline">
            {t('home.view_all')} →
          </Link>
        </div>
        {loading ? (
          <p className="text-slate-500">{t('common.loading')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
