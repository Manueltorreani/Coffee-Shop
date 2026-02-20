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
      <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col justify-center items-center">
        <table className="w-full text-left py-2 px-4 justify-center"  border="1"  style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead className="h-12">
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
                  <button onClick={() => onEdit(p)}><span className="text-blue-600 hover:underline">✏️ Editar</span></button>
                  <button onClick={() => onDelete(p.id)}><span className="text-red-600 hover:underline">🗑️ Borrar</span></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    )
}