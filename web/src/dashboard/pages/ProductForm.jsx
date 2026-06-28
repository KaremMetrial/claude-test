import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../../api/client'
import { vendorApi } from '../api'
import { useLocalization } from '../../store/localization'

const emptyTranslation = () => ({ name: '', short_description: '', description: '' })

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const languages = useLocalization((s) => s.languages)
  const currencies = useLocalization((s) => s.currencies)
  const langCodes = languages.length ? languages.map((l) => l.code) : ['en', 'ar', 'fr']

  const [categories, setCategories] = useState([])
  const [activeLang, setActiveLang] = useState(langCodes[0])
  const [form, setForm] = useState({
    category_id: '',
    sku: '',
    price: '',
    compare_at_price: '',
    currency: 'USD',
    stock: '0',
    thumbnail: '',
    is_active: true,
    is_featured: false,
    images: '',
  })
  const [translations, setTranslations] = useState(() =>
    Object.fromEntries(langCodes.map((c) => [c, emptyTranslation()]))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    vendorApi.product(id).then((p) => {
      setForm({
        category_id: p.category_id || '',
        sku: p.sku || '',
        price: String(p.price ?? ''),
        compare_at_price: p.compare_at_price != null ? String(p.compare_at_price) : '',
        currency: p.currency || 'USD',
        stock: String(p.stock ?? 0),
        thumbnail: p.thumbnail || '',
        is_active: !!p.is_active,
        is_featured: !!p.is_featured,
        images: (p.images || []).map((i) => i.url).join('\n'),
      })
      setTranslations((prev) => {
        const next = { ...prev }
        for (const code of langCodes) next[code] = { ...emptyTranslation(), ...(p.translations?.[code] || {}) }
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const setField = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const setTr = (k) => (e) =>
    setTranslations({ ...translations, [activeLang]: { ...translations[activeLang], [k]: e.target.value } })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      category_id: form.category_id || null,
      sku: form.sku || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      currency: form.currency,
      stock: Number(form.stock),
      thumbnail: form.thumbnail || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      translations,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
    }

    try {
      if (isEdit) await vendorApi.updateProduct(id, body)
      else await vendorApi.createProduct(body)
      navigate('/dashboard/products')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors)[0][0] : err.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {isEdit ? t('dashboard.products.edit') : t('dashboard.products.add')}
      </h1>

      {/* Translations */}
      <section className="card mb-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-800">{t('dashboard.form.content')}</h2>
        <div className="mb-4 flex gap-2">
          {langCodes.map((code) => {
            const lang = languages.find((l) => l.code === code)
            return (
              <button
                type="button"
                key={code}
                onClick={() => setActiveLang(code)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeLang === code ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {lang?.native_name || code.toUpperCase()}
              </button>
            )
          })}
        </div>

        <div className="space-y-3" dir={languages.find((l) => l.code === activeLang)?.is_rtl ? 'rtl' : 'ltr'}>
          <input
            className="input"
            placeholder={t('dashboard.form.name')}
            value={translations[activeLang]?.name || ''}
            onChange={setTr('name')}
          />
          <input
            className="input"
            placeholder={t('dashboard.form.short_description')}
            value={translations[activeLang]?.short_description || ''}
            onChange={setTr('short_description')}
          />
          <textarea
            className="input min-h-28"
            placeholder={t('dashboard.form.description')}
            value={translations[activeLang]?.description || ''}
            onChange={setTr('description')}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">{t('dashboard.form.translation_hint')}</p>
      </section>

      {/* Pricing & inventory */}
      <section className="card mb-6 grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-semibold text-slate-800 sm:col-span-2">{t('dashboard.form.pricing')}</h2>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.form.price')}</span>
          <input type="number" step="0.01" required className="input" value={form.price} onChange={setField('price')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.form.compare_at')}</span>
          <input type="number" step="0.01" className="input" value={form.compare_at_price} onChange={setField('compare_at_price')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('common.currency')}</span>
          <select className="input" value={form.currency} onChange={setField('currency')}>
            {(currencies.length ? currencies : [{ code: 'USD' }]).map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.form.stock')}</span>
          <input type="number" required className="input" value={form.stock} onChange={setField('stock')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">SKU</span>
          <input className="input" value={form.sku} onChange={setField('sku')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.form.category')}</span>
          <select className="input" value={form.category_id} onChange={setField('category_id')}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </section>

      {/* Media */}
      <section className="card mb-6 space-y-3 p-5">
        <h2 className="font-semibold text-slate-800">{t('dashboard.form.media')}</h2>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.form.thumbnail')}</span>
          <input className="input" placeholder="https://..." value={form.thumbnail} onChange={setField('thumbnail')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.form.gallery')}</span>
          <textarea className="input min-h-24" placeholder={'https://...\nhttps://...'} value={form.images} onChange={setField('images')} />
        </label>
      </section>

      {/* Flags */}
      <section className="card mb-6 flex flex-wrap gap-6 p-5">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={setField('is_active')} />
          {t('dashboard.form.active')}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_featured} onChange={setField('is_featured')} />
          {t('dashboard.form.featured')}
        </label>
      </section>

      {error && <p className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t('common.loading') : t('dashboard.form.save')}
        </button>
        <button type="button" onClick={() => navigate('/dashboard/products')} className="btn-outline">
          {t('dashboard.form.cancel')}
        </button>
      </div>
    </form>
  )
}
