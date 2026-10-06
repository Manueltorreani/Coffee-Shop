import { useState } from "react";
import { cerrarCaja } from "../../services/fetch/caja";
import ModalLoading from "../ModalLoading";

const plata = (valor) => `$${valor.toFixed(2)}`;

// color según la diferencia: rojo falta, ámbar sobra, verde ok
const colorDiferencia = (dif) => dif < 0 ? 'text-red-600' : dif > 0 ? 'text-amber-600' : 'text-green-600';

// Cierre de caja: el usuario completa lo contado/controlado de CADA método de pago
// (efectivo del cajón, cierre del posnet de débito, crédito, etc.)
// props.detalle es el resumen en vivo por método, para mostrar la diferencia antes de confirmar.
export default function CerrarCajaForm (props){
   // contados = { "Efectivo": "1300", "Debito": "800" } (strings porque vienen de inputs)
   const [contados, setContados] = useState({});
   const [comentario, setComentario] = useState("");
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   function handleChange(metodo, valor){
     setContados({ ...contados, [metodo]: valor });
   }

   // vista previa de diferencias (el valor definitivo lo calcula el back al cerrar)
   const diferenciaDe = (m) => contados[m.metodo] === undefined || contados[m.metodo] === ""
     ? null
     : Number(contados[m.metodo]) - m.montoSistema;

   const completos = props.detalle.every((m) => diferenciaDe(m) !== null);
   const diferenciaTotal = props.detalle.reduce((acc, m) => acc + (diferenciaDe(m) ?? 0), 0);

    function handleCerrar(){
        if(!window.confirm("¿Cerrar la caja? Después no se puede modificar.")) return;
        const fetchCerrar = async () =>{
            setIsLoading(true)
            try {
                // convertimos los strings a número antes de mandar
                const numeros = {};
                Object.keys(contados).forEach((metodo) => { numeros[metodo] = Number(contados[metodo]) });

                const arqueo = await cerrarCaja({ contados: numeros, comentario });
                setError(null)
                props.onCreated?.(arqueo);  // ← la página muestra el resultado del cierre
            } catch (err) {
                setError(err.message);
            }finally{
                setIsLoading(false)
            }
        }
        fetchCerrar();
    }

    return(
        <>
        { isLoading && <ModalLoading/>}
        <div className="form-card">
            <h3 className="form-titulo">Cerrar caja</h3>
            <p className="text-xs text-gray-500">Completá lo contado de cada método (0 si no hubo).</p>
            {props.detalle.map((m) => {
              const dif = diferenciaDe(m);
              return (
                <div key={m.metodo} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span>{m.metodo}</span>
                    <span className="text-gray-500">sistema {plata(m.montoSistema)}</span>
                  </div>
                  <input className="form-input" type="number" min="0"
                  value={contados[m.metodo] ?? ""}
                  onChange={(e)=>handleChange(m.metodo, e.target.value)}/>
                  {dif !== null && (
                    <span className={`text-xs font-bold ${colorDiferencia(dif)}`}>
                      Diferencia: {plata(dif)} {dif < 0 ? '(falta)' : dif > 0 ? '(sobra)' : '(ok)'}
                    </span>
                  )}
                </div>
              );
            })}
            {completos && (
              <p className={`text-sm font-black ${colorDiferencia(diferenciaTotal)}`}>
                Diferencia total: {plata(diferenciaTotal)}
              </p>
            )}
            <div className="form-campo">Comentario
                <input className="form-input" type="text" placeholder="opcional"
                value={comentario}
                onChange={(e)=>setComentario(e.target.value)}/>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button className="btn-peligro" onClick={handleCerrar} disabled={!completos}>
                Cerrar caja
            </button>
        </div>
        </>
    )
}
