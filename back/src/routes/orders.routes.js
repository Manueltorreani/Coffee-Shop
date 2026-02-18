
import { Router } from 'express'
import { 
  createOrder, 
  getOrders, 
  getRevenueStats, 
  updateOrder, 
  updateOrderItems,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '../controllers/orders.controller.js';
import { verifyToken, verifyAdmin } from '../utils/auth.js'

const router = Router()

// ==========================================
// ORDERS - Geters y Estadísticas
// ==========================================

// Obtener todas las órdenes (con filtros de fecha y estado)
// GET /api/orders?startDate=...&status=...
router.get('/', verifyToken, getOrders);

// Obtener estadísticas de ingresos
// GET /api/orders/stats?startDate=...
router.get('/stats', verifyToken, verifyAdmin, getRevenueStats); 


// ==========================================
// PAYMENT METHODS
// ==========================================

router.get('/payment-methods', verifyToken, getPaymentMethods);

router.post('/payment-methods', verifyToken, verifyAdmin, createPaymentMethod);

router.put('/payment-methods/:id', verifyToken, verifyAdmin, updatePaymentMethod);

router.delete('/payment-methods/:id', verifyToken, verifyAdmin, deletePaymentMethod);

// ==========================================
// ÓRDENES - Creación y Actualización ADMIN
// ==========================================

// Crear una nueva orden (Apertura de caja / Nueva venta)
// POST /api/orders
router.post('/', verifyToken, verifyAdmin, createOrder);

// Actualizar estado (Ej: PENDING -> COMPLETED o CANCELED)
// PATCH /api/orders/:id/status
router.patch('/:id/status', verifyToken, verifyAdmin, updateOrder);

// Actualizar items de una orden (Agregar/Quitar cantidad)
router.put('/:id/items', verifyToken, verifyAdmin, updateOrderItems);

export default router;