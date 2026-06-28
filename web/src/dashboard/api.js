import api from '../api/client'

/** Vendor dashboard API calls (all require an authenticated vendor token). */
export const vendorApi = {
  stats: () => api.get('/vendor/dashboard/stats').then((r) => r.data.data),

  products: (params) => api.get('/vendor/products', { params }).then((r) => r.data),
  product: (id) => api.get(`/vendor/products/${id}`).then((r) => r.data.data),
  createProduct: (body) => api.post('/vendor/products', body).then((r) => r.data),
  updateProduct: (id, body) => api.put(`/vendor/products/${id}`, body).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`).then((r) => r.data),

  orders: (params) => api.get('/vendor/orders', { params }).then((r) => r.data),
  updateOrderStatus: (id, status) =>
    api.patch(`/vendor/orders/${id}/status`, { status }).then((r) => r.data),

  profile: () => api.get('/vendor/profile').then((r) => r.data.data),
  updateProfile: (body) => api.put('/vendor/profile', body).then((r) => r.data),
}
