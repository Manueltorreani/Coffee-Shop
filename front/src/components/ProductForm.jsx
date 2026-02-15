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
export default function ProductForm ({initialData, onSave, onCancel}){

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
            setCategoria(initialData.categoriaId || 1)
        }
    }, [initialData])

    useEffect(() => {
      const loadCategories = async () => {
        try {
          const cats = await fetchCategories()
          setCategories(cats)
        } catch (err) {
          console.error('Error al cargar categorías:', err)
        }
      }
      loadCategories()
    }, [])


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
        <form onSubmit={handleSubmit} className=" min-w-[400px] border p-4 rounded flex flex-col gap-4 items-start">
        <label className="flex flex-row justify-between w-full">
          Nombre:
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Latte"
          />
        </label>

        <label className="flex flex-row justify-between w-full">
          Precio:
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej: 4500"
          />
        </label>
        
        <label className="flex flex-row justify-between w-full">
          Categoria:
          <select name="categoryId" id="categoryId" value={categoria} onChange={(e) => setCategoria(e.target.value)}>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-row justify-between w-full" style={{ display: 'flex', gap: 8 }}>
          <button className="bg-blue-500 text-white hover:bg-blue-700" type="submit">Guardar</button>
          <button className="bg-blue-500 text-white hover:bg-blue-700" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>

      </div>
    )
}