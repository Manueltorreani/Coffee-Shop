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