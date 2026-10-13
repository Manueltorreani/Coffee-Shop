import AbrirCajaForm from "../components/Caja/AbrirCajaForm";
import MovimientoForm from "../components/Caja/MovimientoForm";
import CerrarCajaForm from "../components/Caja/CerrarCajaForm";
import CajaResumen from "../components/Caja/CajaResumen";
import ArqueosPanel from "../components/Caja/ArqueosPanel";
import { getCajaActual } from "../services/fetch/caja";
import { useAuth } from "../context/AuthContext.jsx";
import ModalLoading from "../components/ModalLoading";
import { useState, useEffect, useRef } from "react"

// A diferencia de Gastos, acá la PÁGINA guarda la caja actual en un estado,
// porque varios componentes dependen del mismo dato (resumen, form de movimientos y form de cierre).
// Cada form llama a fetchCaja después de guardar -> todo se actualiza junto.
export default function CajaPage(){

    const { user } = useAuth();
    const [paginaActual, setPaginaActual] = useState("actual");
    const [caja, setCaja] = useState(null);           // caja abierta (null = no hay)
    const [ultimoCierre, setUltimoCierre] = useState(null); // resultado del cierre recién hecho
    const [isLoading, setIsLoading] = useState(false);
    const arqueosPanelRef = useRef(null);

    const fetchCaja = async () => {
      setIsLoading(true)
      try {
        const data = await getCajaActual();
        setCaja(data);
      } catch (error) {
        console.error("Error cargando caja:", error);
      }finally{
        setIsLoading(false)
      }
    };

    useEffect(() => {
      fetchCaja();
    }, []);

    function handleAbierta(){
      setUltimoCierre(null);
      fetchCaja();
    }

    function handleCerrada(arqueo){
      setUltimoCierre(arqueo);
      fetchCaja();
      arqueosPanelRef.current?.fetchData();
    }

  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 justify-start items-start z-10 ">
     { isLoading && <ModalLoading/>}
     <div className="tabs">
      <button className={`tab ${paginaActual === "actual" ? "tab-activo" : ""}`}
      onClick={()=>{setPaginaActual("actual")}}
      >Caja actual</button>
      {user?.isAdmin && (
        <button className={`tab ${paginaActual === "historial" ? "tab-activo" : ""}`}
        onClick={()=>{setPaginaActual("historial")}}
        >Historial de arqueos</button>
      )}
      </div>

      {/* resultado del último cierre */}
      { (paginaActual === "actual") && ultimoCierre && (
        <div className={`p-4 rounded-2xl shadow text-dark ${ultimoCierre.diferencia < 0 ? 'bg-error-suave' : 'bg-exito-suave'}`}>
          Caja #{ultimoCierre.id} cerrada. Sistema: ${ultimoCierre.montoSistema.toFixed(2)} · Contado: ${ultimoCierre.montoUsuario.toFixed(2)} ·{' '}
          <strong>Diferencia: ${ultimoCierre.diferencia.toFixed(2)}</strong>
        </div>
      )}

      <div className="flex flex-row gap-2 flex-wrap items-start">
      { (paginaActual === "actual") && !caja && !isLoading && <AbrirCajaForm onCreated={handleAbierta}/> }
      { (paginaActual === "actual") && caja && <CajaResumen caja={caja} onChange={fetchCaja}/> }
      { (paginaActual === "actual") && caja && (
        <div className="flex flex-col gap-3">
          <MovimientoForm onCreated={fetchCaja}/>
          <CerrarCajaForm detalle={caja.resumen.detalle} onCreated={handleCerrada}/>
        </div>
      )}
      { (paginaActual === "historial") && <ArqueosPanel ref={arqueosPanelRef}/> }
      </div>
    </div>
  )
}
