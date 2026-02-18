import { apiFetch } from "../api";

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - { nombre }
 */
export const createCategory = async (categoryData) => {
  return await apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

/**
 * Actualiza el estado de una categoría (Ej: de PENDING a COMPLETED)
 * @param {number} categoryId 
 * @param {string} nombre
 */
export const updateCategoryStatus = async (categoryId, nombre) => {
  return await apiFetch(`/products/cat/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre }),
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