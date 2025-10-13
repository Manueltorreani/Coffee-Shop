import { useState, useEffect } from "react";
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
    const[precio, setPrecio] = useState('')

    //si iintialData cambia hay que rellenar el formulario
    useEffect (() =>{
        if(initialData){
            setNombre(initialData.nombre || '')
            setPrecio(initialData.precio || '')
        }
    }, [initialData])

    //manejamos el envio del formulario
    const handleSubmit = (e) => {
        e.preventDefault() //evitamos recarga
        //validaciones
        if(!nombre || precio === ''){
            alert("completa ambos campos")
            return
        }
        //lamamos al callback del padre
        onSave({nombre,precio: Number(precio)})
    }

    return(
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label>
        Nombre:
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Latte"
        />
      </label>

      <label>
        Precio:
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 4500"
        />
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
    )
}