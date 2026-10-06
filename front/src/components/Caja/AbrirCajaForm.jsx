import { useState } from "react";
import { abrirCaja } from "../../services/fetch/caja";
import ModalLoading from "../ModalLoading";

// Se muestra cuando NO hay caja abierta
export default function AbrirCajaForm (props){
   const [montoInicial, setMontoInicial] = useState("");
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

    function handleAbrir(){
        const fetchAbrir = async () =>{
            setIsLoading(true)
            try {
                await abrirCaja(Number(montoInicial));
                setError(null)
                props.onCreated?.();  // ← la página vuelve a buscar la caja (ahora abierta)
            } catch (err) {
                setError(err.message); // ej: 409 "Ya hay una caja abierta"
            }finally{
                setIsLoading(false)
            }
        }
        fetchAbrir();
    }

    return(
        <>
        { isLoading && <ModalLoading/>}
        <div className="form-card">
            <h3 className="form-titulo">Abrir caja</h3>
            <p className="text-xs text-gray-500">No hay ninguna caja abierta. Contá el efectivo con el que arrancás.</p>
            <div className="form-campo">Monto inicial
                <input className="form-input" type="number" min="0" placeholder="0"
                value={montoInicial}
                onChange={(e)=>setMontoInicial(e.target.value)}/>
                {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
            <button className="btn-primario" onClick={handleAbrir}>
                Abrir caja
            </button>
        </div>
        </>
    )
}
