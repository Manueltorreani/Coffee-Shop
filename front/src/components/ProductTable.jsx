//tabla simple de productos
export default function ProductTable({items, onEdit, onDelete}){
    //si no hay datos mostramos un mensaje amigable
    if (!items || items.length === 0){
        return <p className="text-slate-500"> No hay productos para mostrar</p>
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
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3 text-right">Precio</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                <td className="px-4 py-3">
                  {/* badge de categoría con los colores de la marca */}
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-surf-50 text-surf-700">
                    {p.category?.nombre || 'Sin categoría'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">${p.precio}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onEdit(p)} className="text-surf-600 hover:text-surf-800 font-medium">✏️ Editar</button>
                    <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium">🗑️ Borrar</button>
                  </div>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
}
