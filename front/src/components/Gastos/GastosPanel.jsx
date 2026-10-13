import { useState,useEffect } from "react";
import { deleteGasto, getGastos } from "../../services/fetch/gastos";
import { Trash2, SquarePen } from "lucide-react";
import { forwardRef, useRef } from "react";
import { useImperativeHandle } from "react";
import ModalLoading from "../ModalLoading";
import GastosForm from "./GastosForm";
import ModalModified from "../ModalModified";

const GastosPanel = forwardRef ((props, ref) => {

       const [gastos, setGastos] = useState([])
       const [isLoading, setIsLoading] = useState(false)
       const [editando, setEditando] = useState(null) // fila que se está editando (null = modal cerrado)
   
       const fetchData = async () => {
        setIsLoading(true)
         try {
           const data = await getGastos();
           setGastos(data);
           console.log(data);
         } catch (error) {
           console.error("Error cargando gastos:", error);
         }finally{
          setIsLoading(false)
         }
       };
       
       useImperativeHandle(ref, () =>({fetchData}));

       useEffect ( () =>  {
           fetchData();
       },[]) ;
       
       const handleDelete = async (id) =>{
         if(!window.confirm("Eliminar este gasto?")) return;
        setIsLoading(true)
         try {
           await deleteGasto(id);
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
            <GastosForm isModified={true} gasto={editando} onCreated={handleEditado}/>
          </ModalModified>
        )}
        <div className="tabla-card w-[560px] max-h-[400px]" >
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="tabla-celda text-left w-[30px]">#</th>
                <th className="tabla-celda text-left">Fecha</th>
                <th className="tabla-celda text-left">Categoria</th>
                <th className="tabla-celda text-left">Nombre</th>
                <th className="tabla-celda text-left">Pago</th>
                <th className="tabla-celda text-left w-[70px]">Importe</th>
                <th className="tabla-celda text-left w-[70px]">Accion</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((row) => (
                <tr
                  key={row.id}
                  className="tabla-fila"
                >
                  <td className="tabla-celda text-texto-suave/70">{row.id}</td>
                  <td className="tabla-celda text-texto-suave">{new Date(row.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="tabla-celda font-medium text-dark">{row.tipoGastos?.nombre}</td>
                  <td className="tabla-celda font-medium text-dark">{row.nombre}</td>
                  <td className="tabla-celda text-texto-suave">{row.paymentMethod || '-'}</td>
                  <td className="tabla-celda font-medium text-dark">${row.precio}</td>
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
export default GastosPanel; 
