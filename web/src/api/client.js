import axios from 'axios'
import i18n from '../i18n'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({ baseURL })

// Local storage keys
const TOKEN_KEY = 'bazario_token'
const CART_TOKEN_KEY = 'bazario_cart_token'
const CURRENCY_KEY = 'bazario_currency'

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)),
  getCartToken: () => localStorage.getItem(CART_TOKEN_KEY),
  setCartToken: (t) => t && localStorage.setItem(CART_TOKEN_KEY, t),
  getCurrency: () => localStorage.getItem(CURRENCY_KEY) || 'USD',
  setCurrency: (c) => localStorage.setItem(CURRENCY_KEY, c),
}

// Attach auth, locale, currency and guest-cart headers to every request.
api.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  config.headers['X-Locale'] = i18n.language
  config.headers['X-Currency'] = storage.getCurrency()
  config.headers.Accept = 'application/json'

  const cartToken = storage.getCartToken()
  if (cartToken) config.headers['X-Cart-Token'] = cartToken

  return config
})

// Persist any guest cart token the API hands back.
api.interceptors.response.use(
  (response) => {
    if (response.data?.cart_token) storage.setCartToken(response.data.cart_token)
    return response
  },
  (error) => {
    if (error.response?.status === 401) storage.setToken(null)
    return Promise.reject(error)
  }
)

export default api
