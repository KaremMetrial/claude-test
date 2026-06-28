import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api'
import Modal from '../components/Modal'

const blank = { code: '', type: 'percent', value: 10, min_order_total: 0, usage_limit: '', starts_at: '', expires_at: '', is_active: true }

export default function Coupons() {
  const { t } = useTranslation()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.coupons().then(setCoupons).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => { setForm(blank); setError(null); setEditing({}) }
  const openEdit = (c) => {
    setForm({ ...c, usage_limit: c.usage_limit ?? '', starts_at: c.starts_at ?? '', expires_at: c.expires_at ?? '' })
    setError(null)
    setEditing(c)
  }
  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setError(null)
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      min_order_total: Number(form.min_order_total || 0),
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    }
    try {
      if (editing.id) await adminApi.updateCoupon(editing.id, body)
      else await adminApi.createCoupon(body)
      setEditing(null)
      load()
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(errs ? Object.values(errs)[0][0] : err.response?.data?.message || t('common.error'))
    }
  }

  const remove = async (c) => {
    if (!confirm(t('admin.coupons.confirm_delete'))) return
    await adminApi.deleteCoupon(c.id)
    load()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('admin.nav.coupons')}</h1>
        <button onClick={openNew} className="btn-primary">+ {t('admin.coupons.add')}</button>
      </div>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('admin.coupons.code')}</th>
                <th className="p-3 text-start">{t('admin.coupons.discount')}</th>
                <th className="p-3 text-start">{t('admin.coupons.min')}</th>
                <th className="p-3 text-start">{t('admin.coupons.used')}</th>
                <th className="p-3 text-end">{t('admin.vendors.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold text-slate-800">
                    {c.code} {!c.is_active && <span className="text-xs font-normal text-rose-500">({t('dashboard.products.inactive')})</span>}
                  </td>
                  <td className="p-3 text-slate-700">{c.type === 'percent' ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="p-3 text-slate-700">${c.min_order_total}</td>
                  <td className="p-3 text-slate-700">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                  <td className="p-3 text-end">
                    <button onClick={() => openEdit(c)} className="font-medium text-brand-600 hover:underline">{t('admin.categories.edit')}</button>
                    <button onClick={() => remove(c)} className="ms-4 font-medium text-rose-600 hover:underline">{t('admin.categories.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} title={editing?.id ? t('admin.coupons.edit') : t('admin.coupons.add')} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          <input className="input col-span-2" placeholder={t('admin.coupons.code')} value={form.code} onChange={setField('code')} />
          <select className="input" value={form.type} onChange={setField('type')}>
            <option value="percent">{t('admin.coupons.percent')}</option>
            <option value="fixed">{t('admin.coupons.fixed')}</option>
          </select>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.coupons.value')}</span>
            <input type="number" step="0.01" className="input" value={form.value} onChange={setField('value')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.coupons.min')}</span>
            <input type="number" step="0.01" className="input" value={form.min_order_total} onChange={setField('min_order_total')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.coupons.limit')}</span>
            <input type="number" className="input" value={form.usage_limit} onChange={setField('usage_limit')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.coupons.starts')}</span>
            <input type="date" className="input" value={form.starts_at} onChange={setField('starts_at')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.coupons.expires')}</span>
            <input type="date" className="input" value={form.expires_at} onChange={setField('expires_at')} />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={setField('is_active')} /> {t('admin.categories.active')}
          </label>

          {error && <p className="col-span-2 rounded-md bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">{t('dashboard.form.cancel')}</button>
            <button type="submit" className="btn-primary">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
