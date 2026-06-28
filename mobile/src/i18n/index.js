import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'

import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'

export const LANGUAGES = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'fr', label: 'Français', rtl: false },
]

const deviceLang = Localization.getLocales?.()[0]?.languageCode || 'en'
const initialLang = LANGUAGES.some((l) => l.code === deviceLang) ? deviceLang : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

/**
 * Change language and apply RTL. Note: on native, flipping the layout direction
 * requires an app reload to fully take effect (I18nManager limitation), so call
 * sites should prompt the user to restart when toggling to/from Arabic.
 */
export async function setLanguage(code) {
  const lang = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0]
  await i18n.changeLanguage(lang.code)
  await AsyncStorage.setItem('bazario_lang', lang.code)
  if (I18nManager.isRTL !== lang.rtl) {
    I18nManager.allowRTL(lang.rtl)
    I18nManager.forceRTL(lang.rtl)
  }
}

export async function restoreLanguage() {
  const saved = await AsyncStorage.getItem('bazario_lang')
  if (saved) await i18n.changeLanguage(saved)
}

export default i18n
