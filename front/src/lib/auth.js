// Key de token para localStorage
const TOKEN_KEY = 'auth_token'

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return Boolean(getToken())
}
