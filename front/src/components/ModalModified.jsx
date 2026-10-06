import { X } from "lucide-react";

// Modal genérico para editar: fondo oscuro + contenido (children) + botón cerrar
// Uso: <ModalModified onClose={...}> <MiForm .../> </ModalModified>
export default function ModalModified({ children, onClose }) {
  return (
    <div className='fixed z-90 inset-0 bg-black/50 flex justify-center items-center'>
      <div className='relative bg-white p-4 rounded-lg shadow'>
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
            <X size={18} />
          </button>
          {children}
      </div>
    </div>
  )
}
