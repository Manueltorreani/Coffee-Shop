//tabla simple de productos
export default function ProductTable({items}){
    //si no hay datos mostramos un mensaje amigable 
    if (!items || items.length === 0){
        return <p> No hay productos para mostrar</p>
    }

    return (
        <table border="1" cellPadding="8" style={{width: '100%', borderCollapse: 'collapse'}}>
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
        </table>
    )
}