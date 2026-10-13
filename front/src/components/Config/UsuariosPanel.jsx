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

    // Atajo: cambiar el rol (admin <-> empleado) desde la tabla, sin abrir el modal de edición
    const handleToggleAdmin = async (row) =>{
      const pregunta = row.isAdmin
        ? `Quitarle el rol de administrador a ${row.email}?`
        : `Hacer administrador a ${row.email}?`;
      if(!window.confirm(pregunta)) return;
      setIsLoading(true)
      try {
        await updateUsuario(row.id, { isAdmin: !row.isAdmin });
        setError(null)
        fetchData();
      } catch (error) {
        setError(error.message) // ej: no podés quitarte el rol de admin a vos mismo
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
          {error && <p className="form-error px-4 pt-3">{error}</p>}
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="tabla-celda text-left w-[30px]">#</th>
                <th className="tabla-celda text-left">Nombre</th>
                <th className="tabla-celda text-left">Email</th>
                <th className="tabla-celda text-left">Rol</th>
                <th className="tabla-celda text-left w-[80px]">Estado</th>
                <th className="tabla-celda text-left w-[70px]">Accion</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((row) => (
                <tr key={row.id} className="tabla-fila">
                  <td className="tabla-celda text-texto-suave/70">{row.id}</td>
                  <td className="tabla-celda font-medium text-dark">{row.nombre || '-'}</td>
                  <td className="tabla-celda text-texto-suave">{row.email}</td>
                  <td className="tabla-celda">
                    {/* el badge es un botón: click = cambiar el rol */}
                    <button onClick={() => handleToggleAdmin(row)}
                      title={row.isAdmin ? "Quitar rol de administrador" : "Hacer administrador"}
                      className={`badge cursor-pointer hover:brightness-95 transition ${row.isAdmin ? 'badge-marca' : 'badge-neutro'}`}>
                      {row.isAdmin ? "admin" : "empleado"}
                    </button>
                  </td>
                  <td className="tabla-celda">
                    <span className={`badge ${row.activo ? 'badge-exito' : 'badge-error'}`}>
                      {row.activo ? "activo" : "inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex flex-row gap-2">
                    <button onClick={() => handleToggleActivo(row)} title={row.activo ? "Desactivar" : "Activar"}
                      className="btn-icono btn-icono-borrar">
                      <Power size={15} />
                    </button>
                    <button onClick={() => setEditando(row)} className="btn-icono btn-icono-editar">
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
