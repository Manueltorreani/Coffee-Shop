import { apiFetch } from "../api";

/**
 * Crea una nueva orden (Apertura de caja / Venta)
 * @param {Object} orderData - { userId, items: [{ productId, quantity }] }
 */
export const createOrder = async (orderData) => {
  return await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Obtiene el listado de órdenes con filtros opcionales
 * @param {Object} filters - { startDate, endDate, status }
 */
export const getOrders = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  return await apiFetch(`/orders${queryString}`, {
    method: 'GET',
  });
};

/**
 * Actualiza el estado de una orden (Ej: de PENDING a COMPLETED)
 * @param {number} orderId 
 * @param {string} status - 'COMPLETED' | 'CANCELED'
 * @param {string} paymentMethod - 'CASH', 'CARD', etc. (opcional, solo para COMPLETED)
 * @param {string} client - nombre del cliente o mesa (opcional)
 */
export const updateOrderStatus = async (orderId, data) => {
  return await apiFetch(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * Obtiene estadísticas de ingresos para un periodo
 * @param {string} startDate - Formato YYYY-MM-DD
 * @param {string} endDate - Formato YYYY-MM-DD
 */
export const getRevenueStats = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  
  return await apiFetch(`/orders/stats?${params.toString()}`, {
    method: 'GET',
  });
};

export const updateOrderItems = async (orderId, productId, action) => {
  return await apiFetch(`/orders/${orderId}/items`, {
    method: 'PUT',
    body: JSON.stringify({ productId, action }),
  });
};