import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getUsuarios, updateUsuario } from "../../services/fetch/usuarios";
import { SquarePen, Power } from "lucide-react";
import ModalLoading from "../ModalLoading";
import ModalModified from "../ModalModified";
import UsuariosForm from "./UsuariosForm";

const UsuariosPanel = forwardRef((props,ref) => {

    const [usuarios, setUsuarios] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [editando, setEditando] = useState(null) // fila que se está editando (null = modal cerrado)
    const [error, setError] = useState(null)

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }finally{
        setIsLoading(false)
      }
    };

    useImperativeHandle(ref, () => ({ fetchData }));  // ← exponés fetchData al padre

    useEffect ( () =>  {
        fetchData();
    },[]) ;

    // No borramos usuarios (tienen ventas asociadas): los activamos/desactivamos (Soft Delete)
    const handleToggleActivo = async (row) =>{
      const accion = row.activo ? "Desactivar" : "Activar";
      if(!window.confirm(`${accion} a ${row.email}?`)) return;
      setIsLoading(true)
      try {
        await updateUsuario(row.id, { activo: !row.activo });
        setError(null)
        fetchData();
      } catch (error) {
        setError(error.message) // ej: no podés desactivarte a vos mismo
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
            <UsuariosForm isModified={true} usuario={editando} onCreated={handleEditado}/>
          </ModalModified>
        )}
        <div className="tabla-card w-[560px] max-h-[400px]" >
          {error && <p className="text-red-500 text-xs px-4 pt-3">{error}</p>}
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="px-4 py-3 text-left w-[30px]">#</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left w-[80px]">Estado</th>
                <th className="px-4 py-3 text-left w-[70px]">Accion</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.nombre || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{row.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.isAdmin ? 'bg-surf-100 text-surf-800' : 'bg-gray-100 text-gray-700'}`}>
                      {row.isAdmin ? "admin" : "empleado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.activo ? "activo" : "inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex flex-row gap-2">
                    <button onClick={() => handleToggleActivo(row)} title={row.activo ? "Desactivar" : "Activar"}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <Power size={15} />
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
export default UsuariosPanel;
