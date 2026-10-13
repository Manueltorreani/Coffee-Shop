import { prisma } from '../lib/prisma.js'
import { rangoPorPeriodo, filtroRango } from '../utils/rangoFechas.js'

// ==========================================
// HELPERS
// ==========================================

const SIN_DEFINIR = 'Sin definir' // para ventas/gastos que no tienen método de pago

// Clave para agrupar métodos sin importar mayúsculas ni espacios ("Efectivo", " efectivo" -> "efectivo")
// (SQLite + Prisma no soportan comparar texto case-insensitive, por eso agrupamos en JS)
const clave = (metodo) => (metodo?.trim() || SIN_DEFINIR).toLowerCase()

// Calcula, POR CADA MÉTODO DE PAGO, los totales de un arqueo entre su apertura y "hasta"
// (ahora si está abierto, o el momento del cierre).
// Fórmula por método: monto sistema = inicial + ventas + ingresos manuales − gastos − egresos manuales
// (el inicial solo lo tiene Efectivo)
const calcularResumen = async (arqueo, hasta) => {
  const rango = { gte: arqueo.fechaApertura, lte: hasta }

  // 1. Ventas cobradas en el horario del arqueo
  const ventas = await prisma.order.findMany({
    where: { status: 'COMPLETED', createdAt: rango },
    select: { total: true, paymentMethod: true }
  })

  // 2. Gastos cargados en el horario del arqueo
  const gastos = await prisma.gastos.findMany({
    where: { createdAt: rango },
    select: { precio: true, paymentMethod: true }
  })

  // 3. Movimientos manuales de ESTE arqueo (estos sí están relacionados)
  const movimientos = await prisma.movimientoCaja.findMany({
    where: { arqueoId: arqueo.id },
    select: { tipo: true, monto: true, paymentMethod: true }
  })

  // 4. Métodos configurados: aparecen siempre, aunque estén en 0
  const configurados = await prisma.paymentMethod.findMany({ orderBy: { nombre: 'asc' } })

  // "metodos" es un objeto { clave: fila } -> así sumamos cada importe en la fila de su método
  const metodos = {}
  const fila = (nombre) => {
    const k = clave(nombre)
    if (!metodos[k]) {
      metodos[k] = { metodo: nombre?.trim() || SIN_DEFINIR, montoInicial: 0, ventas: 0, ingresos: 0, gastos: 0, egresos: 0 }
    }
    return metodos[k]
  }

  fila('Efectivo').montoInicial = arqueo.montoInicial // Efectivo siempre está (tiene el inicial)
  configurados.forEach((m) => fila(m.nombre))
  // además, cualquier método que haya tenido movimiento (ej. uno que se borró de Configuración)
  ventas.forEach((v) => { fila(v.paymentMethod).ventas += v.total })
  gastos.forEach((g) => { fila(g.paymentMethod).gastos += g.precio })
  movimientos.forEach((m) => {
    if (m.tipo === 'INGRESO') fila(m.paymentMethod).ingresos += m.monto
    else fila(m.paymentMethod).egresos += m.monto
  })

  // aplicamos la fórmula a cada método y lo pasamos a array
  const detalle = Object.values(metodos).map((m) => ({
    ...m,
    montoSistema: m.montoInicial + m.ventas + m.ingresos - m.gastos - m.egresos
  }))

  const montoSistema = detalle.reduce((acc, m) => acc + m.montoSistema, 0)

  return { detalle, montoSistema }
}

// Busca la caja abierta (si hay). Regla: nunca puede haber más de una.
const buscarCajaAbierta = () => {
  return prisma.arqueoCaja.findFirst({ where: { estado: 'ABIERTA' } })
}

// ==========================================
// ARQUEOS
// ==========================================

