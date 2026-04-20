import GastosForm from "../components/Gastos/GastosForm";
import GastosPanel from "../components/Gastos/GastosPanel"
import TipoGastosForm from "../components/Gastos/TipoGastosForm" 
import TipoGastosPanel from "../components/Gastos/TipoGastosPanel"
import { useState } from "react"

export default function GastosPage(){

    const [paginaActual, setPaginaActual] = useState("gastos");

  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 justify-around items-center ">
     <div className="flex flex-row gap-2 flex-wrap"> 
      <button className="text-xl font-bold text-gray-700 bg-white border-2 border-black" 
      onClick={()=>{setPaginaActual("gastos")}}
      >Gastos (insumos)</button>
     <button className="text-xl font-bold text-gray-700 bg-white border-2 border-black"
      onClick={() => {setPaginaActual("tipodegastos")}}
     >Tipo de gastos</button>
     
      </div> 
      
      <div className="flex flex-row gap-2 flex-wrap">
      { (paginaActual === "gastos") && <GastosForm/> } 
      { (paginaActual === "gastos") && <GastosPanel/> } 
      { (paginaActual === "tipodegastos") && <TipoGastosForm/>}
      { (paginaActual === "tipodegastos") &&  <TipoGastosPanel/>}
      </div>
    </div>
  )
}
