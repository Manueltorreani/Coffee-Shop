import { X } from "lucide-react";

// Modal genérico: fondo oscuro + contenido (children) + botón cerrar
// Uso: <ModalModified onClose={...}> <MiForm .../> </ModalModified>
// titulo es opcional: <ModalModified titulo="Categorías" onClose={...}> ... </ModalModified>
export default function ModalModified({ children, onClose, titulo }) {
  return (
    <div className='modal-fondo'>
      <div className='modal-caja'>
          <button onClick={onClose} className="absolute top-2 right-2 btn-icono btn-icono-borrar">
            <X size={18} />
          </button>
          {titulo && <h2 className="titulo-pagina text-left mb-3 pr-8">{titulo}</h2>}
          {children}
      </div>
    </div>
  )
}
