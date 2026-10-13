import { useState, useEffect, Fragment } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // calendario en español
import { getVentasResumen, getVentaDetalle } from "../../services/fetch/caja";
import { ChevronDown, ChevronRight } from "lucide-react";
import ModalLoading from "../ModalLoading";

const ZONA = 'America/Argentina/Buenos_Aires';

// "13/10/26 00:00"
const formatoFechaHora = (fecha) => fecha ? new Date(fecha).toLocaleString('es-AR', {
  timeZone: ZONA,
  day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
}) : '-';

// "19:49"
const formatoHora = (fecha) => fecha ? new Date(fecha).toLocaleTimeString('es-AR', {
  timeZone: ZONA,
  hour: '2-digit', minute: '2-digit', hour12: false
}) : '-';

const plata = (valor) => valor === null || valor === undefined ? '-' : `$${valor.toFixed(2)}`;

// Texto y color del badge según el estado de la orden
const ESTADOS = {
  COMPLETED: { texto: 'cobrada', clase: 'badge-exito' },
  PENDING:   { texto: 'pendiente', clase: 'badge-aviso' },
  CANCELED:  { texto: 'cancelada', clase: 'badge-error' },
};

// Cómo se comporta el selector de fecha en cada período
const PICKER = {
  diario:  { dateFormat: "dd/MM/yyyy" },
  mensual: { dateFormat: "MMMM yyyy", showMonthYearPicker: true },
  anual:   { dateFormat: "yyyy", showYearPicker: true },
};

