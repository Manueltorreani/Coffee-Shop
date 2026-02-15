const BASE_URL_AUTH = 'http://localhost:3001/api/auth';
const BASE_URL_ORDERS = 'http://localhost:3001/api/orders';
import { getToken } from "../../lib/auth";
//TODO REVISAR
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// 1. Obtener estadísticas de ventas (Ingresos totales)
export const getAdminStatsFetch = async () => {
    const response = await fetch(`${BASE_URL_ORDERS}/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener estadísticas');
    return data;
};

// 2. Marcar orden como completada
export const completeOrderFetch = async (orderId) => {
    const response = await fetch(`${BASE_URL_ORDERS}/${orderId}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al completar orden');
    return data;
};

// 3. Obtener lista de todos los usuarios (Para el dashboard de admin)
// Nota: Deberías crear este endpoint en el back si quieres listar a todos
export const getAllUsersFetch = async () => {
    const response = await fetch(`${BASE_URL_AUTH}/all`, { 
        method: 'GET',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al listar usuarios');
    return data;
};