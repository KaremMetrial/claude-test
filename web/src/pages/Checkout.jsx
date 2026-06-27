import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import { useCart } from '../store/cart'
import { useAuth } from '../store/auth'

export default function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cart, fetch, clear } = useCart()
  const user = useAuth((s) => s.user)
  const initialized = useAuth((s) => s.initialized)

  const [form, setForm] = useState({ name: '', phone: '', line1: '', city: '', country: '', postal_code: '' })
  const [payment, setPayment] = useState('cod')
  const [coupon, setCoupon] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch()
  }, [fetch])

  // Guard: checkout requires an account.
  useEffect(() => {
    if (initialized && !user) navigate('/login?redirect=/checkout')
  }, [initialized, user, navigate])

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setPlacing(true)
    setError(null)
    try {
      const { data } = await api.post('/checkout', {
        payment_method: payment,
        coupon_code: coupon || undefined,
        shipping_address: form,
      })
      clear()
      navigate(`/orders?placed=${data.data.number}`)
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setPlacing(false)
    }
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container-page py-20 text-center text-slate-500">
        {t('cart.empty')} <Link to="/shop" className="text-brand-600 underline">{t('cart.continue_shopping')}</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('checkout.title')}</h1>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">{t('checkout.shipping')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required className="input" placeholder={t('checkout.name')} value={form.name} onChange={setField('name')} />
              <input required className="input" placeholder={t('checkout.phone')} value={form.phone} onChange={setField('phone')} />
              <input required className="input sm:col-span-2" placeholder={t('checkout.address')} value={form.line1} onChange={setField('line1')} />
              <input required className="input" placeholder={t('checkout.city')} value={form.city} onChange={setField('city')} />
              <input required className="input" placeholder={t('checkout.country')} value={form.country} onChange={setField('country')} />
              <input className="input" placeholder={t('checkout.postal_code')} value={form.postal_code} onChange={setField('postal_code')} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">{t('checkout.payment')}</h2>
            <div className="space-y-2">
              {[
                { id: 'cod', label: t('checkout.cod') },
                { id: 'card', label: t('checkout.card') },
              ].map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                  <span className="text-sm font-medium text-slate-700">{p.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-lg font-bold text-slate-900">{t('checkout.order_summary')}</h2>
          <div className="mt-4 space-y-2 text-sm">
            {cart.items.map((i) => (
              <div key={i.id} className="flex justify-between text-slate-600">
                <span className="line-clamp-1">{i.name} × {i.quantity}</span>
                <span>{cart.currency} {i.line_total}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input className="input" placeholder={t('checkout.coupon')} value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          </div>

          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>{t('checkout.total')}</span>
            <span>{cart.subtotal_formatted}</span>
          </div>

          {error && <p className="mt-3 rounded-md bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

          <button type="submit" disabled={placing} className="btn-primary mt-6 w-full">
            {placing ? t('common.loading') : t('checkout.place_order')}
          </button>
        </div>
      </form>
    </div>
  )
}
