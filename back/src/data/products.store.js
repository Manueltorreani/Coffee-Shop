import { prisma } from '../lib/prisma.js'   // OJO con la ruta relativa y el .js




//let productos =[]// Array en memoria para guardar productos (no se persiste, se borra si reinicias el server)
//let idCounter = 1// Contador para generar IDs automáticos (1, 2, 3, ...)

// Listar todos los productos
export async function list(){
    return prisma.product.findMany({orderBy : {id : 'asc'}})
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