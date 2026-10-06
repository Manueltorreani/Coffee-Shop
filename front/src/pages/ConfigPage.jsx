import MetodosPagoForm from "../components/Config/MetodosPagoForm";
import MetodosPagoPanel from "../components/Config/MetodosPagoPanel";
import UsuariosForm from "../components/Config/UsuariosForm";
import UsuariosPanel from "../components/Config/UsuariosPanel";
import DatosLocalForm from "../components/Config/DatosLocalForm";
import { useState,useRef } from "react"

// Mismo patrón que GastosPage: botones arriba para elegir la sección
// y useRef para que el form refresque la tabla después de crear.
export default function ConfigPage(){

    const [paginaActual, setPaginaActual] = useState("metodos");
    const metodosPanelRef = useRef(null);
    const usuariosPanelRef = useRef(null);

    function refrescarMetodos() {
        metodosPanelRef.current?.fetchData();  // ← llama fetchData del panel
    }
    function refrescarUsuarios(){
      usuariosPanelRef.current?.fetchData();
    }

  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 justify-start items-start z-10 ">
     <div className="tabs">
      <button className={`tab ${paginaActual === "metodos" ? "tab-activo" : ""}`}
      onClick={()=>{setPaginaActual("metodos")}}
      >Métodos de pago</button>
      <button className={`tab ${paginaActual === "usuarios" ? "tab-activo" : ""}`}
      onClick={()=>{setPaginaActual("usuarios")}}
      >Usuarios</button>
      <button className={`tab ${paginaActual === "local" ? "tab-activo" : ""}`}
      onClick={()=>{setPaginaActual("local")}}
      >Datos del local</button>
      <button className={`tab ${paginaActual === "impresion" ? "tab-activo" : ""}`}
      onClick={()=>{setPaginaActual("impresion")}}
      >Impresión</button>
      </div>

      <div className="flex flex-row gap-2 flex-wrap">
      { (paginaActual === "metodos") && <MetodosPagoForm onCreated={refrescarMetodos}/> }
      { (paginaActual === "metodos") && <MetodosPagoPanel ref={metodosPanelRef}/> }
      { (paginaActual === "usuarios") && <UsuariosForm onCreated={refrescarUsuarios}/>}
      { (paginaActual === "usuarios") && <UsuariosPanel ref={usuariosPanelRef}/>}
      {/* key distinto para que React monte un form nuevo al cambiar de pestaña (y recargue los datos) */}
      { (paginaActual === "local") && <DatosLocalForm key="local" mode="local"/>}
      { (paginaActual === "impresion") && <DatosLocalForm key="impresion" mode="impresion"/>}
      </div>
    </div>
  )
}
