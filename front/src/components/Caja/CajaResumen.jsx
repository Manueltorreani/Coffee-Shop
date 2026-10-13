import { useState } from "react";
import { deleteMovimiento } from "../../services/fetch/caja";
import { Trash2 } from "lucide-react";
import ModalLoading from "../ModalLoading";

const formatoFecha = (fecha) => new Date(fecha).toLocaleString('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
});

const plata = (valor) => `$${valor.toFixed(2)}`;

// Muestra la caja abierta: resumen "en vivo" POR MÉTODO DE PAGO y la lista de movimientos manuales.
// props.caja viene de la página (GET /caja/actual); props.onChange la vuelve a pedir.
export default function CajaResumen ({ caja, onChange }){
   const [isLoading, setIsLoading] = useState(false)
   const { detalle, montoSistema } = caja.resumen;

   const handleDelete = async (id) =>{
      if(!window.confirm("Eliminar este movimiento?")) return;
      setIsLoading(true)
      try {
        await deleteMovimiento(id);
        onChange?.();
      } catch (error) {
        console.error("Error eliminando:",error)
      }finally{
        setIsLoading(false)
      }
   }

   return(
     <>
      { isLoading && <ModalLoading/>}
      <div className="flex flex-col gap-3">
        <div className="tabla-card p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Caja #{caja.id}</span>
            <span className="badge badge-exito">abierta</span>
          </div>
          <p className="text-xs text-texto-suave">
            Abierta el {formatoFecha(caja.fechaApertura)} por {caja.usuarioApertura?.nombre || caja.usuarioApertura?.email}
          </p>
          {/* Fórmula por método: sistema = inicial + ventas + ingresos − gastos − egresos */}
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="px-3 py-2 text-left">Método</th>
                <th className="px-3 py-2 text-right">Inicial</th>
                <th className="px-3 py-2 text-right">+ Ventas</th>
                <th className="px-3 py-2 text-right">+ Ingresos</th>
                <th className="px-3 py-2 text-right">− Gastos</th>
                <th className="px-3 py-2 text-right">− Egresos</th>
                <th className="px-3 py-2 text-right">= Sistema</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((m) => (
                <tr key={m.metodo} className="border-t border-borde">
                  <td className="px-3 py-2 font-medium">{m.metodo}</td>
                  <td className="px-3 py-2 text-right text-texto-suave">{plata(m.montoInicial)}</td>
                  <td className="px-3 py-2 text-right text-texto-suave">{plata(m.ventas)}</td>
                  <td className="px-3 py-2 text-right text-texto-suave">{plata(m.ingresos)}</td>
                  <td className="px-3 py-2 text-right text-texto-suave">{plata(m.gastos)}</td>
                  <td className="px-3 py-2 text-right text-texto-suave">{plata(m.egresos)}</td>
                  <td className="px-3 py-2 text-right font-medium">{plata(m.montoSistema)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-dark">
                <td className="px-3 py-2 font-medium" colSpan={6}>Total sistema</td>
                <td className="px-3 py-2 text-right font-medium text-lg">{plata(montoSistema)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tabla-card max-h-[300px]" >
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="tabla-celda text-left">Hora</th>
                <th className="tabla-celda text-left">Tipo</th>
                <th className="tabla-celda text-left">Método</th>
                <th className="tabla-celda text-left">Descripción</th>
                <th className="tabla-celda text-right">Monto</th>
                <th className="tabla-celda text-left w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {caja.movimientos.length === 0 && (
                <tr><td colSpan={6} className="tabla-celda text-center text-texto-suave/70">Sin movimientos manuales</td></tr>
              )}
              {caja.movimientos.map((row) => (
                <tr key={row.id} className="tabla-fila">
                  <td className="tabla-celda text-texto-suave">{formatoFecha(row.createdAt)}</td>
                  <td className="tabla-celda">
                    <span className={`badge ${row.tipo === 'INGRESO' ? 'badge-exito' : 'badge-error'}`}>
                      {row.tipo === 'INGRESO' ? "ingreso" : "egreso"}
                    </span>
                  </td>
                  <td className="tabla-celda text-texto-suave">{row.paymentMethod}</td>
                  <td className="tabla-celda text-dark">{row.descripcion}</td>
                  <td className="tabla-celda text-right font-medium">{plata(row.monto)}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(row.id)} className="btn-icono btn-icono-borrar">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
     </>
   )
}
