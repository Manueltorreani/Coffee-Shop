import { useEffect, useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "../services/fetch/category";
import { fetchCategories } from "../api/products";
import SearchBar from "../components/SearchBar";
import CategoryForm from "../components/CategoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

    // Cargar datos
    const loadCategories = async () => {
        try {
        setLoading(true);
        const data = await fetchCategories();
        // Ordenar alfabéticamente
        setCategories(data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        } catch (err) {
        setError("Error al cargar categorías: " + err.message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Handlers CRUD
    const handleCreateOrUpdate = async (formData) => {
    try {
        if (editingCategory) {
        // Pasamos el ID y el objeto formData completo
        await updateCategory(editingCategory.id, formData);
        } else {
        // Pasamos el objeto formData completo
        await createCategory(formData);
        }
        setEditingCategory(null);
        loadCategories();
    } catch (err) {
        alert("Error al guardar: " + err.message);
    }
    };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta categoría? Esto podría fallar si tiene productos asociados.")) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      console.log(err.message);
    }finally {
        loadCategories();
    }
  };

  // Filtrado lógico (Frontend)
  const filteredCategories = categories.filter((c) =>
    c.nombre.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="titulo-pagina">Gestión de Categorías</h1>

      {/* Formulario */}
      <CategoryForm 
        onSubmit={handleCreateOrUpdate} 
        initialData={editingCategory} 
        onCancel={() => setEditingCategory(null)} 
      />

      {/* Buscador */}
      <SearchBar onSearch={(text) => setFilterText(text)} />

      {error && <p className="text-error">{error}</p>}
      {loading && <p>Cargando...</p>}

      {/* Tabla de Resultados */}
      <div className="tabla-card">
        <table className="w-full text-left">
          <thead className="tabla-head">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat.id} className="tabla-fila">
                <td className="p-4 font-medium">{cat.nombre}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="text-primary hover:text-primary-hover font-medium"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-error hover:underline"
                  >
                    🗑️ Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCategories.length === 0 && !loading && (
          <p className="p-4 text-center text-texto-suave">No se encontraron categorías.</p>
        )}
      </div>
    </div>
  );
}