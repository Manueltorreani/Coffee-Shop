//tabla simple de productos
export default function ProductTable({items, onEdit, onDelete}){
    //si no hay datos mostramos un mensaje amigable
    if (!items || items.length === 0){
        return <p className="text-texto-suave"> No hay productos para mostrar</p>
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
      <div className="tabla-card">
        <table className="w-full text-sm text-left">
        <thead className="tabla-head">
          <tr>
            <th className="tabla-celda">ID</th>
            <th className="tabla-celda">Nombre</th>
            <th className="tabla-celda">Categoria</th>
            <th className="tabla-celda text-right">Precio</th>
            <th className="tabla-celda text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
              <tr key={p.id} className="tabla-fila">
                <td className="tabla-celda text-texto-suave/70">{p.id}</td>
                <td className="tabla-celda font-medium text-dark">{p.nombre}</td>
                <td className="tabla-celda">
                  {/* badge de categoría con los colores de la marca */}
                  <span className="badge badge-marca">
                    {p.category?.nombre || 'Sin categoría'}
                  </span>
                </td>
                <td className="tabla-celda text-right font-medium">${p.precio}</td>
                <td className="tabla-celda">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onEdit(p)} className="text-primary hover:text-primary-hover font-medium">✏️ Editar</button>
                    <button onClick={() => onDelete(p.id)} className="text-error hover:underline font-medium">🗑️ Borrar</button>
                  </div>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
}
