import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { fetchCategories } from "../../api/products";
import { SquarePen } from "lucide-react";
import ModalLoading from "../ModalLoading";

  // Tabla de categorías (mismo patrón que TipoGastosPanel).
  // props.onEdit(fila): avisa al padre qué fila se quiere editar (el form está al lado, no en otro modal)
  const CategoriasPanel = forwardRef((props,ref) => {

    const [categorias, setCategorias] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCategories();
        setCategorias(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }finally{
        setIsLoading(false)
      }
    };

    useImperativeHandle(ref, () => ({ fetchData }));  // ← exponés fetchData al padre

    useEffect ( () =>  {
        fetchData();
    },[]) ;

    return(
      <>
        { isLoading && <ModalLoading/>}
        <div className="tabla-card w-[380px] max-h-[360px]" >
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="tabla-celda text-left w-[30px]">#</th>
                <th className="tabla-celda text-left">Nombre</th>
                <th className="tabla-celda text-left w-[80px]">Estado</th>
                <th className="tabla-celda text-left w-[60px]">Accion</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 && (
                <tr><td colSpan={4} className="tabla-celda text-center text-texto-suave/70">Sin categorías</td></tr>
              )}
              {categorias.map((row) => (
                <tr
                  key={row.id}
                  className="tabla-fila"
                >
                  <td className="tabla-celda text-left text-texto-suave/70">{row.id}</td>
                  <td className="tabla-celda text-left font-medium text-dark">{row.nombre}</td>
                  <td className="tabla-celda text-left">
                    <span className={`badge ${row.estado ? 'badge-exito' : 'badge-error'}`}>
                      {row.estado ?"activa":"inactiva"}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex flex-row gap-2">
                    <button className="btn-icono btn-icono-editar"
                      onClick={() => props.onEdit?.(row)}
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
export default CategoriasPanel;
