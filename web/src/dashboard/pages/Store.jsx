import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { vendorApi } from '../api'
import { useLocalization } from '../../store/localization'

export default function Store() {
  const { t } = useTranslation()
  const currencies = useLocalization((s) => s.currencies)
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    vendorApi.profile().then(setForm)
  }, [])

  if (!form) return <p className="text-slate-500">{t('common.loading')}</p>

  const setField = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setSaved(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await vendorApi.updateProfile({
        store_name: form.store_name,
        description: form.description,
        logo: form.logo || null,
        banner: form.banner || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        country: form.country || null,
        base_currency: form.base_currency,
      })
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const field = (key, label, type = 'text') => (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      <input type={type} className="input" value={form[key] || ''} onChange={setField(key)} />
    </label>
  )

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('dashboard.nav.store')}</h1>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">{field('store_name', t('dashboard.store.name'))}</div>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.store.description')}</span>
          <textarea className="input min-h-24" value={form.description || ''} onChange={setField('description')} />
        </label>
        {field('email', t('auth.email'), 'email')}
        {field('phone', t('checkout.phone'))}
        {field('city', t('checkout.city'))}
        {field('country', t('checkout.country'))}
        {field('logo', t('dashboard.store.logo'))}
        {field('banner', t('dashboard.store.banner'))}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{t('dashboard.store.base_currency')}</span>
          <select className="input" value={form.base_currency} onChange={setField('base_currency')}>
            {(currencies.length ? currencies : [{ code: 'USD' }]).map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </label>
      </section>

      {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
      {saved && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">✓ {t('dashboard.store.saved')}</p>}

      <button type="submit" disabled={saving} className="btn-primary mt-5">
        {saving ? t('common.loading') : t('dashboard.form.save')}
      </button>
    </form>
  )
}
