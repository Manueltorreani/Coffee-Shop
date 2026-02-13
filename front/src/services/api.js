const API_URL = 'http://localhost:3001/api'

// Helper genérico
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  }

  const res = await fetch(`${API_URL}${endpoint}`, config)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición')
  }

  return data
}
