//importamos todas las funciones del "store" de memoria
import *as store from '../data/products.store.js'

//listamos los productos con query params 
 /*//- Leer los query params: nombre, page, limit, sortBy, sortOrder.
 //*  - Validarlos y convertirlos a número si hace falta.
 //*  - Calcular la paginación (skip/take).
 //*  - Consultar al store (Prisma) por los datos filtrados y ordenados.
   - Devolver la lista + metadatos de paginación.*/
export const listProducts = async (req, res) => {
  try {
    
    const { nombre, sortBy, sortOrder } = req.query //  Extraemos los parámetros de la URL (query params)

    // Si el usuario no pasa limit o page, usamos valores por defecto.
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const page  = req.query.page  ? Number(req.query.page)  : 1

    // . Validaciones básicas para evitar valores inválidos
    if (Number.isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'El parámetro "limit" debe ser un número mayor que 0' })
    }
    if (Number.isNaN(page) || page <= 0) {
      return res.status(400).json({ error: 'El parámetro "page" debe ser un número mayor que 0' })
    }
    //  . Calcular los valores para paginación
    const take = Math.min(limit, 100)     // Límite de seguridad (máx. 100 por página)
    const skip = (page - 1) * take        // Cuántos registros saltar (ej: page 2, limit 10 → skip 10)

    // . Consultamos la cantidad total de productos que cumplen el filtro
    const total = await store.countFiltered({ nombre }) // cuenta cuántos cumplen el filtro "nombre"
    const totalPages = Math.max(1, Math.ceil(total / take)) // calculamos el total de páginas
    // Si el usuario pide una página fuera de rango, devolvemos vacío pero meta correcta
    if (page > totalPages) {
      return res.json({
        items: [],
        meta: { total, page, limit: take, totalPages }
      })
    }
    //  Obtenemos los productos filtrados + ordenados desde el store
    const items = await store.listFiltered({
      nombre,
      skip,
      take,
      sortBy,
      sortOrder
    })
    //  Respondemos al cliente 
    return res.json({
      items, // array de productos devuelto por Prisma
      meta: { // metadatos útiles para el frontend
        total,       // total de productos que cumplen el filtro
        page,        // página actual
        limit: take, // cantidad por página
        totalPages   // páginas totales
      }
    })
  } catch (err) {
    console.error('ERROR listProducts ->', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

//obtenemos producto por id 
export const getProduct = async (req,res) =>{
    const id = Number(req.params.id)//// req.params.id viene como string → lo convertimos a número
   if ( Number.isNaN(id)) return res.status(404).json({error : "id invalido"})

    const found = await store.getById(id)
    if ( !found ) return res.status(404).json({error : "producto no encontrado"})
     res.json(found)   

}

//creamos nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { nombre, precio } = req.body

    // Validación explícita
    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'nombre es requerido (string)' })
    }
    if (typeof precio !== 'number' || Number.isNaN(precio)) {
      return res.status(400).json({ error: 'precio es requerido (number)' })
    }

    // ⚠️ Ignorá cualquier "id" que te manden por body (lo genera la BD)
    const nuevo = await store.create({ nombre, precio })
    return res.status(201).json(nuevo)
  } catch (err) {
    console.error('ERROR createProduct →', err) // 👈 acá vas a ver el motivo exacto
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

//actualizar un producto existente 
export const updateProduct = async (req,res)=>{
    const id = Number(req.params.id)
    const {nombre,precio} = req.body 
    if(Number.isNaN(id)) return res.json(400).json({error : "id invalido"})
    if ( !nombre || typeof precio !== 'number'){
        return res.status(400).json({error : "faltan campos requeridos o tipos invalidos"})
    }
    const updated =  await store.update(id, {nombre,precio})
    if(!updated) return res.status(404).json({error : " producto no encontrado"}      
    )
    res.json(updated)//devuelve el producto ya modificadd
}

//eliminar producto

export const deleteProduct = async (req,res)=>{
    const id = Number(req.params.id)
    if(Number.isNaN(id)) return res.json(400).json({error : "id invalido"})
    const ok = await store.remove(id)
    if ( !ok) return res.status(404).json({error : " producto no encontrado"})
      res.status(204).send()//204 no content , sin body   
}