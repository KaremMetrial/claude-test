import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useAuth((s) => s.login)
  const fetchCart = useCart((s) => s.fetch)

  const [email, setEmail] = useState('customer@bazario.test')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      await fetchCart()
      navigate(params.get('redirect') || '/')
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('auth.login_title')}</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('auth.email')}</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('auth.password')}</label>
            <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? t('common.loading') : t('auth.sign_in')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            {t('auth.sign_up')}
          </Link>
        </p>
      </div>
    </div>
  )
}
