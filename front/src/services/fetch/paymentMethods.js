import { apiFetch } from "../api";

export const getPaymentMethods = async () => {
  return await apiFetch('/orders/payment-methods', {
    method: 'GET',
  });
};

export const createPaymentMethod = async (nombre) => {
  return await apiFetch('/orders/payment-methods', {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  });
};

export const updatePaymentMethod = async (id, nombre) => {
  return await apiFetch(`/orders/payment-methods/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre }),
  });
};

export const deletePaymentMethod = async (id) => {
  return await apiFetch(`/orders/payment-methods/${id}`, {
    method: 'DELETE',
  });
};
