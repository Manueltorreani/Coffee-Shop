import { apiFetch } from "../api";

// GASTOS ------------------------------------------

// GET -> obtener todos los gastos
export const getGastos = () => {
  return apiFetch("/gastos");
};

// POST -> crear gasto
export const createGasto = (data) => {
  return apiFetch("/gastos", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// PUT -> actualizar gasto
export const updateGasto = (id, data) => {
  return apiFetch(`/gastos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// DELETE -> eliminar gasto
export const deleteGasto = (id) => {
  return apiFetch(`/gastos/${id}`, {
    method: "DELETE",
  });
};



// TIPOS DE GASTO ------------------------------------------

// GET -> obtener tipos de gasto
export const getTipoGastos = () => {
  return apiFetch("/gastos/tipo");
};

// POST -> crear tipo de gasto
export const createTipoGasto = (data) => {
  return apiFetch("/gastos/tipo", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// PUT -> actualizar tipo de gasto
export const updateTipoGasto = (id, data) => {
  return apiFetch(`/gastos/tipo/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// DELETE -> eliminar tipo de gasto
export const deleteTipoGasto = (id) => {
  return apiFetch(`/gastos/tipo/${id}`, {
    method: "DELETE",
  });
};