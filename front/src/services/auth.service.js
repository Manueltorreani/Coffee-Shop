import { apiFetch } from './api'
import { getToken, clearToken } from '../lib/auth'

export const bootstrapAuth = async () => {
  const token = getToken()
  if (!token) return null

  try {
    const user = await apiFetch('/auth/me')
    return user
  } catch (error) {
    // Token inválido o vencido
    clearToken()
    return null
  }
}



/* =========================
   REGISTER
   POST /api/auth/register
========================= */
export const register = async ({ email, password, nombre }) => {
  try {
        const user = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, nombre }),
        })
        return user
    } catch (error) {
        return null
    }
}

/* =========================
   LOGIN
   POST /api/auth/login
========================= */
export const login = async ({ email, password }) => {

    try {
        const user = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        return user
    } catch (error) {
        return null
    }
}

/* =========================
   PERFIL ACTUAL
   GET /api/auth/me
   (Protegido)
========================= */
export const getMe = async () => {
  return apiFetch('/auth/me')
}

/* =========================
   UPDATE USER
   PUT /api/auth/:id
   (Protegido)
========================= */
export const updateUser = async (id, data) => {
  return apiFetch(`/auth/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/* =========================
   DELETE USER (Soft)
   DELETE /api/auth/:id
   (Protegido)
========================= */
export const deleteUser = async (id) => {
  return apiFetch(`/auth/${id}`, {
    method: 'DELETE',
  })
}

/* =========================
   LOGOUT
========================= */
export const logout = () => {
  localStorage.removeItem('token')
}