// GET /api/caja/actual -> la caja abierta con sus movimientos y el resumen "en vivo" (o null si no hay)
export const getCajaActual = async (req, res) => {
  try {
    const abierta = await buscarCajaAbierta()
    if (!abierta) return res.status(200).json(null)

    const arqueo = await prisma.arqueoCaja.findUnique({
      where: { id: abierta.id },
      include: {
        usuarioApertura: { select: { id: true, nombre: true, email: true } },
        movimientos: {
          include: { user: { select: { nombre: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    const resumen = await calcularResumen(arqueo, new Date())

    return res.status(200).json({ ...arqueo, resumen })
  } catch (err) {
    console.error("error obteniendo caja actual : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// POST /api/caja/abrir -> abre una caja nueva
export const abrirCaja = async (req, res) => {
  try {
    const montoInicial = Number(req.body.montoInicial)

    if (Number.isNaN(montoInicial) || montoInicial < 0) {
      return res.status(400).json({ error: "Monto inicial inválido" })
    }

    // Regla: no puede haber dos cajas abiertas a la vez
    const abierta = await buscarCajaAbierta()
    if (abierta) {
      return res.status(409).json({ error: "Ya hay una caja abierta" })
    }

    const arqueo = await prisma.arqueoCaja.create({
      data: {
        montoInicial,
        usuarioAperturaId: req.user.id // quién abrió sale del token
      }
    })

    return res.status(201).json(arqueo)
  } catch (err) {
    console.error("error abriendo caja : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// POST /api/caja/cerrar -> cierra la caja abierta y GUARDA la foto por método de pago
// body: { contados: { "Efectivo": 1300, "Debito": 800, ... }, comentario }
export const cerrarCaja = async (req, res) => {
  try {
    const { contados, comentario } = req.body

    if (!contados || typeof contados !== "object") {
      return res.status(400).json({ error: "Ingresá los montos contados" })
    }

    const abierta = await buscarCajaAbierta()
    if (!abierta) {
      return res.status(400).json({ error: "No hay una caja abierta" })
    }

    const fechaCierre = new Date()
    const resumen = await calcularResumen(abierta, fechaCierre)

    // armamos el detalle: a cada método le agregamos lo contado y su diferencia
    const detalle = []
    for (const m of resumen.detalle) {
      const valor = contados[m.metodo]
      const contado = Number(valor)
      if (valor === undefined || valor === "" || Number.isNaN(contado) || contado < 0) {
        return res.status(400).json({ error: `Ingresá el monto contado de ${m.metodo}` })
      }
      detalle.push({ ...m, montoUsuario: contado, diferencia: contado - m.montoSistema })
    }

    const montoUsuario = detalle.reduce((acc, m) => acc + m.montoUsuario, 0)

    // update + create anidado: el arqueo y su detalle se guardan juntos (si algo falla, no se guarda nada)
    const arqueo = await prisma.arqueoCaja.update({
      where: { id: abierta.id },
      data: {
        estado: 'CERRADA',
        fechaCierre,
        montoSistema: resumen.montoSistema,
        montoUsuario,
        diferencia: montoUsuario - resumen.montoSistema, // negativo = falta plata, positivo = sobra
        comentario: comentario?.trim() || null,
        usuarioCierreId: req.user.id, // quién cerró sale del token
        detalle: { create: detalle }
      },
      include: { detalle: true }
    })

    return res.status(200).json(arqueo)
  } catch (err) {
    console.error("error cerrando caja : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// GET /api/caja -> historial de arqueos (solo admin)
export const getArqueos = async (req, res) => {
  try {
    const arqueos = await prisma.arqueoCaja.findMany({
      include: {
        usuarioApertura: { select: { nombre: true, email: true } },
        usuarioCierre: { select: { nombre: true, email: true } },
        detalle: true // foto por método de pago
      },
      orderBy: { fechaApertura: 'desc' }
    })

    return res.status(200).json(arqueos)
  } catch (err) {
    console.error("error obteniendo arqueos : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// ==========================================
// MOVIMIENTOS MANUALES
// ==========================================

// POST /api/caja/movimientos -> registra un ingreso o egreso manual en la caja abierta
export const createMovimiento = async (req, res) => {
  try {
    const { tipo, monto, descripcion, paymentMethod } = req.body
    const montoNum = Number(monto)

    if (tipo !== 'INGRESO' && tipo !== 'EGRESO') {
      return res.status(400).json({ error: "El tipo debe ser INGRESO o EGRESO" })
    }
    if (Number.isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: "Monto inválido" })
    }
    if (!descripcion || typeof descripcion !== "string" || !descripcion.trim()) {
      return res.status(400).json({ error: "Descripción requerida" })
    }
    if (!paymentMethod || typeof paymentMethod !== "string" || !paymentMethod.trim()) {
      return res.status(400).json({ error: "Método de pago requerido" })
    }

    // Regla: no se registran movimientos sin una caja abierta
    const abierta = await buscarCajaAbierta()
    if (!abierta) {
      return res.status(400).json({ error: "Primero tenés que abrir la caja" })
    }

    const movimiento = await prisma.movimientoCaja.create({
      data: {
        tipo,
        monto: montoNum,
        paymentMethod: paymentMethod.trim(),
        descripcion: descripcion.trim(),
        arqueoId: abierta.id,
        userId: req.user.id
      }
    })

    return res.status(201).json(movimiento)
  } catch (err) {
    console.error("error creando movimiento : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// DELETE /api/caja/movimientos/:id -> borra un movimiento (solo si su caja sigue abierta)
export const deleteMovimiento = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "id inválido" })
    }

    const movimiento = await prisma.movimientoCaja.findUnique({
      where: { id },
      include: { arqueo: true }
    })
    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado" })
    }
    // una caja cerrada no se toca: su foto ya quedó guardada
    if (movimiento.arqueo.estado !== 'ABIERTA') {
      return res.status(400).json({ error: "No se puede borrar un movimiento de una caja cerrada" })
    }

    await prisma.movimientoCaja.delete({ where: { id } })

    return res.status(200).json(movimiento)
  } catch (err) {
    console.error("error eliminando movimiento : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// ==========================================
// VENTAS POR PERÍODO (pestaña Ventas de Caja, solo admin)
// ==========================================

// GET /api/caja/ventas?periodo=diario|mensual|anual&fecha=YYYY-MM-DD
// Devuelve el rango de fechas, el resumen (cantidad, promedio, total) y la lista de ventas del período.
export const getVentasResumen = async (req, res) => {
  try {
    const { periodo = 'diario', fecha } = req.query

    const rango = rangoPorPeriodo(periodo, fecha)
    if (!rango) {
      return res.status(400).json({ error: "Período o fecha inválidos (periodo: diario|mensual|anual, fecha: YYYY-MM-DD)" })
    }

    const createdAt = filtroRango(rango)

    // Las dos consultas son independientes -> las lanzamos juntas con Promise.all
    const [totales, ventas] = await Promise.all([
      // aggregate: la base cuenta, suma y promedia (no traemos las filas para calcular en JS).
      // Solo COMPLETED: es la plata que realmente entró.
      prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt },
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
      }),
      // La tabla muestra TODAS las ventas del período (pendientes y canceladas también)
      prisma.order.findMany({
        where: { createdAt },
        orderBy: { createdAt: 'desc' },
        select: { id: true, client: true, createdAt: true, closedAt: true, status: true, paymentMethod: true, total: true },
      }),
    ])

    return res.status(200).json({
      periodo,
      desde: rango.desde,
      hasta: rango.hasta,
      resumen: {
        cantidad: totales._count.id,
        promedio: totales._avg.total ?? 0, // si no hay ventas, _avg y _sum vienen en null
        total: totales._sum.total ?? 0,
      },
      ventas,
    })
  } catch (err) {
    console.error("error obteniendo ventas por período : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// GET /api/caja/ventas/:id
// Detalle de UNA venta: la orden con sus productos (OrderItem) y el usuario que la cargó.
// Se pide recién al hacer click en la fila, así el listado por período no viaja con todos los ítems.
export const getVentaDetalle = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "id inválido" })
    }

    const venta = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true, // nombre, cantidad y precio guardados como eran al momento de vender (snapshot)
        user: { select: { id: true, nombre: true, email: true } }, // select: no mandamos la contraseña
      },
    })

    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" })
    }

    return res.status(200).json(venta)
  } catch (err) {
    console.error("error obteniendo detalle de venta : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}
