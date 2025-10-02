//importamos todas las funciones del "store" de memoria
import *as store from '../data/products.store.js'

//listamos los productos
export const listProducts =  async ( req,res)=>{
    const items = await store.list()
    res.json(items)
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