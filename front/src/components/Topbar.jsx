 export default function Topbar({ userName = 'usuario', onLogout }) {
  // opcional: avisá si no vino la prop
  if (typeof onLogout !== 'function') {
    console.warn('Topbar: onLogout no fue provisto');
  }
     const now = new Date().toLocaleTimeString()

     return(
        <div style={{
      height:'100%', display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 16px', width: "100%"
    }}>
      {/* Breadcrumb / título contextual (simple por ahora) */}
      <div style={{ color:'var(--muted)' }}>Panel</div>

      {/* Acciones a la derecha */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ color:'var(--muted)' }}>{now}</span>
        Hola {userName}
        <div className="btn" onClick={onLogout}>Salir</div>
      </div>
    </div>
     )
}