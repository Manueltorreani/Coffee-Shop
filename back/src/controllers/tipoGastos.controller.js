import { prisma } from '../lib/prisma.js'

// CREAR TIPO DE GASTO
export const createTipoGastos = async (req, res) => {
  try {
    let { nombre, estado } = req.body;

    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    if (typeof nombre !== "string") {
      return res.status(400).json({ error: "el nombre no es una cadena de texto" });
    }

    const nuevoTipoGasto = await prisma.tipoGasto.create({
      data: { 
        nombre: nombre.trim(),
       estado: typeof estado ==="boolean" ? estado:true
      },
    });

    return res.status(201).json(nuevoTipoGasto);
  } catch (err) {
    console.log("ERROR CODE:",err.code);
     if (err.code === "P2002") {
      return res.status(409).json({ error: "Tipo de gasto ya creado" });
    }
    console.error("error creando tipo de gasto : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};

// ACTUALIZAR TIPO DE GASTO
export const updateTipoGasto = async (req, res) => {
  try {
    const { nombre, estado } = req.body;
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const data = {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string") {
        return res.status(400).json({ error: "nombre inválido" });
      }
      data.nombre = nombre.trim();
    }

    if (estado !== undefined) {
      if (typeof estado !== "boolean") {
        return res.status(400).json({ error: "estado inválido" });
      }
      data.estado = estado;
    }

    const gastoTipoActualizado = await prisma.tipoGasto.update({
      where: { id },
      data,
    });

    return res.status(200).json(gastoTipoActualizado);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Tipo de gasto no encontrado" });
    }
    console.error("error actualizando tipo de gasto : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};

// ELIMINAR GASTO
export const deleteTipoGasto = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const gastoTipoEliminado = await prisma.tipoGasto.delete({
      where: { id },
    });

    return res.status(200).json(gastoTipoEliminado);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Tipo de gasto no encontrado" });
    }
    console.error("error eliminando tipo de gasto : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};

// OBTENER TIPOS DE GASTOS
export const getTipoGastos = async (req, res) => {
  try {
    const tipoGastos = await prisma.tipoGasto.findMany();

    return res.status(200).json(tipoGastos);
  } catch (err) {
    console.error("error obteniendo tipo de gastos : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};