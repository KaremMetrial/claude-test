import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import i18n from '../i18n'

const baseURL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:8000/api/v1'

const api = axios.create({ baseURL })

// In-memory mirrors of persisted values so interceptors stay synchronous.
let authToken = null
let cartToken = null
let currency = 'USD'

export async function hydrateClient() {
  authToken = await AsyncStorage.getItem('bazario_token')
  cartToken = await AsyncStorage.getItem('bazario_cart_token')
  currency = (await AsyncStorage.getItem('bazario_currency')) || 'USD'
}

export const session = {
  getToken: () => authToken,
  async setToken(t) {
    authToken = t
    t ? await AsyncStorage.setItem('bazario_token', t) : await AsyncStorage.removeItem('bazario_token')
  },
  getCurrency: () => currency,
  async setCurrency(c) {
    currency = c
    await AsyncStorage.setItem('bazario_currency', c)
  },
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  config.headers['X-Locale'] = i18n.language
  config.headers['X-Currency'] = currency
  config.headers.Accept = 'application/json'
  if (cartToken) config.headers['X-Cart-Token'] = cartToken
  return config
})

api.interceptors.response.use(
  async (response) => {
    if (response.data?.cart_token && response.data.cart_token !== cartToken) {
      cartToken = response.data.cart_token
      await AsyncStorage.setItem('bazario_cart_token', cartToken)
    }
    return response
  },
  (error) => Promise.reject(error)
)

export default api
