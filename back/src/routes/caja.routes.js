import { Router } from "express"
import { verifyToken, verifyAdmin } from '../utils/auth.js' // Importamos middlewares
import { getCajaActual, abrirCaja, cerrarCaja, getArqueos, createMovimiento, deleteMovimiento, getVentasResumen, getVentaDetalle } from "../controllers/caja.controller.js"

const router = Router()

// Empleados y admin (verifyToken): operan la caja del día
router.get('/actual', verifyToken, getCajaActual)         // caja abierta + resumen en vivo
router.post('/abrir', verifyToken, abrirCaja)             // abrir con monto inicial
router.post('/cerrar', verifyToken, cerrarCaja)           // cerrar con monto contado
router.post('/movimientos', verifyToken, createMovimiento) // ingreso/egreso manual
router.delete('/movimientos/:id', verifyToken, deleteMovimiento)

// Solo admin: historial de todos los arqueos
router.get('/', verifyToken, verifyAdmin, getArqueos)

// Solo admin: ventas de un período (diario / mensual / anual) con resumen
// GET /api/caja/ventas?periodo=diario&fecha=2026-10-13
router.get('/ventas', verifyToken, verifyAdmin, getVentasResumen)
// Solo admin: detalle de una venta (productos) -> GET /api/caja/ventas/10
router.get('/ventas/:id', verifyToken, verifyAdmin, getVentaDetalle)

export default router
