import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useCart } from '../store/cart'

export default function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cart, fetch, updateItem, remove, loading } = useCart()

  useEffect(() => {
    fetch()
  }, [fetch])

  const items = cart?.items || []

  if (!loading && items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg text-slate-500">{t('cart.empty')}</p>
        <Link to="/shop" className="btn-primary mt-6">{t('cart.continue_shopping')}</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{t('cart.title')}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <img src={item.thumbnail} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to={`/product/${item.slug}`} className="font-semibold text-slate-800 hover:text-brand-700">
                  {item.name}
                </Link>
                <p className="text-sm text-slate-500">{cart.currency} {item.unit_price}</p>
              </div>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, Math.max(1, Number(e.target.value)))}
                className="input w-20"
              />
              <span className="w-24 text-end font-semibold text-slate-900">
                {cart.currency} {item.line_total}
              </span>
              <button onClick={() => remove(item.id)} className="text-sm text-rose-600 hover:underline">
                {t('cart.remove')}
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-lg font-bold text-slate-900">{t('cart.subtotal')}</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{cart?.subtotal_formatted}</p>
          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            {t('cart.checkout')}
          </button>
          <Link to="/shop" className="btn-outline mt-3 w-full">
            {t('cart.continue_shopping')}
          </Link>
        </div>
      </div>
    </div>
  )
}
