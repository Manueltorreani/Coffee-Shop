import { apiFetch } from "../api";

// CAJA (ARQUEOS) ------------------------------------------

// GET -> caja abierta con movimientos y resumen en vivo (null si no hay caja abierta)
export const getCajaActual = () => {
  return apiFetch("/caja/actual");
};

// POST -> abrir caja con monto inicial
export const abrirCaja = (montoInicial) => {
  return apiFetch("/caja/abrir", {
    method: "POST",
    body: JSON.stringify({ montoInicial }),
  });
};

// POST -> cerrar caja con el monto contado
export const cerrarCaja = (data) => {
  return apiFetch("/caja/cerrar", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// GET -> historial de arqueos (solo admin)
export const getArqueos = () => {
  return apiFetch("/caja");
};

// MOVIMIENTOS MANUALES ------------------------------------------

// POST -> registrar ingreso/egreso manual
export const createMovimiento = (data) => {
  return apiFetch("/caja/movimientos", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// DELETE -> borrar movimiento (solo si la caja sigue abierta)
export const deleteMovimiento = (id) => {
  return apiFetch(`/caja/movimientos/${id}`, {
    method: "DELETE",
  });
};
