import { get } from "./client";

//llama a get api/products pasando filtros/paginacion orden con query params
// el backend devuelve {items, meta}
export function fetchProducts({
    nombre = '',         //string, filtro por nombre parcial
    page=1,         //numero : pagina actual 
    limit=5,        //numero : items por pagina
    sortBy = 'id',  //id / nombre/ precio
    sortOrder ='asc'//asc/des

}={}){
    //delegamos la construciion de la url y el fetch al helper 'get'
    return get ('/api/products',{ nombre, page, limit, sortBy, sortOrder})
}

//crear productos
export async function createProduct(data) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error ('error al crear producto')
      return res.json()  
}

//actualizar produco
export async function updateProduct(id,data){
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`,{
        method: 'PUT',
         headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error ('error al actualizar producto')
      return res.json()  
}

//eliminar producto
export async function deleteProduct(id,data){
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`,{
        method: 'DELETE',
       
    })
    if (!res.ok) throw new Error ('error al eliminar producto')
      return res.json()  
}