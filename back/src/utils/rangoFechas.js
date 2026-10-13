// ==========================================
// RANGOS DE FECHAS POR PERÍODO
// ==========================================
// El local trabaja en hora de Argentina (UTC-3, sin horario de verano).
// Es el mismo criterio que usa orders.controller.js: armar la fecha con "-03:00" al final.
const ZONA = '-03:00'

const PERIODOS = ['diario', 'mensual', 'anual']

// Recibe el período ('diario' | 'mensual' | 'anual') y una fecha 'YYYY-MM-DD' que cae dentro de ese período.
// Devuelve { desde, hasta } como objetos Date, o null si los datos son inválidos.
// El rango es [desde, hasta): incluye "desde" y NO incluye "hasta" (que es el inicio del período siguiente).
// Ej: diario 2026-10-13 -> desde 13/10 00:00, hasta 14/10 00:00
export function rangoPorPeriodo(periodo, fecha) {
  if (!PERIODOS.includes(periodo)) return null

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || '')
  if (!partes) return null

  const anio = Number(partes[1])
  const mes = Number(partes[2])

  // completa con cero a la izquierda: 3 -> "03"
  const dos = (n) => String(n).padStart(2, '0')

  let desde
  let hasta

  if (periodo === 'diario') {
    desde = new Date(`${fecha}T00:00:00${ZONA}`)
    // un día inexistente (ej: 2026-02-31) JS lo "corre" a marzo en vez de fallar:
    // volvemos a pasar la fecha a texto en hora de Argentina y, si no coincide con la que llegó, es inválida
    const ida = new Date(desde.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
    if (ida !== fecha) return null
    hasta = new Date(desde.getTime() + 24 * 60 * 60 * 1000) // + 1 día
  } else if (periodo === 'mensual') {
    desde = new Date(`${anio}-${dos(mes)}-01T00:00:00${ZONA}`)
    // mes siguiente (si es diciembre, enero del año que viene)
    const sigAnio = mes === 12 ? anio + 1 : anio
    const sigMes = mes === 12 ? 1 : mes + 1
    hasta = new Date(`${sigAnio}-${dos(sigMes)}-01T00:00:00${ZONA}`)
  } else {
    desde = new Date(`${anio}-01-01T00:00:00${ZONA}`)
    hasta = new Date(`${anio + 1}-01-01T00:00:00${ZONA}`)
  }

  // fecha con formato correcto pero inexistente (ej: 2026-02-31) -> Invalid Date
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) return null

  return { desde, hasta }
}

// Filtro de Prisma para un campo fecha dentro del rango [desde, hasta)
// Uso: where: { createdAt: filtroRango(rango) }
export const filtroRango = ({ desde, hasta }) => ({ gte: desde, lt: hasta })
