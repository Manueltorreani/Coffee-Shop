import { X } from "lucide-react";

// Modal genérico para editar: fondo oscuro + contenido (children) + botón cerrar
// Uso: <ModalModified onClose={...}> <MiForm .../> </ModalModified>
export default function ModalModified({ children, onClose }) {
  return (
    <div className='modal-fondo'>
      <div className='modal-caja'>
          <button onClick={onClose} className="absolute top-2 right-2 btn-icono btn-icono-borrar">
            <X size={18} />
          </button>
          {children}
      </div>
    </div>
  )
}
