import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import VendorPage from './pages/VendorPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Orders from './pages/Orders'
import NotFound from './pages/NotFound'

import RequireVendor from './dashboard/RequireVendor'
import DashboardLayout from './dashboard/DashboardLayout'
import Overview from './dashboard/pages/Overview'
import DashProducts from './dashboard/pages/Products'
import ProductForm from './dashboard/pages/ProductForm'
import DashOrders from './dashboard/pages/Orders'
import Store from './dashboard/pages/Store'

import RequireAdmin from './admin/RequireAdmin'
import AdminLayout from './admin/AdminLayout'
import AdminOverview from './admin/pages/Overview'
import AdminVendors from './admin/pages/Vendors'
import AdminCategories from './admin/pages/Categories'
import AdminCurrencies from './admin/pages/Currencies'
import AdminCoupons from './admin/pages/Coupons'
import AdminOrders from './admin/pages/Orders'

import { useAuth } from './store/auth'
import { useCart } from './store/cart'
import { useLocalization } from './store/localization'

export default function App() {
  const initAuth = useAuth((s) => s.init)
  const fetchCart = useCart((s) => s.fetch)
  const loadLocalization = useLocalization((s) => s.load)

  useEffect(() => {
    loadLocalization()
    initAuth()
    fetchCart()
  }, [initAuth, fetchCart, loadLocalization])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Catalog />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="vendor/:slug" element={<VendorPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="orders" element={<Orders />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Vendor dashboard — own chrome, guarded by vendor/admin role */}
      <Route
        path="dashboard"
        element={
          <RequireVendor>
            <DashboardLayout />
          </RequireVendor>
        }
      >
        <Route index element={<Overview />} />
        <Route path="products" element={<DashProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="orders" element={<DashOrders />} />
        <Route path="store" element={<Store />} />
      </Route>

      {/* Admin panel — own chrome, guarded by admin role */}
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="currencies" element={<AdminCurrencies />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>
    </Routes>
  )
}
