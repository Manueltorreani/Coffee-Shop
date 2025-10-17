// guarda y lee el token JWT en localstorage

const TOKEN_KEY='auth_token'

//guarda token
export function saveToken(token){
    localStorage.setItem(TOKEN_KEY, token)
}

//lee token 
export function getToken(){
    return localStorage.getItem(TOKEN_KEY) || ''
}

//elimina token
export function clearToken(){
    localStorage.removeItem(TOKEN_KEY)
}

// ¿Está logueado? (boolean) → tener token no garantiza validez, pero alcanza
// para proteger rutas en el front. Luego validaremos en backend con middleware.
export function isAuthenticated(){
    return !!getToken()
}