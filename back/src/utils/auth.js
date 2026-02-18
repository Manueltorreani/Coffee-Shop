import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro" // Mientras mas largo y complejo, mejor. En producción, usaria una variable de entorno y no hardcodear el secreto.

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
 
  // El token JWT tiene 3 partes: header, payload y signature
  // yyyyy.xxxxx.zzzzz
 
  // el header por defecto en esta libreria es { alg: "HS256", typ: "JWT" } tipo de hasheo 
  // el payload es el objeto que queremos guardar (en este caso id, email e isAdmin)
  // el signature se genera con el header, payload y el secreto (SECRET), es para
    // verificar que el token no ha sido modificado y que fue generado por nuestro servidor

  return jwt.sign(

    { id: user.id, email: user.email, isAdmin: user.isAdmin }, // payload
    SECRET, // + payload y header = signature
    { expiresIn: '2h' } // Expira en 2 horas {alg: "HS256"} = HEADER
  )
}

// Middleware para verificar Token , intermediario porque sucede antes de la funcion requerida . 
export const verifyToken = (req, res, next) => { // para funciones de express siempre tengo que poner en params req,res,(y next si es middleware)
  const authHeader = req.headers['authorization']
  // El header viene como "Bearer <token>"
  // Extraemos el token -> Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1] // split corta el arreglo para guardar token

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