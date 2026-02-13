import { Router } from "express"
import { verifyToken, verifyAdmin } from '../utils/auth.js' // Importamos middlewares
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js'

//importamos los controladores en products.controller.js
//creamos un ruter ( subconjunto de rutas )

const router = Router()

// Rutas Públicas

//GET /api/products -> lista todas 
router.get('/', listProducts)
//GET /api/products/ :id -> un producto especifico
router.get('/:id', getProduct)


// Rutas Protegidas (Solo Admin puede crear/editar/borrar)

//POST /api/products -> crear nuevo
router.post('/', verifyToken, verifyAdmin, createProduct)
//PUT /api/products -> actualizar existente
router.put('/:id', verifyToken, verifyAdmin, updateProduct)
//DELETE api/products ->eliminar existente
router.delete('/:id', verifyToken, verifyAdmin, deleteProduct)


//exportamos el router para usarlo en server.js
export default router
