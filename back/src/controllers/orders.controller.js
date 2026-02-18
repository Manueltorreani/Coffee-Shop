import {prisma} from '../lib/prisma.js'

/**
 * Crea una nueva orden.
 * Puede iniciar vacía o con productos ya seleccionados.
 */
export const createOrder = async (req, res) => {
  const { userId, items } = req.body; // items es un array: [{ productId, quantity }]

  try {
    // Usamos una transacción interactiva para asegurar integridad
    const result = await prisma.$transaction(async (tx) => {
      let totalOrder = 0;
      const orderItemsData = [];

      // 1. Si hay items, validamos stock (opcional) y obtenemos precios actuales
      if (items && items.length > 0) {
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product || !product.isActive) {
            throw new Error(`El producto con ID ${item.productId} no existe o no está activo.`);
          }

          const subtotal = product.precio * item.quantity;
          totalOrder += subtotal;

          // Preparamos el objeto para crear el OrderItem con SNAPSHOTS
          orderItemsData.push({
            productId: product.id,
            cantidad: item.quantity,
            precio: product.precio, // Snapshot del precio
            nombre: product.nombre  // Snapshot del nombre
          });
        }
      }

      // 2. Crear la orden con sus items (si existen)
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING', // O "EN_CURSO"
          total: totalOrder,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true // Retornamos los items creados al front
        }
      });

      return newOrder;
    });

    return res.status(201).json(result);

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: error.message || 'Error al crear la orden' });
  }
};

/**
 * Obtiene órdenes con filtros avanzados.
 * Maneja el desvío horario UTC-3 (Argentina)
 */
export const getOrders = async (req, res) => {
  const { startDate, endDate, status } = req.query;

  try {
    const whereClause = {};

    // 1. Filtro por Estado
    if (status) {
      whereClause.status = status;
    }

    // 2. Filtro por Rango de Fechas (Ajustado a UTC-3)
    if (startDate) {
      // Si no hay endDate, usamos la misma fecha de inicio para filtrar un solo día
      const finalEndDate = endDate || startDate;

      whereClause.createdAt = {
        // gte: mayor o igual que las 00:00:00 de Argentina
        gte: new Date(`${startDate}T00:00:00-03:00`),
        // lte: menor o igual que las 23:59:59 de Argentina
        lte: new Date(`${finalEndDate}T23:59:59-03:00`)
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        user: { 
          select: { id: true, nombre: true } 
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json(orders);

  } catch (error) {
    console.error("Error en getOrders:", error);
    return res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
};


/**
 * Actualiza el estado de la orden (e.g., de PENDING a COMPLETED o CANCELED)
 */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'COMPLETED', 'CANCELED'

  try {
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Error actualizando estado' });
  }
};

/**
 * Actualiza el estado de la orden (e.g., de PENDING a COMPLETED o CANCELED)
 */
export const updateOrder = async (req, res) => {
  const { id } = req.params;

  const data = {};

  if (req.body.status !== undefined) {
    data.status = req.body.status; // 'PENDING', 'COMPLETED', 'CANCELED'
  }

  if (req.body.client !== undefined) {
    data.client = req.body.client; //nombre del cliente o mesa
  }

  if (req.body.paymentMethod !== undefined) {
    data.paymentMethod = req.body.paymentMethod; // 'CASH', 'CARD', etc. en string para mayor flexibilidad historica
  }
    
   

  try {
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: data,
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Error actualizando' });
  }
};

/**
 * Reporte de Ingresos (Analytics)
 * Calcula el total vendido en un rango de tiempo ajustado a UTC-3
 */
export const getRevenueStats = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    if (!startDate) {
      return res.status(400).json({ error: 'Se requiere al menos startDate' });
    }

    // Usamos la misma lógica de "blindaje" horario
    const finalEndDate = endDate || startDate;
    const start = new Date(`${startDate}T00:00:00-03:00`);
    const end = new Date(`${finalEndDate}T23:59:59-03:00`);

    // Prisma Aggregate para sumar de forma eficiente en la DB
    const aggregations = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED' // Solo sumamos lo que ya fue cobrado
      },
    });

    return res.json({
      range: { startDate, endDate: finalEndDate },
      totalRevenue: aggregations._sum.total || 0,
      totalOrders: aggregations._count.id || 0
    });

  } catch (error) {
    console.error("Error en getRevenueStats:", error);
    return res.status(500).json({ error: 'Error calculando ingresos' });
  }
};

export const updateOrderItems = async (req, res) => {
  const { id } = req.params; // ID de la Orden
  const { productId, action } = req.body; // action: 'ADD', 'REMOVE', 'DELETE'

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar la orden y el producto
      const order = await tx.order.findUnique({ 
        where: { id: Number(id) }, 
        include: { items: true } 
      });
      
      if (!order || order.status !== 'PENDING') {
        throw new Error("La orden no existe o ya está cerrada.");
      }

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Producto no encontrado.");

      // 2. Buscar si el item ya está en la orden
      const existingItem = order.items.find(item => item.productId === productId);

      if (action === 'ADD') {
        if (existingItem) {
          await tx.orderItem.update({
            where: { id: existingItem.id },
            data: { cantidad: { increment: 1 } }
          });
        } else {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              nombre: product.nombre,
              precio: product.precio,
              cantidad: 1
            }
          });
        }
      } 
      
      else if (action === 'REMOVE' && existingItem) {
        if (existingItem.cantidad > 1) {
          await tx.orderItem.update({
            where: { id: existingItem.id },
            data: { cantidad: { decrement: 1 } }
          });
        } else {
          await tx.orderItem.delete({ where: { id: existingItem.id } });
        }
      }

      else if (action === 'DELETE' && existingItem) {
        await tx.orderItem.delete({ where: { id: existingItem.id } });
      }

      // 3. Recalcular el TOTAL de la orden
      const updatedItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
      const newTotal = updatedItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

      return await tx.order.update({
        where: { id: order.id },
        data: { total: newTotal },
        include: { items: true }
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ==========================================
// PAYMENT METHODS
// ==========================================

export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métodos' });
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const method = await prisma.paymentMethod.create({
      data: { nombre: req.body.nombre }
    });
    res.json(method);
  } catch (error) {
    res.status(500).json({ error: 'Error creando método' });
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    const method = await prisma.paymentMethod.update({
      where: { id: Number(req.params.id) },
      data: { nombre: req.body.nombre }
    });
    res.json(method);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando método' });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    await prisma.paymentMethod.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando método' });
  }
};
