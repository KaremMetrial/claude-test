import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
]

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('bazario_lang') : null

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: stored || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

/** Keep <html lang/dir> and persistence in sync whenever the language changes. */
export function applyLanguage(code) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
  i18n.changeLanguage(lang.code)
  localStorage.setItem('bazario_lang', lang.code)
  document.documentElement.lang = lang.code
  document.documentElement.dir = lang.dir
}

// Apply once on load so direction is correct before first paint settles.
applyLanguage(i18n.language)

export default i18n
