import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div>
          <p className="text-lg font-extrabold text-brand-700">{t('app.name')}</p>
          <p className="text-sm text-slate-500">{t('app.tagline')}</p>
        </div>
        <p className="text-sm text-slate-400">
          © {year} {t('app.name')}. {t('common.all_rights')}
        </p>
      </div>
    </footer>
  )
}
