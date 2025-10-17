import { Navigate, NavLink, Outlet, replace, useNavigate } from "react-router-dom";
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { clearToken } from '../lib/auth.js'

export default function DashboardLayout(){
     const navigate = useNavigate()

     //loout simple : barra token y redirige
        const handleLogout = () => {
             clearToken()                   // 🔹 elimina el token guardado
             navigate('/login', { replace:true })  // 🔹 redirige al login
        }


     return (
        <div style={{
            display : 'grid',
            gridTemplateColumns:'260px 1fr',
            gridTemplateRows:'64px 1fr',
            gridTemplateAreas: `"sidebar topbar"
                                "sidebar main"`,
            height:'100vh'  }}>
          {/* Sidebar izquierda */}
      <aside style={{ gridArea:'sidebar', borderRight:`1px solid var(--border)`, background:'#fff' }}>
        <Sidebar />
      </aside>
            {/* Barra superior */}
      <header style={{ gridArea:'topbar', borderBottom:`1px solid var(--border)`, background:'#fff' }}>
        <Topbar onLogout={handleLogout} />
      </header>

            {/* Contenido */}
      <main style={{ gridArea:'main', padding:'20px', overflow:'auto' }}>
        {/* Aquí se renderiza la página activa */}
          <div className="card" style={{ padding:20 }}>
          <Outlet />
            </div>
            </main>
        </div>
     )
}