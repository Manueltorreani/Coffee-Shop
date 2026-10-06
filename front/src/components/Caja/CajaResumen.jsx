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
            <span className="font-bold">Caja #{caja.id}</span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">abierta</span>
          </div>
          <p className="text-xs text-gray-500">
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
                <tr key={m.metodo} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{m.metodo}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{plata(m.montoInicial)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{plata(m.ventas)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{plata(m.ingresos)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{plata(m.gastos)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{plata(m.egresos)}</td>
                  <td className="px-3 py-2 text-right font-bold">{plata(m.montoSistema)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-800">
                <td className="px-3 py-2 font-black" colSpan={6}>Total sistema</td>
                <td className="px-3 py-2 text-right font-black text-lg">{plata(montoSistema)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tabla-card max-h-[300px]" >
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {caja.movimientos.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-3 text-center text-gray-400">Sin movimientos manuales</td></tr>
              )}
              {caja.movimientos.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{formatoFecha(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.tipo === 'INGRESO' ? "ingreso" : "egreso"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.paymentMethod}</td>
                  <td className="px-4 py-3 text-gray-800">{row.descripcion}</td>
                  <td className="px-4 py-3 text-right font-medium">{plata(row.monto)}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(row.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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
