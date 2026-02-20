import { apiFetch } from "../api";

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - { nombre }
 */
export const createCategory = async (categoryData) => {
  return await apiFetch('/products/cat', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

/**
 * Actualiza el estado de una categoría (Ej: de PENDING a COMPLETED)
 * @param {number} categoryId 
 * @param {string} nombre
 */
export const updateCategory = async (id, categoryData) => {
  return await apiFetch(`/products/cat/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};


/**
 * Elimina una categoría
 * @param {number} categoryId 
 */
export const deleteCategory = async (categoryId) => {
  return await apiFetch(`/products/cat/${categoryId}`, {
    method: 'DELETE',
  });
};