import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="container-page py-24 text-center">
      <p className="text-7xl font-extrabold text-brand-600">404</p>
      <p className="mt-4 text-lg text-slate-500">Page not found.</p>
      <Link to="/" className="btn-primary mt-8">{t('nav.home')}</Link>
    </div>
  )
}
