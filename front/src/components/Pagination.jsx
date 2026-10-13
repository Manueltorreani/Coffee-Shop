//controles de paginacion anterior /siguiente
//page : numero de pagina actual
//total pages: cantidad totl de paginas
// onPageChange: callback con la nueva pagina
export default function Pagination({ page, totalPages, onPageChange}){
    //calculamos si los botones deben estar deshabilitados
    const prevDisabled = page <=1
    const nextDisabled = page >= totalPages
    return (
        <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 12}}>
            <button className="btn-secundario py-1" disabled={prevDisabled} onClick={() => onPageChange(page-1)}>
               anterior
            </button>
            <span className="text-texto-suave">
                Pagina {page} de {totalPages}
            </span>
            <button className="btn-secundario py-1" disabled={nextDisabled} onClick={() => onPageChange(page + 1)}>
                siguiente
            </button>
        </div>
    )
}