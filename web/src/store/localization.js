import { create } from 'zustand'
import api, { storage } from '../api/client'
import { applyLanguage } from '../i18n'

/**
 * Holds the catalog of available languages/currencies (fetched from the API)
 * and the user's active selections. Changing either re-renders prices and text
 * everywhere because components read from this store.
 */
export const useLocalization = create((set, get) => ({
  languages: [],
  currencies: [],
  currency: storage.getCurrency(),

  async load() {
    try {
      const { data } = await api.get('/localization')
      set({ languages: data.languages, currencies: data.currencies })
    } catch {
      // Sensible fallback so the switchers still work offline.
      set({
        currencies: [{ code: 'USD', symbol: '$' }],
        languages: [{ code: 'en', native_name: 'English', is_rtl: false }],
      })
    }
  },

  setLanguage(code) {
    applyLanguage(code)
    // Trigger a re-fetch of localized data wherever components listen.
    set({ _langTick: Date.now() })
  },

  setCurrency(code) {
    storage.setCurrency(code)
    set({ currency: code })
  },

  activeCurrency: () => get().currencies.find((c) => c.code === get().currency),
}))
