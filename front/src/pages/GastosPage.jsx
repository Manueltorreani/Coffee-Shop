import GastosForm from "../components/Gastos/GastosForm";
import GastosPanel from "../components/Gastos/GastosPanel"
import TipoGastosForm from "../components/Gastos/TipoGastosForm" 
import TipoGastosPanel from "../components/Gastos/TipoGastosPanel"
import { useState,useRef } from "react"

export default function GastosPage(){

    const [paginaActual, setPaginaActual] = useState("gastos");
    const tipoGastosPanelRef = useRef(null);
    const gastosPanelRef = useRef(null);

    function refrescarTipoGastos() {
        tipoGastosPanelRef.current?.fetchData();  // ← llama fetchData del panel
    }
    function refrescarGastos(){
      gastosPanelRef.current?.fetchData();
    }

  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 justify-start items-start z-10 ">
     <div className="flex flex-row gap-2 flex-wrap"> 
      <button className="text-xl font-bold text-gray-700 bg-white border-2 border-black" 
      onClick={()=>{setPaginaActual("gastos")}}
      >Gastos (insumos)</button>
     <button className="text-xl font-bold text-gray-700 bg-white border-2 border-black"
      onClick={() => {setPaginaActual("tipodegastos")}}
     >Tipo de gastos</button>
     
      </div> 
      
      <div className="flex flex-row gap-2 flex-wrap">
      { (paginaActual === "gastos") && <GastosForm onCreated ={refrescarGastos}/> } 
      { (paginaActual === "gastos") && <GastosPanel ref={gastosPanelRef}/> } 
      { (paginaActual === "tipodegastos") && <TipoGastosForm onCreated={refrescarTipoGastos}/>}
      { (paginaActual === "tipodegastos") &&  <TipoGastosPanel ref={tipoGastosPanelRef}/>}
      </div>
    </div>
  )
}
