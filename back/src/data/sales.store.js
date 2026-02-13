// back/src/data/sales.store.js
import { prisma } from '../lib/prisma.js'

/**
 * STORE (capa de datos)
 * - Acá NO decidimos status codes.
 * - No respondemos HTTP.
 * - Solo hablamos con la base de datos con Prisma.
 */

/**
 * Listar todas las ventas (incluye items + producto)
 * Útil para pantalla "Ventas" tipo Fudo (historial)
 */
export async function listAll() {
  return prisma.sale.findMany({
    // ✅ campo correcto: createdAt
    orderBy: { createdAt: 'desc' },

    // Traemos también sus items y cada producto
    include: {
      items: {
        include: { product: true },
      },
    },
  })
}

/**
 * Crear una venta con sus items.
 * IMPORTANTE:
 * - El front NO debería mandarnos el precio como "verdad".
 * - El precio lo buscamos en la DB para evitar inconsistencias o manipulación.
 *
 * items esperado:
 * [{ productId: number, cantidad: number }]
 */
export async function create({ cliente, comentario, medioPago, items }) {
  // 1) Traemos todos los productos involucrados (en 1 consulta)
  const productIds = items.map((it) => it.productId)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  // Map para acceso rápido por id
  const productMap = new Map(products.map((p) => [p.id, p]))

  // 2) Armamos items para insertar, y calculamos el total
  let total = 0

  const itemsToCreate = items.map((it) => {
    const prod = productMap.get(it.productId)

    // Si algún producto no existe, abortamos
    if (!prod) {
      throw new Error(`Producto inexistente: id=${it.productId}`)
    }

    // Tu schema tiene precio Int en SaleItem → convertimos el Float de Product
    const precioSnapshot = Math.round(prod.precio)

    total += precioSnapshot * it.cantidad

    return {
      productId: it.productId,
      cantidad: it.cantidad,
      precio: precioSnapshot, // ✅ snapshot histórico
    }
  })

  // 3) Guardamos venta + items juntos
  // Usamos transacción para garantizar consistencia
  const sale = await prisma.$transaction(async (tx) => {
    return tx.sale.create({
      data: {
        cliente: cliente ?? null,
        comentario: comentario ?? null,
        medioPago: medioPago ?? null,
        total,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    })
  })

  return sale
}

//listar ventas SOLO del dia actual
export async function listToday(){
    //inicio del dia ( 00:00:00.000)
}