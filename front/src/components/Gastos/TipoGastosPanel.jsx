import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { deleteTipoGasto, getTipoGastos } from "../../services/fetch/gastos";
import { Trash2 } from "lucide-react";

  const TipoGastosPanel = forwardRef((props,ref) => {
   
    const [tipoDeGastos, setTipoDeGastos] = useState([])
    

    const fetchData = async () => {
      try {
        const data = await getTipoGastos();
        setTipoDeGastos(data);
        console.log(data);
      } catch (error) {
        console.error("Error cargando tipos:", error);
      }
    };
    
    useImperativeHandle(ref, () => ({ fetchData }));  // ← exponés fetchData al padre

    useEffect ( () =>  {
        fetchData();
    },[]) ;
    
    const handleDelete = async (id) =>{
      if(!window.confirm("Eliminar este tipo de gasto?")) return;
      try {
        await deleteTipoGasto(id);
        fetchData();
      } catch (error) {
        console.error("Error eliminando:",error)
      }
    }
    return(
        <> 
        <div className="w-[420px] max-h-[400px] overflow-y-auto bg-white text-black rounded-2xl shadow" >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="px-4 py-3 text-left w-[30px]">#</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left w-[80px]">Estado</th>
                <th className="px-4 py-3 text-left w-[70px]">Accion</th>
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
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.estado ?"activo":"inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
        </>

    )

});
export default TipoGastosPanel; 