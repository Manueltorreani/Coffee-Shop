import { NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx'

    const linkStyle = {
        display : 'flex', alignItems:'center', gap:10,
        padding:'10px 14px', borderRadius : 8, color:'var(--text)', textDecoration:'none'
    }

    export default function Sidebar (){
      const { user } = useAuth()
       if (!user) return null

        return (
    <div style={{ padding:16 }}>
      {/* Logo simple */}
      <NavLink to="/" end>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{
            width:36, height:36, borderRadius:8,
            background:'var(--blue-600)'
          }} />
          <strong>Coffee Admin</strong>
        </div>
      </NavLink>

      <nav className="flex flex-col gap-6 mt-5" >

          <NavLink to="/products" end
            className={({ isActive }) =>
              `${isActive 
                  ? 'bg-[var(--blue-50)] text-[var(--blue-700)] border-2 border-[var(--blue-500)]' 
                  : 'bg-transparent hover:text-blue-500 hover:border-2 hover:border-[var(--blue-300)]'
              } text-start m-0 py-3 pl-5 pr-1 rounded-lg`
            }
          >Productos</NavLink>

          <NavLink to="/ventas"
            className={({ isActive }) =>
              `${isActive 
                  ? 'bg-[var(--blue-50)] text-[var(--blue-700)] border-2 border-[var(--blue-500)]' 
                  : 'bg-transparent hover:text-blue-500 hover:border-2 hover:border-[var(--blue-300)]'
              } text-start m-0 py-3 pl-5 pr-1 rounded-lg`
            }
          >Ventas</NavLink>

          <NavLink to="/caja"
            className={({ isActive }) =>
              `${isActive 
                  ? 'bg-[var(--blue-50)] text-[var(--blue-700)] border-2 border-[var(--blue-500)]' 
                  : 'bg-transparent hover:text-blue-500 hover:border-2 hover:border-[var(--blue-300)]'
              } text-start m-0 py-3 pl-5 pr-1 rounded-lg`
            }
        >Movimientos de caja</NavLink>

          <NavLink to="/gastos"
            className={({ isActive }) =>
              `${isActive 
                  ? 'bg-[var(--blue-50)] text-[var(--blue-700)] border-2 border-[var(--blue-500)]' 
                  : 'bg-transparent hover:text-blue-500 hover:border-2 hover:border-[var(--blue-300)]'
              } text-start justify-center m-0 py-3 pl-5  rounded-lg`
            }
          >Gastos</NavLink>

        <NavLink to="/config"
          className={({ isActive }) =>
              `${isActive 
                  ? 'bg-[var(--blue-50)] text-[var(--blue-700)] border-2 border-[var(--blue-500)]' 
                  : 'bg-transparent hover:text-blue-500 hover:border-2 hover:border-[var(--blue-300)]'
              } text-start m-0 py-3 pl-5 pr-1 rounded-lg`
            }
        >
          Configuración
        </NavLink>

      </nav>
    </div>
  )
    }