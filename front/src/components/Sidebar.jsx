import { NavLink } from "react-router-dom";

    const linkStyle = {
        display : 'flex', alignItems:'center', gap:10,
        padding:'10px 14px', borderRadius : 8, color:'var(--text)', textDecoration:'none'
    }

    export default function Sidebar (){

        return (
    <div style={{ padding:16 }}>
      {/* Logo simple */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:'var(--blue-600)'
        }} />
        <strong>Coffee Admin</strong>
      </div>

      <nav style={{ display:'grid', gap:6 }}>
        <NavLink to="/" end
          style={({isActive})=>({
            ...linkStyle,
            background: isActive ? 'var(--blue-50)' : 'transparent',
            color: isActive ? 'var(--blue-700)' : 'var(--text)'
          })}
        >Productos</NavLink>

        <NavLink to="/ventas"
          style={({isActive})=>({
            ...linkStyle,
            background: isActive ? 'var(--blue-50)' : 'transparent',
            color: isActive ? 'var(--blue-700)' : 'var(--text)'
          })}
        >Ventas</NavLink>

        <NavLink to="/caja"
          style={({isActive})=>({
            ...linkStyle,
            background: isActive ? 'var(--blue-50)' : 'transparent',
            color: isActive ? 'var(--blue-700)' : 'var(--text)'
          })}
        >Movimientos de caja</NavLink>

        <NavLink to="/gastos"
          style={({isActive})=>({
            ...linkStyle,
            background: isActive ? 'var(--blue-50)' : 'transparent',
            color: isActive ? 'var(--blue-700)' : 'var(--text)'
          })}
        >Gastos</NavLink>

        <NavLink to="/config"
          style={({isActive})=>({
            ...linkStyle,
            background: isActive ? 'var(--blue-50)' : 'transparent',
            color: isActive ? 'var(--blue-700)' : 'var(--text)'
          })}
        >Configuración</NavLink>
      </nav>
    </div>
  )
    }