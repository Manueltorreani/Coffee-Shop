import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { deleteTipoGasto, getTipoGastos } from "../../services/fetch/gastos";
import { Trash2, SquarePen } from "lucide-react";
import ModalModified from "../ModalModified";
import ModalLoading from "../ModalLoading";
import TipoGastosForm from "./TipoGastosForm";

  const TipoGastosPanel = forwardRef((props,ref) => {
   
    const [tipoDeGastos, setTipoDeGastos] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [editando, setEditando] = useState(null) // fila que se está editando (null = modal cerrado)
  
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getTipoGastos();
        setTipoDeGastos(data);
        console.log(data);
      } catch (error) {
        console.error("Error cargando tipos:", error);

      }finally{
        setIsLoading(false)

      } 
    };
    
    useImperativeHandle(ref, () => ({ fetchData }));  // ← exponés fetchData al padre

    useEffect ( () =>  {
        fetchData();
    },[]) ;
    
    const handleDelete = async (id) =>{
      if(!window.confirm("Eliminar este tipo de gasto?")) return;
      setIsLoading(true)
      try {
        await deleteTipoGasto(id);
        fetchData();
      } catch (error) {
        console.error("Error eliminando:",error)
      }finally{
        setIsLoading(false)
      }
    }

    // cuando el form de edición guarda: cerramos el modal y refrescamos la tabla
    function handleEditado(){
      setEditando(null);
      fetchData();
    }

    return(
      <> 
        { isLoading && <ModalLoading/>}
        { editando && (
          <ModalModified onClose={() => setEditando(null)}>
            <TipoGastosForm isModified={true} tipoGastos={editando} onCreated={handleEditado}/>
          </ModalModified>
        )}
        <div className="tabla-card w-[420px] max-h-[400px]" >
         
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="tabla-celda text-left w-[30px]">#</th>
                <th className="tabla-celda text-left">Nombre</th>
                <th className="tabla-celda text-left w-[80px]">Estado</th>
                <th className="tabla-celda text-left w-[70px]">Accion</th>
              </tr>
            </thead>
            <tbody>
              {tipoDeGastos.map((row) => (
                <tr
                  key={row.id}
                  className="tabla-fila"
                >
                  <td className="tabla-celda text-texto-suave/70">{row.id}</td>
                  <td className="tabla-celda font-medium text-dark">{row.nombre}</td>
                  <td className="tabla-celda">
                    <span className={`badge ${row.estado ? 'badge-exito' : 'badge-error'}`}>
                      {row.estado ?"activo":"inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex flex-row gap-2">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="btn-icono btn-icono-borrar"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button className="btn-icono btn-icono-editar"
                      onClick={() => setEditando(row)}
                     >
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
export default TipoGastosPanel; 