// Pestaña "Ventas" de Caja (solo admin): ventas de un día, un mes o un año con su resumen.
// No tiene form asociado, así que no necesita forwardRef: se recarga sola cuando cambia el filtro.
export default function VentasPanel(){

    const [periodo, setPeriodo] = useState("diario")  // diario | mensual | anual
    const [fecha, setFecha] = useState(new Date())    // por defecto: hoy
    const [datos, setDatos] = useState(null)          // respuesta del back: { desde, hasta, resumen, ventas }
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Detalle de una venta (se despliega debajo de la fila, igual que en ArqueosPanel)
    const [abierta, setAbierta] = useState(null)            // id de la venta desplegada (null = ninguna)
    const [detalle, setDetalle] = useState(null)            // la orden con sus productos, tal como la devuelve el back
    const [errorDetalle, setErrorDetalle] = useState(null)

    // Cada vez que cambia el período o la fecha, pedimos los datos de nuevo
    useEffect(() => {
      let vigente = true // si el filtro cambia antes de que llegue la respuesta, la respuesta vieja se descarta
      setAbierta(null)   // al cambiar el filtro cerramos el detalle que estuviera abierto

      const fetchData = async () => {
        setIsLoading(true)
        try {
          // el back espera "YYYY-MM-DD"; para mensual/anual alcanza con cualquier día de ese mes/año
          const data = await getVentasResumen(periodo, format(fecha, "yyyy-MM-dd"));
          if (vigente) {
            setDatos(data);
            setError(null);
          }
        } catch (err) {
          if (vigente) setError(err.message);
        } finally {
          if (vigente) setIsLoading(false)
        }
      };
      fetchData();

      return () => { vigente = false }
    }, [periodo, fecha]);

    // Cuando se abre una fila, pedimos el detalle de ESA venta (los productos no vienen en el listado)
    useEffect(() => {
      if (abierta === null) return

      let vigente = true // si se abre otra fila antes de que llegue la respuesta, esta se descarta
      setDetalle(null)
      setErrorDetalle(null)

      const fetchDetalle = async () => {
        try {
          const data = await getVentaDetalle(abierta);
          if (vigente) setDetalle(data);
        } catch (err) {
          if (vigente) setErrorDetalle(err.message);
        }
      };
      fetchDetalle();

      return () => { vigente = false }
    }, [abierta]);

    const ventas = datos?.ventas || [];
    const resumen = datos?.resumen;
    // en diario alcanza con la hora; en mensual/anual hace falta también el día
    const formatoCelda = periodo === "diario" ? formatoHora : formatoFechaHora;

    return(
      <>
        { isLoading && <ModalLoading/>}
        <div className="flex flex-col gap-3 w-full items-start">

          {/* 1. Filtro de período */}
          <div className="flex flex-row gap-2 items-end flex-wrap">
            <div className="form-campo">Período
              <select className="form-input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="diario">Diario</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div className="form-campo">{periodo === "diario" ? "Día" : periodo === "mensual" ? "Mes" : "Año"}
              <DatePicker
                selected={fecha}
                onChange={(nueva) => { if (nueva) setFecha(nueva) }}
                maxDate={new Date()}
                locale={es}
                className="form-input w-[160px] capitalize"
                {...PICKER[periodo]}
              />
            </div>
          </div>

          {/* 2. Texto del rango */}
          {datos && (
            <p className="text-sm text-texto-suave">
              Del {formatoFechaHora(datos.desde)} al {formatoFechaHora(datos.hasta)} · {ventas.length} {ventas.length === 1 ? "registro" : "registros"}
            </p>
          )}
          {error && <p className="form-error">{error}</p>}

          {/* 3. Tarjetas de resumen (solo ventas cobradas) */}
          {resumen && (
            <div className="flex flex-row gap-3 flex-wrap">
              <div className="card p-4 w-[200px] text-left">
                <p className="text-xs font-medium text-texto-suave uppercase tracking-wide">Cantidad de ventas</p>
                <p className="text-2xl font-medium text-dark">{resumen.cantidad}</p>
              </div>
              <div className="card p-4 w-[200px] text-left">
                <p className="text-xs font-medium text-texto-suave uppercase tracking-wide">Promedio por venta</p>
                <p className="text-2xl font-medium text-dark">{plata(resumen.promedio)}</p>
              </div>
              <div className="card p-4 w-[200px] text-left">
                <p className="text-xs font-medium text-texto-suave uppercase tracking-wide">Total</p>
                <p className="text-2xl font-medium text-secondary">{plata(resumen.total)}</p>
              </div>
            </div>
          )}

          {/* 4. Tabla de ventas del período */}
          <div className="tabla-card w-[640px] max-w-full max-h-[420px]" >
            <table className="w-full text-sm">
              <thead>
                <tr className="tabla-head">
                  <th className="tabla-celda w-[30px]"></th>
                  <th className="tabla-celda text-left w-[40px]">#</th>
                  <th className="tabla-celda text-left">Inicio</th>
                  <th className="tabla-celda text-left">Cierre</th>
                  <th className="tabla-celda text-left">Estado</th>
                  <th className="tabla-celda text-left">Medio de pago</th>
                  <th className="tabla-celda text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 && (
                  <tr><td colSpan={7} className="tabla-celda text-center text-texto-suave/70">Sin ventas en este período</td></tr>
                )}
                {ventas.map((row) => (
                  // Fragment con key: agrupa la fila principal y la fila de detalle sin agregar un elemento extra
                  <Fragment key={row.id}>
                  <tr
                    onClick={() => setAbierta(abierta === row.id ? null : row.id)}
                    className="tabla-fila cursor-pointer"
                  >
                    <td className="tabla-celda text-texto-suave/70">
                      {abierta === row.id ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
                    </td>
                    <td className="tabla-celda text-left text-texto-suave/70">{row.id}</td>
                    <td className="tabla-celda text-left text-texto-suave">{formatoCelda(row.createdAt)}</td>
                    <td className="tabla-celda text-left text-texto-suave">{formatoCelda(row.closedAt)}</td>
                    <td className="tabla-celda text-left">
                      <span className={`badge ${ESTADOS[row.status]?.clase || 'badge-neutro'}`}>
                        {ESTADOS[row.status]?.texto || row.status}
                      </span>
                    </td>
                    <td className="tabla-celda text-left text-dark">{row.paymentMethod || '-'}</td>
                    <td className="tabla-celda text-right font-medium">{plata(row.total)}</td>
                  </tr>

                  {/* DETALLE DE LA VENTA: productos */}
                  {abierta === row.id && (
                    <tr className="bg-fondo">
                      <td></td>
                      <td colSpan={6} className="px-3 py-3 text-left">
                        {errorDetalle && <p className="form-error">{errorDetalle}</p>}
                        {!detalle && !errorDetalle && <p className="text-xs text-texto-suave">Cargando detalle...</p>}
                        {detalle && (
                          <>
                            <p className="text-xs text-texto-suave mb-2">
                              Cliente: <span className="font-medium text-dark">{detalle.client || 'no definido'}</span>
                              {' · '}Cargada por: <span className="font-medium text-dark">{detalle.user?.nombre || detalle.user?.email || '-'}</span>
                            </p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-texto-suave">
                                  <th className="px-2 py-1 text-left">Producto</th>
                                  <th className="px-2 py-1 text-right">Cant.</th>
                                  <th className="px-2 py-1 text-right">Unitario</th>
                                  <th className="px-2 py-1 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detalle.items.length === 0 && (
                                  <tr><td colSpan={4} className="px-2 py-1 text-center text-texto-suave/70">Sin productos</td></tr>
                                )}
                                {detalle.items.map((item) => (
                                  <tr key={item.id} className="border-t border-borde">
                                    <td className="px-2 py-1 text-left font-medium">{item.nombre}</td>
                                    <td className="px-2 py-1 text-right">{item.cantidad}</td>
                                    <td className="px-2 py-1 text-right">{plata(item.precio)}</td>
                                    <td className="px-2 py-1 text-right font-medium">{plata(item.precio * item.cantidad)}</td>
                                  </tr>
                                ))}
                                <tr className="border-t-2 border-dark">
                                  <td className="px-2 py-1 text-left font-medium" colSpan={3}>Total</td>
                                  <td className="px-2 py-1 text-right font-medium">{plata(detalle.total)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
}
