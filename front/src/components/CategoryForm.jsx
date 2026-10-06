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
    <div className="flex flex-col items-start gap-2 p-4 bg-surf-50 border border-surf-100 rounded-2xl font-semibold text-surf-800">
        {initialData ? `Actualizando categoría "${initialData.nombre}"` : `Creando nueva categoría`}
        <form onSubmit={handleSubmit} className="flex gap-2 p-3 bg-white rounded-xl border border-slate-200">
        <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="form-input flex-1 font-normal"
            required
        />
        <button type="submit" className="btn-primario">
            {initialData ? "Actualizar" : "Crear"}
        </button>
        {initialData && (
            <button type="button" onClick={onCancel} className="btn-secundario">
            Cancelar
            </button>
        )}
        </form>

    </div>
  );
}