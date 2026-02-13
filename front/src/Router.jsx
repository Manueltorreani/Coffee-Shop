import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import CartaPage from './pages/CartaPage.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'

import ProductsPage from './pages/ProductsPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import CajaPage from './pages/CajaPage.jsx'
import GastosPage from './pages/GastosPage.jsx'
import ConfigPage from './pages/ConfigPage.jsx'

import { useAuth } from './context/AuthContext.jsx'

// Guards -> Rutas protegidas y rutas solo para admin
function ProtectedRoute({ children }) {
  const auth = useAuth()

  if (!auth || auth.loading) {
    return <div>Cargando...</div> // podriamos poner una tuerquita o algo mientras se verifica el estado de autenticación (por ejemplo, si el token es valido o no)
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()

  if (!user?.isAdmin) return <Navigate to="/" replace />

  return children
}

export default function Router() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protegido */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* INDEX → CARTA (todos) */}
        <Route index element={<CartaPage />} />

        {/* ADMIN */}
        <Route
          path="products"
          element={
            <AdminRoute>
              <ProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="ventas"
          element={
            <AdminRoute>
              <VentasPage />
            </AdminRoute>
          }
        />
        <Route
          path="caja"
          element={
            <AdminRoute>
              <CajaPage />
            </AdminRoute>
          }
        />
        <Route
          path="gastos"
          element={
            <AdminRoute>
              <GastosPage />
            </AdminRoute>
          }
        />
        <Route
          path="config"
          element={
            <AdminRoute>
              <ConfigPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
