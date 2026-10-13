import { useState } from "react";
import { useEffect } from "react";
import { createTipoGasto, updateTipoGasto } from "../../services/fetch/gastos";
import ModalLoading from "../ModalLoading";

// Sirve para CREAR y para EDITAR:
// - crear: <TipoGastosForm onCreated={...}/>
// - editar: <TipoGastosForm isModified={true} tipoGastos={fila} onCreated={...}/>
export default function TipoGastosForm (props){
   const [nombre, setNombre] = useState("");
   const [isActive, setIsActive] = useState(true);
   const [isModified, setIsModified] = useState(false);
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)


   // si viene en modo edición, cargamos los datos de la fila en el form
   useEffect( ()=> {
    if(props.isModified == true){
        setIsModified(true);
        setNombre(props.tipoGastos.nombre);
        setIsActive(props.tipoGastos.estado);
    }
   }
    ,[]);

    function handleCreate(){
        const fetchCreate = async () =>{
            setIsLoading(true)
            try {
                const res = await createTipoGasto({ nombre, estado: isActive });
                setError(null)
                setNombre("") // limpiamos el form para cargar otro
                props.onCreated?.();  // ← refresca la tabla
                console.log(res);

            } catch (err) {
                setError(err.message);
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
                const res = await updateTipoGasto(props.tipoGastos.id, { nombre, estado: isActive });
                setError(null)
                props.onCreated?.();  // ← refresca la tabla y cierra el modal
                console.log(res);
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
            <h3 className="form-titulo">{isModified ? "Editar tipo de gasto" : "Formulario de tipo de Gastos"}</h3>
            <div className="form-campo">Nombre de categoria
                <input className="form-input" type="text" name="nombre" id="nombre" placeholder="luz"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}/>
                {error && <p className="form-error">{error}</p>}
            </div>
             <div className="flex flex-row gap-2 items-center text-sm font-medium text-texto-suave">Activo
                <input className="w-5 h-5 " type="checkbox" name="activo" id="activo"
                checked={isActive}
                onChange={(e)=>setIsActive(e.target.checked)}/>
            </div>
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
        </div>
        </>

    )

}
