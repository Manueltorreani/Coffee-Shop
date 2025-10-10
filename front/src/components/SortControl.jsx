
//selector de campo de orden y direccion
//sortby : campo actual id, nombre,precio
//sortorder : direcciona ctual asc, des
//onchange : callback {sortby,sortorder}
export default function SortControls({ sortBy, sortOrder, onChange }) {
  return (
    <div style={{ display:'flex', gap:8, margin:'8px 0' }}>
      <label>
        Ordenar por:&nbsp;
        <select
          value={sortBy}                                  // ← campo (id|nombre|precio)
          onChange={(e)=>onChange({ sortBy: e.target.value, sortOrder })} // NO tocar sortOrder acá
        >
          <option value="id">id</option>
          <option value="nombre">nombre</option>
          <option value="precio">precio</option>
        </select>
      </label>

      <label>
        Dirección:&nbsp;
        <select
          value={sortOrder}                               // ← dirección (asc|desc)
          onChange={(e)=>onChange({ sortBy, sortOrder: e.target.value })} // NO tocar sortBy acá
        >
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>
      </label>
    </div>
  )
}