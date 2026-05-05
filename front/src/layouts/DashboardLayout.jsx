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
      <div style={{ display:'flex', flexDirection:'column', width:'100%'}} >
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
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '20px',
          overflow: 'auto',
        }}
        >
          <img
          src={Image}
          alt="bg"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '400px',
            opacity: 0.45,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
          <div className="card z-10" style={{ padding: 20 }}>
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}
