//tabla simple de productos
export default function ProductTable({items, onEdit, onDelete}){
    //si no hay datos mostramos un mensaje amigable 
    if (!items || items.length === 0){
        return <p> No hay productos para mostrar</p>
    }

    return (
      /*  <table border="1" cellPadding="8" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th style ={{textAlign: 'right'}}>Precio</th>
                </tr>
            </thead>
             <tbody>
                {items.map((p)=> (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td  style ={{textAlign: 'right'}}>${p.precio}</td>
                    </tr>
                ))}
             </tbody>   
        </table>*/
         <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#eee" }}>
          <th>ID</th>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan="4" style={{ textAlign: "center" }}>No hay productos</td>
          </tr>
        ) : (
          items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.category.nombre}</td>
              <td>${p.precio}</td>
              <td>
                <button onClick={() => onEdit(p)}>✏️ Editar</button>
                <button onClick={() => onDelete(p.id)}>🗑️ Borrar</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    )
}