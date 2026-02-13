import { Router } from 'express'
import { register, login, updateUser, deleteUser, getMe } from '../controllers/auth.controller.js'
import { verifyToken } from '../utils/auth.js'

const router = Router()

// --- Rutas Públicas ---
router.post('/register', register)
router.post('/login', login)

// --- Rutas Protegidas ---
// El middleware verifyToken se aplica a todas las rutas que siguen
router.get('/me', verifyToken, getMe)
router.put('/:id', verifyToken, updateUser)
router.delete('/:id', verifyToken, deleteUser)

export default router