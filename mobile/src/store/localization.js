import { create } from 'zustand'
import api, { session } from '../api/client'

/** Languages + currencies catalog and the active currency selection. */
export const useLocalization = create((set, get) => ({
  languages: [],
  currencies: [],
  currency: 'USD',

  async load() {
    set({ currency: session.getCurrency() })
    try {
      const { data } = await api.get('/localization')
      set({ languages: data.languages, currencies: data.currencies })
    } catch {
      set({ currencies: [{ code: 'USD', symbol: '$' }] })
    }
  },

  async setCurrency(code) {
    await session.setCurrency(code)
    set({ currency: code })
  },
}))
