import { Router } from "express"
//importamos rutas desde express para crear rutas agrupadas

//importamos los controladores que definimos antes 
import{
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/products.controller.js'

//creamos un ruter ( subconjunto de rutas )
const router = Router()

//GET /api/products -> lista todas 
router.get('/',listProducts)

//GET /api/products/ :id -> un producto especifico
router.get('/:id',getProduct)

//POST /api/products -> crear nuevo
router.post('/',createProduct)

//PUT /api/products -> actualizar existente
router.put('/:id',updateProduct)

//DELETE api/products ->eliminar existente
router.delete('/:id',deleteProduct)

//exportamos el router para usarlo en server.js
export default router
