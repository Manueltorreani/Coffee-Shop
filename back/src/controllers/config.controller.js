import { prisma } from '../lib/prisma.js'

// La configuración es UNA sola fila con id = 1.
// upsert = "update si existe, create si no existe" -> la primera vez se crea sola con los valores por defecto
const CONFIG_ID = 1

// OBTENER CONFIGURACIÓN
export const getConfig = async (req, res) => {
  try {
    const config = await prisma.configLocal.upsert({
      where: { id: CONFIG_ID },
      update: {},              // si existe no cambiamos nada
      create: { id: CONFIG_ID } // si no existe la creamos con los @default del schema
    })

    return res.status(200).json(config)
  } catch (err) {
    console.error("error obteniendo configuracion : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}

// ACTUALIZAR CONFIGURACIÓN (solo admin)
export const updateConfig = async (req, res) => {
  try {
    const { nombre, direccion, telefono, cuit, mensajeTicket, anchoTicket, imprimirAlCobrar } = req.body

    const data = {}

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || !nombre.trim()) {
        return res.status(400).json({ error: "El nombre del local es requerido" })
      }
      data.nombre = nombre.trim()
    }

    // campos de texto opcionales: string vacío se guarda como null
    if (direccion !== undefined) data.direccion = direccion?.trim() || null
    if (telefono !== undefined) data.telefono = telefono?.trim() || null
    if (cuit !== undefined) data.cuit = cuit?.trim() || null
    if (mensajeTicket !== undefined) data.mensajeTicket = mensajeTicket?.trim() || null

    if (anchoTicket !== undefined) {
      const ancho = Number(anchoTicket)
      if (ancho !== 58 && ancho !== 80) {
        return res.status(400).json({ error: "El ancho del ticket debe ser 58 u 80 mm" })
      }
      data.anchoTicket = ancho
    }

    if (imprimirAlCobrar !== undefined) {
      if (typeof imprimirAlCobrar !== "boolean") {
        return res.status(400).json({ error: "imprimirAlCobrar inválido" })
      }
      data.imprimirAlCobrar = imprimirAlCobrar
    }

    const config = await prisma.configLocal.upsert({
      where: { id: CONFIG_ID },
      update: data,
      create: { id: CONFIG_ID, ...data }
    })

    return res.status(200).json(config)
  } catch (err) {
    console.error("error actualizando configuracion : ", err)
    res.status(500).json({ error: "error interno del servidor" })
  }
}
