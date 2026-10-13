import { useState } from "react";
import { useEffect } from "react";
import { createPaymentMethod, updatePaymentMethod } from "../../services/fetch/paymentMethods";
import ModalLoading from "../ModalLoading";

// Sirve para CREAR y para EDITAR (mismo patrón que TipoGastosForm):
// - crear: <MetodosPagoForm onCreated={...}/>
// - editar: <MetodosPagoForm isModified={true} metodo={fila} onCreated={...}/>
export default function MetodosPagoForm (props){
   const [nombre, setNombre] = useState("");
   const [isModified, setIsModified] = useState(false);
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   // si viene en modo edición, cargamos los datos de la fila en el form
   useEffect( ()=> {
    if(props.isModified == true){
        setIsModified(true);
        setNombre(props.metodo.nombre);
    }
   },[]);

    function handleCreate(){
        const fetchCreate = async () =>{
            setIsLoading(true)
            try {
                await createPaymentMethod(nombre);
                setError(null)
                setNombre("")
                props.onCreated?.();  // ← refresca la tabla
            } catch (err) {
                setError(err.message); // ej: 409 "Método de pago ya creado"
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
                await updatePaymentMethod(props.metodo.id, nombre);
                setError(null)
                props.onCreated?.();  // ← refresca la tabla y cierra el modal
            } catch (err) {
                setError(err.message);
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
            <h3 className="form-titulo">{isModified ? "Editar método de pago" : "Nuevo método de pago"}</h3>
            <div className="form-campo">Nombre
                <input className="form-input" type="text" placeholder="Efectivo"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}/>
                {error && <p className="form-error">{error}</p>}
            </div>
            <p className="text-xs text-texto-suave">
                Importante: la Caja cuenta como efectivo el método llamado exactamente "Efectivo".
            </p>
            <button className="btn-primario" onClick={ () => {
                if(isModified){
                    handleModified();
                }else{
                    handleCreate();
                }
            }} > 
                {(isModified)?"Guardar cambios": "Crear"}
            </button>
        </div>
        </>
    )
}
