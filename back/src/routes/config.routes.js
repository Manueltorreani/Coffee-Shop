import { Router } from "express"
import { verifyToken, verifyAdmin } from '../utils/auth.js' // Importamos middlewares
import { getConfig, updateConfig } from "../controllers/config.controller.js"

const router = Router()

//GET /api/config -> cualquier usuario logueado (Ventas la usa para imprimir el ticket)
router.get('/', verifyToken, getConfig)

//PUT /api/config -> solo admin modifica los datos del local
router.put('/', verifyToken, verifyAdmin, updateConfig)

export default router
