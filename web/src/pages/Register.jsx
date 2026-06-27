import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const register = useAuth((s) => s.register)
  const fetchCart = useCart((s) => s.fetch)

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(form)
      await fetchCart()
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors)[0][0] : err.response?.data?.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('auth.register_title')}</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('auth.name')}</label>
            <input required className="input" value={form.name} onChange={setField('name')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('auth.email')}</label>
            <input type="email" required className="input" value={form.email} onChange={setField('email')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('auth.password')}</label>
            <input type="password" required minLength={8} className="input" value={form.password} onChange={setField('password')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('auth.confirm_password')}</label>
            <input type="password" required className="input" value={form.password_confirmation} onChange={setField('password_confirmation')} />
          </div>

          {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? t('common.loading') : t('auth.sign_up')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            {t('auth.sign_in')}
          </Link>
        </p>
      </div>
    </div>
  )
}
