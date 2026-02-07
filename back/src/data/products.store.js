import { prisma } from '../lib/prisma.js'

// Helper para construir el filtro dinámico
const buildWhere = ({ nombre, categoryId }) => {
  const where = {}
  
  // Filtro por nombre (parcial, insensible a mayúsculas)
  if (nombre) {
    where.nombre = { contains: nombre } // SQLite no soporta mode: 'insensitive' nativo fácilmente, en Postgres usarías mode: 'insensitive'
  }

  // Filtro exacto por ID de categoría
  if (categoryId) {
    where.categoryId = categoryId
  }

  return where
}

export const countFiltered = async ({ nombre, categoryId }) => {
  const where = buildWhere({ nombre, categoryId })
  return await prisma.product.count({ where })
}

export const listFiltered = async ({ nombre, categoryId, skip, take, sortBy, sortOrder }) => {
  const where = buildWhere({ nombre, categoryId })

  return await prisma.product.findMany({
    where,
    skip,
    take,
    orderBy: {
      [sortBy || 'createdAt']: sortOrder || 'desc'
    },
    // 🔥 IMPORTANTE: Incluimos la relación para ver el nombre de la categoría
    include: {
      category: {
        select: { nombre: true } // Solo traemos el nombre para no ensuciar la respuesta
      }
    }
  })
}

export const getById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })
}

export const create = async (data) => {
  return await prisma.product.create({ data })
}

export const update = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data
  })
}

export const remove = async (id) => {
  return await prisma.product.delete({ where: { id } })
}