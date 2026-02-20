import { useState, useEffect } from "react";

export default function CategoryForm({ onSubmit, initialData, onCancel }) {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (initialData) setNombre(initialData.nombre);
    else setNombre("");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nombre });
    setNombre("");
  };

  return (
    <div className="flex flex-col items-start gap-2  p-4  bg-blue-50 rounded-lg">
        {initialData ? `Actualizando categoría "${initialData.nombre}"` : `Creando nueva categoría`}
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white rounded-lg">
        <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border p-2 rounded flex-1"
            required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {initialData ? "Actualizar" : "Crear"}
        </button>
        {initialData && (
            <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
            Cancelar
            </button>
        )}
        </form>

    </div>
  );
}