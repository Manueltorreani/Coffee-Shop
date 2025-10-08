
//selector de campo de orden y direccion
//sortby : campo actual id, nombre,precio
//sortorder : direcciona ctual asc, des
//onchange : callback {sortby,sortorder}
export default function SortControls({sortBy, sortOrder, onChange}){
    return(
        <div style={{display: 'flex', gap: 8, margin: '8px 0'}}>
            <label htmlFor="">
                Ordenar por : &nbsp;
                <select 
                value={sortBy}      //valor seleccionado 
                onChange={(e) => onChange({ sortBy: e.target.value, sortOrder})}//solo cambia sortBy
                > 
                <option value="asc">asc</option>
                <option value="desc">desc</option>
                </select>
            </label>
        </div>
    )
}