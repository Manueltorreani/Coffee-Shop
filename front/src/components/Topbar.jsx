import { useEffect,useState } from "react";
export default function Topbar({ userName = 'usuario', onLogout }) {
  const [now, setNow] = useState(new Date().toLocaleTimeString())
  const [day, setDay] = useState(new Date().getUTCDay())
  const [month, setMonth] = useState(new Date().getUTCMonth())
  const [year, setYear] = useState(new Date().getUTCFullYear())
  
  // opcional: avisá si no vino la prop
  if (typeof onLogout !== 'function') {
    console.warn('Topbar: onLogout no fue provisto');
  }
      useEffect(() => {
        const interval = setInterval(() => {
          let date = new Date()
          setDay(date.getUTCDay())
          setNow(date.toLocaleTimeString())

          setNow(new Date().toLocaleTimeString())
        }, 1000)
      }, [])


     return(
        <div style={{
      height:'100%', display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 16px', width: "100%"
    }}>
      {/* Breadcrumb / título contextual (simple por ahora) */}
      <div style={{ color:'var(--muted)' }}>Panel</div>

      {/* Acciones a la derecha */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ color:'var(--muted)' }}>{now.split(':')[0]}:{now.split(':')[1]}</span>
        Hola {userName}
        <div className="btn" onClick={onLogout}>Salir</div>
      </div>
    </div>
     )
}