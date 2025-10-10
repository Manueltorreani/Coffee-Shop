import { useEffect, useState } from "react"; // hooks de reacts
import { fetchProducts } from "../api/products"; //funcion que llama a get /api/products
import SearchBar from "../components/SearchBar";//barra de busqueda
import SortControls from "../components/SortControl";
import ProductTable from "../components/ProductTable";
import Pagination from "../components/Pagination";

export default function ProductsPage(){
    //estado de filtros y orden
    const [nombre, setNombre] = useState('') //texto de busqueda
    const [page, setPage]= useState(1)//pagina actual 
    const [limit, setLimit]= useState(5) // tamaño por pagina , items por pagina
    const [sortBy, setSortBy] = useState('id') //campo de orden
    const [sortOrder, setSortOrder] = useState('asc')

    //estado de datos y UI
    const [items, setItems]= useState([]) //array de productos de la pagina
    const [meta, setMeta] = useState({
        total:0,
        page:1,
        limit:5,
        totalPages:1
    }) //metadatos que manda el backend
    const[loading, setLoading] = useState(false) // spinner, indicador de carga
    const[error, setError] = useState('') //mensaje de error

    //funcion que llama al backend
    async function load(){
        try{
            setLoading(true) //mostramos cargando
            setError ('') // limpiamos error previo si lo habia

            //llamamos a la api pasando los filtros/paginacion/orden actuales
            const data = await fetchProducts({nombre, page, limit, sortBy, sortOrder})

            //el backend devuelve {items, meta} guardamos en estado
            setItems(data.items || [])
            setMeta(
                data.meta || { total: 0, page: 1, limit, totalPages:1}
            )
        } catch (err){
            console.error(err) // log en consola para debbuging
            setError('no se pudo cargar el listado. Ver consola')
        } finally {
            setLoading(false) // apagamos "cargando ... "  pase lo que pase 
        }
    }

     //efecto : recargar cuando cambie algo relevante 
    //cada vez que cambie nombre, page, limit, sortby o sortorder recargamos
         useEffect(() => {
            load()
         },[nombre, page, limit, sortBy, sortOrder])

    //handlers de ui , funciones que pasan a los hijos
    const handleSearch = ( text) => { setPage(1); setNombre(text)}

    //cuando cambia el "ordenar por" o la "direccion" actualizamos estados
    const handleSortChange = ({ sortBy, sortOrder}) => {
        setSortBy(sortBy)
        setSortOrder(sortOrder)
        setPage(1) 
    }

    //cuando el usuario pulsa anterior/siguiente
    const handlePageChange = (p) => setPage(p)

     return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 12px' }}>
      <h1>Productos</h1>

      {/* Barra de búsqueda controlada (onSearch dispara setNombre) */}
      <SearchBar defaultValue={nombre} onSearch={handleSearch} />

      {/* Controles de orden y tamaño de página */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0 16px' }}>
        <SortControls sortBy={sortBy} sortOrder={sortOrder} onChange={handleSortChange} />
        <label>
          Por página:&nbsp;
          {/* Al cambiar el limit, volvemos a page 1 para no quedar fuera de rango */}
          <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </label>
      </div>

      {/* Estados de carga y error */}
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Si no estamos cargando ni en error, mostramos tabla y paginación */}
      {!loading && !error && (
        <>
          <ProductTable items={items} />
          <Pagination page={page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          <p style={{ marginTop: 8, color: '#555' }}>
            Total: {meta.total} &middot; Página {page}/{meta.totalPages}
          </p>
        </>
      )}
    </div>
  )

}

   