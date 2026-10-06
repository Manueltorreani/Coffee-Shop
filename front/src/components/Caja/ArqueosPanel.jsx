import { useState, useEffect, forwardRef, useImperativeHandle, Fragment } from "react";
import { getArqueos } from "../../services/fetch/caja";
import { ChevronDown, ChevronRight } from "lucide-react";
import ModalLoading from "../ModalLoading";

const formatoFecha = (fecha) => fecha ? new Date(fecha).toLocaleString('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
}) : '-';

const plata = (valor) => valor === null || valor === undefined ? '-' : `$${valor.toFixed(2)}`;

const colorDiferencia = (dif) => dif < 0 ? 'text-red-600' : dif > 0 ? 'text-amber-600' : 'text-green-600';

// Historial de arqueos (solo admin). Cada fila muestra los TOTALES del cierre;
// al hacer click se despliega la foto por método de pago (CierreMetodo).
const ArqueosPanel = forwardRef((props,ref) => {

    const [arqueos, setArqueos] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [abierto, setAbierto] = useState(null) // id del arqueo desplegado (null = ninguno)

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getArqueos();
        setArqueos(data);
      } catch (error) {
        console.error("Error cargando arqueos:", error);
      }finally{
        setIsLoading(false)
      }
    };

    useImperativeHandle(ref, () => ({ fetchData }));  // ← exponés fetchData al padre

    useEffect ( () =>  {
        fetchData();
    },[]) ;

    return(
      <>
        { isLoading && <ModalLoading/>}
        <div className="tabla-card max-w-full max-h-[500px]" >
          <table className="w-full text-sm">
            <thead>
              <tr className="tabla-head">
                <th className="px-3 py-3 w-[30px]"></th>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">Apertura</th>
                <th className="px-3 py-3 text-left">Cierre</th>
                <th className="px-3 py-3 text-right">Inicial (ef.)</th>
                <th className="px-3 py-3 text-right">Sistema</th>
                <th className="px-3 py-3 text-right">Contado</th>
                <th className="px-3 py-3 text-right">Diferencia</th>
                <th className="px-3 py-3 text-left">Estado</th>
                <th className="px-3 py-3 text-left">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {arqueos.map((row) => (
                // Fragment con key: agrupa la fila principal y la fila de detalle sin agregar un elemento extra
                <Fragment key={row.id}>
                  <tr
                    onClick={() => setAbierto(abierto === row.id ? null : row.id)}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-3 text-gray-400">
                      {row.detalle.length > 0 && (abierto === row.id ? <ChevronDown size={15}/> : <ChevronRight size={15}/>)}
                    </td>
                    <td className="px-3 py-3 text-gray-400">{row.id}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {formatoFecha(row.fechaApertura)}
                      <div className="text-xs text-gray-400">{row.usuarioApertura?.nombre || row.usuarioApertura?.email}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {formatoFecha(row.fechaCierre)}
                      <div className="text-xs text-gray-400">{row.usuarioCierre?.nombre || row.usuarioCierre?.email}</div>
                    </td>
                    <td className="px-3 py-3 text-right">{plata(row.montoInicial)}</td>
                    <td className="px-3 py-3 text-right font-medium">{plata(row.montoSistema)}</td>
                    <td className="px-3 py-3 text-right font-medium">{plata(row.montoUsuario)}</td>
                    <td className={`px-3 py-3 text-right font-bold ${colorDiferencia(row.diferencia)}`}>
                      {plata(row.diferencia)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.estado === 'ABIERTA' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {row.estado === 'ABIERTA' ? "abierta" : "cerrada"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-500">{row.comentario || '-'}</td>
                  </tr>

                  {/* DETALLE POR MÉTODO DE PAGO */}
                  {abierto === row.id && (
                    <tr className="bg-gray-50">
                      <td></td>
                      <td colSpan={9} className="px-3 py-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="px-2 py-1 text-left">Método</th>
                              <th className="px-2 py-1 text-right">Inicial</th>
                              <th className="px-2 py-1 text-right">+ Ventas</th>
                              <th className="px-2 py-1 text-right">+ Ingresos</th>
                              <th className="px-2 py-1 text-right">− Gastos</th>
                              <th className="px-2 py-1 text-right">− Egresos</th>
                              <th className="px-2 py-1 text-right">= Sistema</th>
                              <th className="px-2 py-1 text-right">Contado</th>
                              <th className="px-2 py-1 text-right">Diferencia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.detalle.map((m) => (
                              <tr key={m.id} className="border-t border-gray-200">
                                <td className="px-2 py-1 font-medium">{m.metodo}</td>
                                <td className="px-2 py-1 text-right">{plata(m.montoInicial)}</td>
                                <td className="px-2 py-1 text-right">{plata(m.ventas)}</td>
                                <td className="px-2 py-1 text-right">{plata(m.ingresos)}</td>
                                <td className="px-2 py-1 text-right">{plata(m.gastos)}</td>
                                <td className="px-2 py-1 text-right">{plata(m.egresos)}</td>
                                <td className="px-2 py-1 text-right font-medium">{plata(m.montoSistema)}</td>
                                <td className="px-2 py-1 text-right font-medium">{plata(m.montoUsuario)}</td>
                                <td className={`px-2 py-1 text-right font-bold ${colorDiferencia(m.diferencia)}`}>{plata(m.diferencia)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
         </div>
      </>
    )
});
export default ArqueosPanel;
