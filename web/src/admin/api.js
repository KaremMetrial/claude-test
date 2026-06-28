import api from '../api/client'

/** Admin panel API calls (require an authenticated admin token). */
export const adminApi = {
  stats: () => api.get('/admin/dashboard/stats').then((r) => r.data.data),

  vendors: (params) => api.get('/admin/vendors', { params }).then((r) => r.data),
  setVendorStatus: (id, status) => api.patch(`/admin/vendors/${id}/status`, { status }).then((r) => r.data),

  categories: () => api.get('/admin/categories').then((r) => r.data.data),
  createCategory: (body) => api.post('/admin/categories', body).then((r) => r.data),
  updateCategory: (id, body) => api.put(`/admin/categories/${id}`, body).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  currencies: () => api.get('/admin/currencies').then((r) => r.data.data),
  createCurrency: (body) => api.post('/admin/currencies', body).then((r) => r.data),
  updateCurrency: (id, body) => api.put(`/admin/currencies/${id}`, body).then((r) => r.data),
  deleteCurrency: (id) => api.delete(`/admin/currencies/${id}`).then((r) => r.data),

  coupons: () => api.get('/admin/coupons').then((r) => r.data.data),
  createCoupon: (body) => api.post('/admin/coupons', body).then((r) => r.data),
  updateCoupon: (id, body) => api.put(`/admin/coupons/${id}`, body).then((r) => r.data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data),

  orders: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
}
