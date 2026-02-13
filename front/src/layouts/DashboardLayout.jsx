import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { clearToken } from '../lib/auth.js'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // 🔐 Logout
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // 🔁 Redirección por rol
  useEffect(() => {
    if (!user) return

    // Usuario normal → solo carta
    if (!user.isAdmin && window.location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gridTemplateRows: '64px 1fr',
        gridTemplateAreas: `"sidebar topbar"
                            "sidebar main"`,
        height: '100vh',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          gridArea: 'sidebar',
          borderRight: `1px solid var(--border)`,
          background: '#fff',
        }}
      >
        <Sidebar />
      </aside>

      {/* Topbar */}
      <header
        style={{
          gridArea: 'topbar',
          borderBottom: `1px solid var(--border)`,
          background: '#fff',
        }}
      >
        <Topbar onLogout={handleLogout} />
      </header>

      {/* Main */}
      <main
        style={{
          gridArea: 'main',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        <div className="card" style={{ padding: 20 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
