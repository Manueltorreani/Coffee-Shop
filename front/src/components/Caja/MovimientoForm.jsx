import { useState, useEffect } from "react";
import { createMovimiento } from "../../services/fetch/caja";
import { getPaymentMethods } from "../../services/fetch/paymentMethods";
import ModalLoading from "../ModalLoading";

// Ingreso/egreso MANUAL de cualquier método de pago (retiros, aportes, ajustes, etc.).
// No es para ventas ni gastos: esos ya se cuentan solos.
export default function MovimientoForm (props){
   const [tipo, setTipo] = useState("EGRESO");
   const [monto, setMonto] = useState("");
   const [paymentMethod, setPaymentMethod] = useState("Efectivo");
   const [descripcion, setDescripcion] = useState("");
   const [paymentMethods, setPaymentMethods] = useState([]);
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   useEffect(() => {
     const fetchMetodos = async () => {
       try {
         const data = await getPaymentMethods();
         setPaymentMethods(data);
       } catch (err) {
         console.error("Error cargando métodos:", err);
       }
     };
     fetchMetodos();
   }, []);

    function handleCreate(){
        const fetchCreate = async () =>{
            setIsLoading(true)
            try {
                await createMovimiento({ tipo, monto: Number(monto), paymentMethod, descripcion });
                setError(null)
                setMonto(""); setDescripcion("");
                props.onCreated?.();  // ← refresca el resumen de la caja
            } catch (err) {
                setError(err.message);
            }finally{
                setIsLoading(false)
            }
        }
        fetchCreate();
    }

    return(
        <> 
        { isLoading && <ModalLoading/>}
        <div className="form-card">
            <h3 className="form-titulo">Movimiento manual</h3>
            <div className="form-campo">Tipo
                <select className="form-input"
                value={tipo} onChange={(e)=>setTipo(e.target.value)}>
                    <option value="INGRESO">Ingreso (entra plata)</option>
                    <option value="EGRESO">Egreso (sale plata)</option>
                </select>
            </div>
            <div className="form-campo">Método de pago
                <select className="form-input"
                value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                    {/* Efectivo siempre disponible aunque no esté cargado en Configuración */}
                    {!paymentMethods.some((m) => m.nombre.toLowerCase() === "efectivo") && (
                      <option value="Efectivo">Efectivo</option>
                    )}
                    {paymentMethods.map((metodo) => (
                      <option key={metodo.id} value={metodo.nombre}>{metodo.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="form-campo">Monto
                <input className="form-input" type="number" min="0"
                value={monto}
                onChange={(e)=>setMonto(e.target.value)}/>
            </div>
            <div className="form-campo">Descripción
                <input className="form-input" type="text" placeholder="Retiro para el banco"
                value={descripcion}
                onChange={(e)=>setDescripcion(e.target.value)}/>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button className="btn-primario" onClick={handleCreate}>
                Registrar
            </button>
        </div>
        </>
    )
}
