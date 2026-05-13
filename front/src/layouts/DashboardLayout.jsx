import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { clearToken } from '../lib/auth.js'
import  Image  from '../assets/img/LOGOSINFONDO.png'
import Letras from '../assets/img/LOGOLETRAS.png'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // 🔐 Logout
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      style={{

        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',

      }}
      className='p-0 m-0'
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          borderRight: `1px solid var(--border)`,
          background: '#fff',
        }}
      >
        <Sidebar />
      </aside>
      <div style={{ display:'flex', flexDirection:'column', width:'100%', height: '100%' }} >
        {/* Topbar */}
        <header
          style={{
            width: '100%',
            height: 60,
            borderBottom: `1px solid var(--border)`,
            background: '#fff',
          }}
        >
          <Topbar userName={user?.nombre || 'usuario'} onLogout={handleLogout} />
        </header>

        {/* Main */}
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1, 
            width: '100%',
            padding: '20px',
            overflow: 'auto',
            backgroundColor: '#f3f4f6', 
          }}
        >
          {/* CONTENEDOR BLANCO*/}
          <div 
            className="card" 
            style={{ 
              position: 'relative',
              flex: 1,
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            {/* LOGO COMO MARCA DE AGUA*/}
            <img
              src={Image}
              alt="bg"
              style={{
                position: 'absolute', 
                bottom: '20px',
                right: '20px',
                width: '400px',
                opacity: 0.10,
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* LAS PÁGINAS */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

    </div>
  )
}
