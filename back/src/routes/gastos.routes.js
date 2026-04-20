import { Router } from "express"
import { verifyToken, verifyAdmin } from '../utils/auth.js' // Importamos middlewares
import { getGastos,createGastos,updateGasto,deleteGasto } from "../controllers/gastos.controller.js"
import { createTipoGastos,deleteTipoGasto,getTipoGastos,updateTipoGasto } from "../controllers/tipoGastos.controller.js"
//importamos los controladores en gastos.controller.js

//creamos un ruter ( subconjunto de rutas )

const router = Router()

// Rutas Públicas

//GET /api/gastos -> lista todas 
router.get('/', getGastos)
router.get('/tipo', getTipoGastos)


// Rutas Protegidas (Solo Admin puede crear/editar/borrar)

//POST /api/gastos -> crear nuevo
router.post('/', verifyToken, verifyAdmin, createGastos)

router.post('/tipo', verifyToken, verifyAdmin, createTipoGastos) // Crear Tipogastos (Solo Admin)
router.put('/tipo/:id', verifyToken, verifyAdmin, updateTipoGasto) // Actualizar Tipogastos (Solo Admin)
router.delete('/tipo/:id', verifyToken, verifyAdmin, deleteTipoGasto) // Eliminar Tipogastos (Solo Admin)

//PUT /api/gastos -> actualizar existente
router.put('/:id', verifyToken, verifyAdmin, updateGasto)
//DELETE api/gastos ->eliminar existente
router.delete('/:id', verifyToken, verifyAdmin, deleteGasto)


//exportamos el router para usarlo en server.js
export default router
