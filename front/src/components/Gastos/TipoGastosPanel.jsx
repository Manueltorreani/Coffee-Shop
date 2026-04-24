import { useState, useEffect } from "react";
import { getTipoGastos } from "../../services/fetch/gastos";

export default function TipoGastosPanel (){
   
    const [tipoDeGastos, setTipoDeGastos] = useState([])
    
    useEffect ( async () =>  {
        const data = await getTipoGastos()
        setTipoDeGastos(data)
        console.log(data)
    },[]) 
    return(
        <> 
        <div className="w-[300px] h-[300px] bg-white text-black rounded-2xl" >

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {tipoDeGastos.map((row) => (
            <tr
              key={row.id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-400">{row.id}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{row.nombre}</td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[row.estado]}`}>
                  {row.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

        </>

    )

}