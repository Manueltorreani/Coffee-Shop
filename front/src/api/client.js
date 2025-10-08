// src/api/client.js

// Leemos la BASE_URL desde .env (Vite expone variables que empiezan con VITE_)
let BASE_URL = (import.meta.env.VITE_API_URL ?? '').toString().trim()
// Fallback si no viene nada
if (!BASE_URL) BASE_URL = 'http://localhost:3001'
// Normalizamos: quitamos barra final si la tuviera
if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1)

// (Opcional) Logs para depurar en la consola del navegador
console.log('[client] VITE_API_URL =', import.meta.env.VITE_API_URL)
console.log('[client] BASE_URL =', BASE_URL)

/**
 * GET helper con query params
 * @param {string} path  - ej: '/api/products'  (acepta con o sin '/')
 * @param {object} params - ej: { page:1, limit:5 }
 */
export async function get(path, params = {}) {
  // Aceptamos path con o sin barra inicial
  const safePath = path.startsWith('/') ? path : `/${path}`

  // Construimos URL de forma segura (base + path)
  let url
  try {
    url = new URL(safePath, BASE_URL)
  } catch (e) {
    console.error('URL inválida → base:', BASE_URL, ' path:', safePath)
    throw e
  }

  // Cargamos query params solo si tienen valor útil
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  // Hacemos el fetch con header JSON
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })

  // Si falla (status fuera 200–299), arrojamos un error
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`GET ${url} → ${res.status}: ${errText}`)
  }

  // Parseamos JSON y devolvemos
  return res.json()
}
