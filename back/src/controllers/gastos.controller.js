import { prisma } from "@prisma/client";

// CREAR GASTO
export const createGastos = async (req, res) => {
  try {
    let { nombre, tipoGastoId } = req.body;

    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    if (typeof nombre !== "string") {
      return res.status(400).json({ error: "el nombre no es una cadena de texto" });
    }

    const tipoId = Number(tipoGastoId);
    if (Number.isNaN(tipoId)) {
      return res.status(400).json({ error: "tipoGastoId inválido" });
    }

    const nuevoGasto = await prisma.gastos.create({
      data: {
        nombre: nombre.trim(),
        tipoGastoId: tipoId,
      },
    });

    return res.status(201).json(nuevoGasto);
  } catch (err) {
    console.error("error creando gasto : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};

// ACTUALIZAR GASTO
export const updateGasto = async (req, res) => {
  try {
    const { nombre, estado, tipoGastoId } = req.body;
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

    if (tipoGastoId !== undefined) {
      const tipoId = Number(tipoGastoId);
      if (Number.isNaN(tipoId)) {
        return res.status(400).json({ error: "tipoGastoId inválido" });
      }
      data.tipoGastoId = tipoId;
    }

    const gastoActualizado = await prisma.gastos.update({
      where: { id },
      data,
    });

    return res.status(200).json(gastoActualizado);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }
    console.error("error actualizando gasto : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};

// ELIMINAR GASTO
export const deleteGasto = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const gastoEliminado = await prisma.gastos.delete({
      where: { id },
    });

    return res.status(200).json(gastoEliminado);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }
    console.error("error eliminando gasto : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};

// OBTENER GASTOS
export const getGastos = async (req, res) => {
  try {
    const gastos = await prisma.gastos.findMany({
      include: {
        tipoGastos: {
          select: { nombre: true },
        },
      },
    });

    return res.status(200).json(gastos);
  } catch (err) {
    console.error("error obteniendo gastos : ", err);
    res.status(500).json({ error: "error interno del servidor" });
  }
};