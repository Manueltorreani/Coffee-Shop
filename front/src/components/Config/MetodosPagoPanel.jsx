import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { deletePaymentMethod, getPaymentMethods } from "../../services/fetch/paymentMethods";
import { Trash2, SquarePen } from "lucide-react";
import ModalLoading from "../ModalLoading";
import ModalModified from "../ModalModified";
import MetodosPagoForm from "./MetodosPagoForm";

const MetodosPagoPanel = forwardRef((props,ref) => {
   
    const [metodos, setMetodos] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [editando, setEditando] = useState(null) // fila que se está editando (null = modal cerrado)
  
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getPaymentMethods();
        setMetodos(data);
      } catch (error) {
        console.error("Error cargando métodos de pago:", error);
      }finally{
        setIsLoading(false)
      } 
    };
    
    useImperativeHandle(ref, () => ({ fetchData }));  // ← exponés fetchData al padre

    useEffect ( () =>  {
        fetchData();
    },[]) ;
    
    const handleDelete = async (id) =>{
      if(!window.confirm("Eliminar este método de pago? (las ventas viejas conservan el nombre)")) return;
      setIsLoading(true)
      try {
        await deletePaymentMethod(id);
        fetchData();
      } catch (error) {
        console.error("Error eliminando:",error)
      }finally{
        setIsLoading(false)
      }
    }

    function handleEditado(){
      setEditando(null);
      fetchData();
    }

    return(
      <> 
        { isLoading && <ModalLoading/>}
        { editando && (
          <ModalModified onClose={() => setEditando(null)}>
            <MetodosPagoForm isModified={true} metodo={editando} onCreated={handleEditado}/>
          </ModalModified>
        )}
        <div className="tabla-card w-[420px] max-h-[400px]" >
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="px-4 py-3 text-left w-[30px]">#</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left w-[70px]">Accion</th>
              </tr>
            </thead>
            <tbody>
              {metodos.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.nombre}</td>
                  <td className="px-3 py-2 flex flex-row gap-2">
                    <button onClick={() => handleDelete(row.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                    <button onClick={() => setEditando(row)} className="text-gray-400 hover:text-amber-500 transition-colors">
                      <SquarePen size={15} />
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
export default MetodosPagoPanel;
