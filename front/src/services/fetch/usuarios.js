import { apiFetch } from "../api";

// USUARIOS (gestión desde Configuración, solo admin) ----------------

// GET -> listar usuarios
export const getUsuarios = () => {
  return apiFetch("/auth/users");
};

// POST -> crear usuario (empleado o admin)
export const createUsuario = (data) => {
  return apiFetch("/auth/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// PUT -> actualizar usuario (nombre, email, password, isAdmin, activo)
export const updateUsuario = (id, data) => {
  return apiFetch(`/auth/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
