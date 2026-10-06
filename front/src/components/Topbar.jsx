import { useEffect,useState } from "react";
import { LogOut } from "lucide-react";

export default function Topbar({ userName = 'usuario', onLogout }) {
  const [now, setNow] = useState(new Date())
  
  // opcional: avisá si no vino la prop
  if (typeof onLogout !== 'function') {
    console.warn('Topbar: onLogout no fue provisto');
  }

  // reloj: actualiza la hora cada segundo y limpia el intervalo al desmontar
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  const fecha = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

     return(
    <div className="h-full w-full flex items-center justify-between px-6">
      {/* Fecha a la izquierda */}
      <div className="text-slate-500 capitalize">{fecha}</div>

      {/* Hora, usuario y salir a la derecha */}
      <div className="flex items-center gap-4">
        <span className="text-surf-700 font-bold tabular-nums">{hora}</span>
        <span className="text-slate-700">Hola, <strong>{userName}</strong></span>
        <button className="btn-secundario flex items-center gap-2 py-1.5" onClick={onLogout}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </div>
     )
}
