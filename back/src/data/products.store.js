import { prisma } from '../lib/prisma.js'   // OJO con la ruta relativa y el .js




//let productos =[]// Array en memoria para guardar productos (no se persiste, se borra si reinicias el server)
//let idCounter = 1// Contador para generar IDs automáticos (1, 2, 3, ...)

// Listar todos los productos
export async function list(){
    return prisma.product.findMany({orderBy : {id : 'asc'}})
}

function buildWhere({ nombre }) {
  const where = {}
  if (nombre) {
    where.nombre = { contains: nombre }
  }
  return where
}

export async function countFiltered({nombre}) {
  const where = buildWhere({nombre})
  return prisma.product.count({where})
}


//Lista productos con filtros y paginación.
export async function listFiltered({
    nombre,
    skip,
    take,
    sortBy = 'id',     // campo por el cual ordenar (por defecto: id)
    sortOrder = 'asc', // dirección de orden ('asc' o 'desc')
  }) {
    const where = buildWhere({ nombre })

    // 🧱 Seguridad: permitimos solo ciertos campos para ordenar.
    // Esto evita inyección o errores si alguien manda "sortBy=algoRaro"
    const allowedSortBy = new Set(['id', 'nombre', 'precio'])
    if (!allowedSortBy.has(sortBy)) sortBy = 'id'

    // Aseguramos que sortOrder solo sea "asc" o "desc"
    const order = (sortOrder === 'desc') ? 'desc' : 'asc'

    // 🔎 Consulta a BD con Prisma (asíncrona)
    return prisma.product.findMany({
      where,              // objeto dinámico con filtros
      skip,               // saltea N registros (paginación)
      take,               // trae N registros (tamaño de página)
      orderBy: { [sortBy]: order } // orden dinámico por campo y dirección
    })
}

// Buscar un producto por su ID
export  async function getById(id){
    // find devuelve el primer elemento que cumple la condición
    return prisma.product.findUnique({where:{ id }})
}

// Crear un producto nuevo
export async function create({ nombre, precio }) {
  // importante: NO mandes "id" acá
  return prisma.product.create({
    data: { nombre, precio }
  })
}

//actualizar producto por id 
export  async function update(id, {nombre,precio}){
   try{
        return await prisma.product.update({
            where: {id},
            data :{nombre,precio}
        })
   } catch  {
    return null // si no existe
   }
}

//eliminar producto por id 
export  async function remove(id){
    try{
         await prisma.product.delete({
            where: {id},
        }) 
        return true 
   } catch  {
    return false // si no existe
   }

}