import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api'
import Modal from '../components/Modal'

const blank = { code: '', name: '', symbol: '', symbol_position: 'before', exchange_rate: 1, decimal_places: 2, is_active: true, is_default: false }

export default function Currencies() {
  const { t } = useTranslation()
  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.currencies().then(setCurrencies).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => { setForm(blank); setError(null); setEditing({}) }
  const openEdit = (c) => { setForm({ ...c }); setError(null); setEditing(c) }
  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setError(null)
    const body = { ...form, code: form.code.toUpperCase(), exchange_rate: Number(form.exchange_rate), decimal_places: Number(form.decimal_places) }
    try {
      if (editing.id) await adminApi.updateCurrency(editing.id, body)
      else await adminApi.createCurrency(body)
      setEditing(null)
      load()
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(errs ? Object.values(errs)[0][0] : err.response?.data?.message || t('common.error'))
    }
  }

  const remove = async (c) => {
    if (!confirm(t('admin.currencies.confirm_delete'))) return
    try {
      await adminApi.deleteCurrency(c.id)
      load()
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('admin.nav.currencies')}</h1>
        <button onClick={openNew} className="btn-primary">+ {t('admin.currencies.add')}</button>
      </div>

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('admin.currencies.code')}</th>
                <th className="p-3 text-start">{t('admin.currencies.symbol')}</th>
                <th className="p-3 text-start">{t('admin.currencies.rate')}</th>
                <th className="p-3 text-start">{t('admin.currencies.state')}</th>
                <th className="p-3 text-end">{t('admin.vendors.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold text-slate-800">
                    {c.code} <span className="font-normal text-slate-400">{c.name}</span>
                  </td>
                  <td className="p-3 text-slate-700">{c.symbol}</td>
                  <td className="p-3 text-slate-700">{c.exchange_rate}</td>
                  <td className="p-3">
                    {c.is_default && <span className="me-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{t('admin.currencies.default')}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.is_active ? t('dashboard.products.active') : t('dashboard.products.inactive')}
                    </span>
                  </td>
                  <td className="p-3 text-end">
                    <button onClick={() => openEdit(c)} className="font-medium text-brand-600 hover:underline">{t('admin.categories.edit')}</button>
                    {!c.is_default && (
                      <button onClick={() => remove(c)} className="ms-4 font-medium text-rose-600 hover:underline">{t('admin.categories.delete')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} title={editing?.id ? t('admin.currencies.edit') : t('admin.currencies.add')} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          <input className="input" placeholder={t('admin.currencies.code')} maxLength={3} value={form.code} onChange={setField('code')} />
          <input className="input" placeholder={t('admin.currencies.name')} value={form.name} onChange={setField('name')} />
          <input className="input" placeholder={t('admin.currencies.symbol')} value={form.symbol} onChange={setField('symbol')} />
          <select className="input" value={form.symbol_position} onChange={setField('symbol_position')}>
            <option value="before">{t('admin.currencies.before')}</option>
            <option value="after">{t('admin.currencies.after')}</option>
          </select>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.currencies.rate')}</span>
            <input type="number" step="0.000001" className="input" value={form.exchange_rate} onChange={setField('exchange_rate')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">{t('admin.currencies.decimals')}</span>
            <input type="number" min="0" max="4" className="input" value={form.decimal_places} onChange={setField('decimal_places')} />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={setField('is_active')} /> {t('admin.categories.active')}
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_default} onChange={setField('is_default')} /> {t('admin.currencies.set_default')}
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
