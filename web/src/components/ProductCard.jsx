import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Rating from './Rating'
import { useCart } from '../store/cart'

export default function ProductCard({ product }) {
  const { t } = useTranslation()
  const add = useCart((s) => s.add)

  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.on_sale && (
          <span className="absolute start-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
            -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.vendor && (
          <span className="text-xs font-medium text-brand-600">{product.vendor.store_name}</span>
        )}
        <Link to={`/product/${product.slug}`} className="mt-1 line-clamp-2 font-semibold text-slate-800 hover:text-brand-700">
          {product.name}
        </Link>

        <div className="mt-1">
          <Rating value={product.rating} count={product.total_reviews} />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">{product.price_formatted}</span>
            {product.on_sale && (
              <span className="ms-2 text-sm text-slate-400 line-through">{product.compare_at_price_formatted}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => add(product.id, 1)}
          disabled={!product.in_stock}
          className="btn-primary mt-3 w-full"
        >
          {product.in_stock ? t('product.add_to_cart') : t('product.out_of_stock')}
        </button>
      </div>
    </div>
  )
}
