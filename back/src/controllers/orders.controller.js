import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id // Viene del middleware verifyToken
    const { items } = req.body // Esperamos: [{ productId: 1, cantidad: 2 }, ...]

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no puede estar vacío' })
    }

    // 1. Calcular total y preparar datos verificando precios ACTUALES
    let totalOrder = 0
    const orderItemsData = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      
      if (!product) {
        return res.status(404).json({ error: `Producto ID ${item.productId} no encontrado` })
      }

      // ⚠️ AQUÍ ESTÁ LA MAGIA:
      // Usamos 'product.precio' (precio actual de la BD) para guardarlo en la orden.
      // Ignoramos cualquier precio que envíe el usuario desde el frontend.
      const snapshotPrice = product.precio
      const subtotal = snapshotPrice * item.cantidad
      
      totalOrder += subtotal

      orderItemsData.push({
        productId: product.id,
        cantidad: item.cantidad,
        precio: snapshotPrice // Guardamos el precio histórico
      })
    }

    // 2. Crear la orden y sus items en una transacción
    const newOrder = await prisma.order.create({
      data: {
        userId,
        total: totalOrder,
        items: {
          create: orderItemsData 
        }
      },
      include: { items: true } // Devolver la orden con sus items
    })

    res.status(201).json(newOrder)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear la orden' })
  }
}

// Obtener órdenes (Admin ve todas, Usuario ve las suyas)
export const getOrders = async (req, res) => {
    const whereClause = req.user.isAdmin ? {} : { userId: req.user.id }
    
    const orders = await prisma.order.findMany({
        where: whereClause,
        include: { items: { include: { product: true } } }
    })
    res.json(orders)
}

// Cancelar una orden
export const cancelOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id)
    const userId = req.user.id
    const isAdmin = req.user.isAdmin

    // 1. Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return res.status(404).json({ error: 'Orden no encontrada' })

    // 2. Seguridad: ¿Es el dueño de la orden o es admin?
    if (order.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta orden' })
    }

    // 3. Opcional: Validar que no esté ya completada
    if (order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'No se puede cancelar una orden que ya fue completada' })
    }

    // 4. Actualizar el estado a "CANCELED"
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' }
    })

    res.json({ message: 'Orden cancelada con éxito', order: updatedOrder })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al cancelar la orden' })
  }
}

//  Completar orden, PATCH /api/orders/:id/complete
export const completeOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id)

    // 1. Verificación de seguridad: Solo el admin puede completar
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Solo un administrador puede marcar órdenes como completadas' })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' })

    // 2. Cambiar estado a COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' }
    })

    res.json({ message: 'Orden marcada como completada', order: updatedOrder })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la orden' })
  }
}

// GET Obtener estadísticas de órdenes (solo Admin)
export const getStats = async (req, res) => {
  try {
    // Solo el Admin puede ver la "caja"
    if (!req.user.isAdmin) return res.status(403).json({ error: 'No autorizado' })

    const stats = await prisma.order.aggregate({
      where: { status: 'COMPLETED' }, // Solo sumamos lo que ya se pagó/entregó
      _sum: { total: true },
      _count: { id: true }
    })

    res.json({
      ingresosTotales: stats._sum.total || 0,
      pedidosFinalizados: stats._count.id || 0
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular estadísticas' })
  }
}