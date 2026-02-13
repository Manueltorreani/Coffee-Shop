const BASE_URL = 'http://localhost:3001/api/auth';

//TODO REVISAR

/**
 * Función auxiliar para obtener el token del localStorage
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// --- PETICIONES ---

// 1. Login
export const loginFetch = async (credentials) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el login');
    
    // Guardamos el token para futuras peticiones
    localStorage.setItem('token', data.token);
    return data;
};

// 2. Registro
export const registerFetch = async (userData) => {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el registro');
    
    localStorage.setItem('token', data.token);
    return data;
};

// 3. Obtener perfil actual (Me)
export const getMeFetch = async () => {
    const response = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener perfil');
    return data;
};

// 4. Actualizar usuario
export const updateUserFetch = async (id, updateData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar');
    return data;
};

// 5. Borrado Lógico (Delete)
export const deleteUserFetch = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al eliminar');
    return data;
};

// Extra: Logout
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};