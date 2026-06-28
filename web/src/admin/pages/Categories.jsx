import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api'
import Modal from '../components/Modal'
import { useLocalization } from '../../store/localization'

const blankTr = () => ({ name: '', description: '' })

export default function Categories() {
  const { t, i18n } = useTranslation()
  const languages = useLocalization((s) => s.languages)
  const langCodes = languages.length ? languages.map((l) => l.code) : ['en', 'ar', 'fr']

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | {} (new) | category
  const [activeLang, setActiveLang] = useState(langCodes[0])
  const [form, setForm] = useState({ icon: '', is_active: true, translations: {} })
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.categories().then(setCategories).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const fallback = i18n.options.fallbackLng?.[0] || 'en'
  const nameOf = (c) => c.translations?.[i18n.language]?.name || c.translations?.[fallback]?.name || c.slug

  const openNew = () => {
    setForm({ icon: '', is_active: true, translations: Object.fromEntries(langCodes.map((c) => [c, blankTr()])) })
    setActiveLang(langCodes[0])
    setError(null)
    setEditing({})
  }

  const openEdit = (c) => {
    setForm({
      icon: c.icon || '',
      is_active: c.is_active,
      translations: Object.fromEntries(langCodes.map((code) => [code, { ...blankTr(), ...(c.translations?.[code] || {}) }])),
    })
    setActiveLang(langCodes[0])
    setError(null)
    setEditing(c)
  }

  const setTr = (k) => (e) =>
    setForm({ ...form, translations: { ...form.translations, [activeLang]: { ...form.translations[activeLang], [k]: e.target.value } } })

  const save = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const body = { icon: form.icon || null, is_active: form.is_active, translations: form.translations }
      if (editing.id) await adminApi.updateCategory(editing.id, body)
      else await adminApi.createCategory(body)
      setEditing(null)
      load()
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(errs ? Object.values(errs)[0][0] : err.response?.data?.message || t('common.error'))
    }
  }

  const remove = async (c) => {
    if (!confirm(t('admin.categories.confirm_delete'))) return
    await adminApi.deleteCategory(c.id)
    load()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('admin.nav.categories')}</h1>
        <button onClick={openNew} className="btn-primary">+ {t('admin.categories.add')}</button>
      </div>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('admin.categories.name')}</th>
                <th className="p-3 text-start">{t('admin.categories.slug')}</th>
                <th className="p-3 text-start">{t('admin.categories.products')}</th>
                <th className="p-3 text-end">{t('admin.vendors.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium text-slate-800">{nameOf(c)}</td>
                  <td className="p-3 text-slate-500">{c.slug}</td>
                  <td className="p-3 text-slate-700">{c.products_count}</td>
                  <td className="p-3 text-end">
                    <button onClick={() => openEdit(c)} className="font-medium text-brand-600 hover:underline">
                      {t('admin.categories.edit')}
                    </button>
                    <button onClick={() => remove(c)} className="ms-4 font-medium text-rose-600 hover:underline">
                      {t('admin.categories.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} title={editing?.id ? t('admin.categories.edit') : t('admin.categories.add')} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <div className="flex gap-2">
            {langCodes.map((code) => {
              const lang = languages.find((l) => l.code === code)
              return (
                <button
                  type="button"
                  key={code}
                  onClick={() => setActiveLang(code)}
                  className={`rounded-full px-3 py-1.5 text-sm ${activeLang === code ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {lang?.native_name || code.toUpperCase()}
                </button>
              )
            })}
          </div>

          <div dir={languages.find((l) => l.code === activeLang)?.is_rtl ? 'rtl' : 'ltr'} className="space-y-3">
            <input className="input" placeholder={t('admin.categories.name')} value={form.translations[activeLang]?.name || ''} onChange={setTr('name')} />
            <textarea className="input min-h-20" placeholder={t('admin.categories.description')} value={form.translations[activeLang]?.description || ''} onChange={setTr('description')} />
          </div>

          <input className="input" placeholder={t('admin.categories.icon')} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            {t('admin.categories.active')}
          </label>

          {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">{t('dashboard.form.cancel')}</button>
            <button type="submit" className="btn-primary">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
