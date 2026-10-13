import { NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../assets/img/Chupete blanco.png'

    // Estilo de cada link: el activo queda con el color primary y texto blanco, el resto blanco translúcido
    // (una sola función en vez de repetir el mismo className en cada NavLink)
    const linkClass = ({ isActive }) =>
      `${isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-white/85 hover:bg-white/10 hover:text-white'
      } block text-start py-3 px-4 rounded-xl font-medium transition-colors`

    export default function Sidebar (){
      const { user } = useAuth()
       if (!user) return null

        return (
    <div className="h-full flex flex-col p-4">
      {/* Logo redondo (círculo blanco con borde azul) sobre el fondo azul */}
      <NavLink to="/" end>
        <div className="flex flex-col items-center gap-2 mb-6 pt-2">
          <img src={Logo} alt="Surf Coffee" className="h-28 drop-shadow-md" />
        </div>
      </NavLink>

      <nav className="flex flex-col gap-1" >
          <NavLink to="/ventas" className={linkClass}>Ventas</NavLink>

          {/* Caja: visible para todos (empleados abren/cierran caja) */}
          <NavLink to="/caja" className={linkClass}>Caja</NavLink>

          {user.isAdmin && (<NavLink to="/products" end className={linkClass}>Productos</NavLink>)}

          {user.isAdmin && (<NavLink to="/gastos" className={linkClass}>Gastos</NavLink>)}

          {user.isAdmin && (<NavLink to="/config" className={linkClass}>Configuración</NavLink>)}
      </nav>
    </div>
  )
    }
