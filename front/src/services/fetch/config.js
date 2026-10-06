import { apiFetch } from "../api";

// CONFIGURACIÓN DEL LOCAL ------------------------------------------

// GET -> obtener la configuración (datos del local + impresión)
export const getConfig = () => {
  return apiFetch("/config");
};

// PUT -> actualizar la configuración (solo admin)
export const updateConfig = (data) => {
  return apiFetch("/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
