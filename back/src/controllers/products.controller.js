import * as store from '../data/products.store.js'
import { prisma } from '../lib/prisma.js'

// 1. Listar productos con filtros y paginación
export const listProducts = async (req, res) => {
  try {
    const { nombre, sortBy, sortOrder } = req.query
    
    // Filtro por categoría
    let categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined
    if (req.query.categoryId && Number.isNaN(categoryId)) {
        return res.status(400).json({ error: 'El categoryId debe ser un número' })
    }

    const limit = req.query.limit ? Number(req.query.limit) : 10
    const page  = req.query.page  ? Number(req.query.page)  : 1

    if (Number.isNaN(limit) || limit <= 0) return res.status(400).json({ error: 'Limit inválido' })
    if (Number.isNaN(page) || page <= 0) return res.status(400).json({ error: 'Page inválido' })

    const take = Math.min(limit, 100)
    const skip = (page - 1) * take

    const total = await store.countFiltered({ nombre, categoryId })
    const totalPages = Math.max(1, Math.ceil(total / take))

    const items = await store.listFiltered({
      nombre,
      categoryId,
      skip,
      take,
      sortBy,
      sortOrder
    })

    return res.json({
      items,
      meta: { total, page, limit: take, totalPages }
    })
  } catch (err) {
    console.error('ERROR listProducts ->', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// 2. Obtener un producto por ID
export const getProduct = async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" })

    try {
        const found = await store.getById(id)
        if (!found) return res.status(404).json({ error: "Producto no encontrado" })
        res.json(found)
    } catch (err) {
        res.status(500).json({ error: "Error al obtener el producto" })
    }
}

// 3. Crear producto (Requiere Admin en rutas)
export const createProduct = async (req, res) => {
  try {
    const { nombre, precio, categoryId } = req.body

    if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: 'nombre requerido (string)' })
    if (typeof precio !== 'number') return res.status(400).json({ error: 'precio requerido (number)' })
    if (typeof categoryId !== 'number') return res.status(400).json({ error: 'categoryId requerido (number)' })

    const nuevo = await store.create({ nombre, precio, categoryId })
    return res.status(201).json(nuevo)
  } catch (err) {
    if (err.code === 'P2003') return res.status(400).json({ error: 'La categoría no existe' })
    console.error('ERROR createProduct →', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// 4. Actualizar producto (Requiere Admin en rutas)
export const updateProduct = async (req, res) => {
    const id = Number(req.params.id)
    const { nombre, precio, categoryId } = req.body

    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" })

    try {
        const updated = await store.update(id, { nombre, precio, categoryId })
        res.json(updated)
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: "Producto no encontrado" })
        res.status(500).json({ error: "Error al actualizar" })
    }
}

// 5. ELIMINAR PRODUCTO (La que faltaba)
export const deleteProduct = async (req, res) => {
    const id = Number(req.params.id)
    
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" })
    }

    try {
        await store.remove(id)
        // 204 No Content: Todo salió bien pero no hay nada que devolver
        res.status(204).send() 
    } catch (err) {
        // P2025 es el código de Prisma cuando no encuentra el registro para borrar
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Producto no encontrado" })
        }
        console.error('ERROR deleteProduct ->', err)
        res.status(500).json({ error: "Error interno al intentar eliminar" })
    }
}


export const createCategory = async (req, res) => {
    const { nombre } = req.body
    if (!nombre || typeof nombre !== 'string') {
        return res.status(400).json({ error: 'nombre requerido (string)' })
    }
    try {
        const nueva = await prisma.category.create({ data: { nombre } })
        res.status(201).json(nueva)
    } catch (err) {
        console.error('ERROR createCategory ->', err)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const deleteCategory = async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" })
    try {
        await prisma.category.delete({ where: { id } })
        res.status(204).send()
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: "Categoría no encontrada" })
        console.error('ERROR deleteCategory ->', err)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const updateCategory = async (req, res) => {
    const id = Number(req.params.id)
    const { nombre } = req.body
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" })
    if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: 'nombre requerido (string)' })
    try {
        const updated = await prisma.category.update({ where: { id }, data: { nombre } })
        res.json(updated)
    }
        catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: "Categoría no encontrada" })
        console.error('ERROR updateCategory ->', err)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const getCategory = async (req, res) => {
    try {
        const categories = await prisma.category.findMany()
        res.json(categories)
    } catch (err) {
        console.error('ERROR getCategories ->', err)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}