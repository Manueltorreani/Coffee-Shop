import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro" // ¡Usa .env!

// Encriptar contraseña -> libreria bcryptjs es un hasheo unidireccional de complejidad 10
// se usa hasheo porque es mas seguro que un cifrado (no se puede desencriptar)
// solo complejidad 10 para mas performance
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

// Verificar contraseña
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

// Generar Token JWT
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    SECRET,
    { expiresIn: '2h' } // Expira en 2 horas
  )
}

// Middleware para verificar Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  // El header viene como "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Falta token.' })

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' })
    req.user = user // Guardamos los datos del usuario en la request
    next()
  })
}

// Middleware para verificar si es Admin
export const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Requiere privilegios de administrador.' })
  }
  next()
}