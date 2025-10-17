import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './lib/auth.js'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'

// Tus páginas reales
import ProductsPage from './pages/ProductsPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import CajaPage from './pages/CajaPage.jsx'
import GastosPage from './pages/GastosPage.jsx'
import ConfigPage from './pages/ConfigPage.jsx'

//pequeño wrapper de ruta protegida 
function PrivateRoute({children}){
  return isAuthenticated() ? children: <Navigate to ="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/*login publico */}
      <Route path='/login' element={<LoginPage/>} />
      {/* dashboard protegido : todo lo que cuelga de "/" requiere login   */}
       <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Ruta por defecto dentro del layout */}
        <Route index element={<ProductsPage />} />
        <Route path="ventas" element={<VentasPage />} />
        <Route path="caja" element={<CajaPage />} />
        <Route path="gastos" element={<GastosPage />} />
        <Route path="config" element={<ConfigPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
