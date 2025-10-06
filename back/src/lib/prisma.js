// src/lib/prisma.js
import { PrismaClient } from '@prisma/client'

// Usamos un singleton para no crear múltiples conexiones
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

// 🔥 OJO: es process.env (con process), no ProcessingInstruction.env
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
