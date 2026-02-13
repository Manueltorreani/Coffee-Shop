// Key de token para localStorage
const TOKEN_KEY = 'auth_token'

// Funciones para manejar token y autenticación

// Guardar token en localStorage
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

// Obtener token del localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// Eliminar token (logout)
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return Boolean(getToken())
}
