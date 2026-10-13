import { use } from "react";
import { useState, useEffect } from "react";
import { fetchCategories } from "../api/products";
/**
 * Componente formulario reutilizable para crear o editar productos.

  Props:
 * - initialData: { nombre, precio } datos iniciales si estamos editando
 * - onSave: callback que se dispara al guardar (recibe {nombre, precio})
 * - onCancel: callback para cancelar
 */
// - onAbrirCategorias: callback para abrir el modal de categorías (el modal vive en ProductsPage)
// - categoriasVersion: número que la página aumenta cuando cambian las categorías -> recargamos el select
export default function ProductForm ({initialData, onSave, onCancel, onAbrirCategorias, categoriasVersion}){

    //estados locales controlados por react
    const[nombre, setNombre] = useState('')
    const[categoria, setCategoria] = useState(1)
    const[precio, setPrecio] = useState('')
    const [categories, setCategories] = useState([])

    //si iintialData cambia hay que rellenar el formulario
    useEffect (() =>{
        if(initialData){
            setNombre(initialData.nombre || '')
            setPrecio(initialData.precio || '')
            setCategoria(initialData.categoryId || 1)
        }
    }, [initialData])

    const loadCategories = async () => {
      try {
        const cats = await fetchCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Error al cargar categorías:', err)
      }
    }

    // corre al montar y cada vez que cambia categoriasVersion (o sea, cuando se tocaron categorías en el modal):
    // así el select se actualiza sin recargar la página
    useEffect(() => {
      loadCategories()
    }, [categoriasVersion])

    // en el select solo van las activas; la del producto que se edita se muestra aunque esté inactiva
    const categoriasVisibles = categories.filter((cat) => cat.estado || cat.id === initialData?.categoryId)

    // si la categoría elegida no está entre las visibles (ej: se desactivó), elegimos la primera
    useEffect(() => {
      if (categoriasVisibles.length > 0 && !categoriasVisibles.some((cat) => cat.id === Number(categoria))) {
        setCategoria(categoriasVisibles[0].id)
      }
    }, [categories, categoria])



    //manejamos el envio del formulario
    const handleSubmit = (e) => {
        e.preventDefault() //evitamos recarga
        //validaciones
        if(!nombre || precio === '' || !categoria){
            alert("completa todos los campos")
            return
        }
        //lamamos al callback del padre
        onSave({nombre, precio: Number(precio), categoryId: Number(categoria)})
    }

    return(
      <div className="flex w-full min-w-[400px] justify-center">
        <form onSubmit={handleSubmit} className="form-card min-w-[400px]">
        <label className="form-campo w-full">
          Nombre:
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Latte"
            className="form-input"
          />
        </label>

        <label className="form-campo w-full">
          Precio:
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej: 4500"
            className="form-input"
          />
        </label>
        
        <label className="form-campo w-full">
          Categoria:
          <div className="flex flex-row gap-2">
            <select className="form-input flex-1" name="categoryId" id="categoryId" value={categoria} onChange={(e) => setCategoria(e.target.value)}>

              {categoriasVisibles.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {/* type="button": si no, al estar dentro del <form> enviaría el producto */}
            <button className="btn-secundario" type="button" onClick={onAbrirCategorias}>Categorías</button>
          </div>
        </label>

        <div className="flex flex-row justify-between w-full" style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primario" type="submit">Guardar</button>
          <button className="btn-secundario" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>

      </div>
    )
}