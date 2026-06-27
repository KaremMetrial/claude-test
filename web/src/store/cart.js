import { create } from 'zustand'
import api from '../api/client'

export const useCart = create((set) => ({
  cart: null,
  loading: false,

  async fetch() {
    set({ loading: true })
    try {
      const { data } = await api.get('/cart')
      set({ cart: data.data })
    } finally {
      set({ loading: false })
    }
  },

  async add(productId, quantity = 1) {
    const { data } = await api.post('/cart/items', { product_id: productId, quantity })
    set({ cart: data.data })
  },

  async updateItem(itemId, quantity) {
    const { data } = await api.patch(`/cart/items/${itemId}`, { quantity })
    set({ cart: data.data })
  },

  async remove(itemId) {
    const { data } = await api.delete(`/cart/items/${itemId}`)
    set({ cart: data.data })
  },

  clear() {
    set({ cart: null })
  },
}))
