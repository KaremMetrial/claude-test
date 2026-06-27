import { create } from 'zustand'
import api, { storage } from '../api/client'

export const useAuth = create((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  /** Restore the session on app start if a token is present. */
  async init() {
    if (!storage.getToken()) {
      set({ initialized: true })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.data, initialized: true })
    } catch {
      storage.setToken(null)
      set({ user: null, initialized: true })
    }
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    storage.setToken(data.token)
    set({ user: data.user.data ?? data.user })
    return data
  },

  async register(payload) {
    const { data } = await api.post('/auth/register', payload)
    storage.setToken(data.token)
    set({ user: data.user.data ?? data.user })
    return data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      /* ignore network errors on logout */
    }
    storage.setToken(null)
    set({ user: null })
  },

  isAuthenticated: () => !!get().user,
}))
