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
      <h1 className="text-2xl font-bold">Gestión de Categorías</h1>

      {/* Formulario */}
      <CategoryForm 
        onSubmit={handleCreateOrUpdate} 
        initialData={editingCategory} 
        onCancel={() => setEditingCategory(null)} 
      />

      {/* Buscador */}
      <SearchBar onSearch={(text) => setFilterText(text)} />

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Cargando...</p>}

      {/* Tabla de Resultados */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="p-4 font-medium">{cat.nombre}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCategories.length === 0 && !loading && (
          <p className="p-4 text-center text-gray-500">No se encontraron categorías.</p>
        )}
      </div>
    </div>
  );
}