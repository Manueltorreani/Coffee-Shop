import { prisma } from '../lib/prisma.js'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js'

//register (publico) -> crea usuario y genera token JWT para auto-login
export const register = async (req, res) => {
  try {
    const { email, password, nombre } = req.body
    
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'El email ya está registrado' })
    if (password .length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    const hashedPassword = await hashPassword(password)
    
    // 1. Creamos el usuario
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nombre }
    })

    // 2. Generamos el token inmediatamente (Auto-login)
    const token = generateToken(user)

    const { password: _, ...userWithoutPassword } = user
    
    // 3. Devolvemos token + datos del usuario
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin, nombre: user.nombre } 
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
}

//login (publico) -> genera token JWT
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await prisma.user.findUnique({ where: { email } })
    
    // Importante: verificar que el usuario esté activo (Soft Delete)
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas o cuenta desactivada' })
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' })

    // Generamos el token
    const token = generateToken(user)
    
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin, nombre: user.nombre } 
    })
  } catch (error) {
    res.status(500).json({ error: 'Error en el login' })
  }
}

// 3. Update (Protegido - El usuario se edita a sí mismo o es Admin)
export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nombre, email, password } = req.body

    // Seguridad: Solo el propio usuario o un Admin puede editar
    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para editar este perfil' })
    }

    const dataToUpdate = {}
    if (nombre) dataToUpdate.nombre = nombre
    if (email) dataToUpdate.email = email
    if (password) dataToUpdate.password = await hashPassword(password)

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    })

    const { password: _, ...userWithoutPassword } = updated
    res.json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

// 4. Delete Lógico (Protegido - Solo Admin o el propio usuario)
export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' })
    }

    // SOFT DELETE: Cambiamos activo a false en lugar de borrar
    await prisma.user.update({
      where: { id },
      data: { activo: false }
    })

    res.json({ message: 'Usuario desactivado correctamente (Soft Delete)' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
}

//5 Perfil del usuario actual (valida el token y devuelve datos frescos)
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })
    if (!user || !user.activo) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
}