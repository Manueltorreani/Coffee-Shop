import { useState } from "react";
import { useEffect } from "react";
import { createCategory, updateCategory } from "../../services/fetch/category";
import ModalLoading from "../ModalLoading";

// Sirve para CREAR y para EDITAR (mismo patrón que TipoGastosForm):
// - crear: <CategoriasForm onCreated={...}/>
// - editar: <CategoriasForm isModified={true} categoria={fila} onCreated={...} onCancel={...}/>
export default function CategoriasForm (props){
   const [nombre, setNombre] = useState("");
   const [isActive, setIsActive] = useState(true);
   const [isModified, setIsModified] = useState(false);
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   // si viene en modo edición, cargamos los datos de la fila en el form
   useEffect( ()=> {
    if(props.isModified == true){
        setIsModified(true);
        setNombre(props.categoria.nombre);
        setIsActive(props.categoria.estado);
    }
   }
    ,[]);

    function handleCreate(){
        const fetchCreate = async () =>{
            setIsLoading(true)
            try {
                await createCategory({ nombre, estado: isActive });
                setError(null)
                setNombre("") // limpiamos el form para cargar otra
                props.onCreated?.();  // ← refresca la tabla y el select de productos
            } catch (err) {
                setError(err.message); // ej: 409 nombre repetido
            }finally{
                setIsLoading(false)
            }
        }
        fetchCreate();
    }

    function handleModified(){
        const fetchUpdate = async () =>{
            setIsLoading(true)
            try {
                await updateCategory(props.categoria.id, { nombre, estado: isActive });
                setError(null)
                props.onCreated?.();  // ← refresca la tabla y vuelve el form a modo "crear"
            } catch (err) {
                setError(err.message); // ej: 409 nombre repetido
            }finally{
                setIsLoading(false)
            }
        }
        fetchUpdate();
    }

    return(
        <>
        { isLoading && <ModalLoading/>}
        <div className="form-card">
            <h3 className="form-titulo">{isModified ? "Editar categoría" : "Nueva categoría"}</h3>
            <div className="form-campo">Nombre
                <input className="form-input" type="text" name="nombre" placeholder="Cafetería"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}/>
                {error && <p className="form-error">{error}</p>}
            </div>
             <div className="flex flex-row gap-2 items-center text-sm font-medium text-texto-suave">Activa
                <input className="w-5 h-5 " type="checkbox" name="activa"
                checked={isActive}
                onChange={(e)=>setIsActive(e.target.checked)}/>
            </div>
            <div className="flex flex-row gap-2">
                <button className="btn-primario" onClick={ () => {
                    if(isModified){
                        handleModified();
                    }else{
                        handleCreate();
                    }
                }} >
                    {
                        (isModified)?"Guardar cambios": "Crear"
                    }
                </button>
                {isModified && (
                    <button className="btn-secundario" onClick={props.onCancel}>Cancelar</button>
                )}
            </div>
        </div>
        </>

    )

}
