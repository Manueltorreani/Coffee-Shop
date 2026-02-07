
import { Router } from 'express'
// Asegurate de que este archivo (el controlador) tambien exista:
import { createOrder, getOrders, cancelOrder, completeOrder, getStats } from '../controllers/orders.controller.js'
// Asegurate de que este archivo (auth utils) tambien exista:
import { verifyToken, verifyAdmin } from '../utils/auth.js'

const router = Router()

// Todas las rutas de órdenes requieren estar logueado (JWT)
router.use(verifyToken)

// POST /api/orders -> Crear pedido
router.post('/', createOrder)

// GET /api/orders -> Ver pedidos
router.get('/', getOrders)

// PATCH /api/orders/:id/cancel -> Cancelar pedido (puede cancelar usuario o admin)
router.patch('/:id/cancel', cancelOrder)

// Rutas SOLO de Admin
// Usamos verifyAdmin como middleware extra aquí

// PATCH /api/orders/:id/complete -> Completar pedido
router.patch('/:id/complete', verifyAdmin, completeOrder)

// GET /api/orders/stats -> Ver estadísticas de órdenes (solo Admin)
router.get('/stats', verifyAdmin, getStats)

export default router