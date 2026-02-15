import { useState, useEffect } from "react"

// Componente controlado de búsqueda.
// - defaultValue: valor inicial del input (string)
// - onSearch: función que se llama al enviar (recibe el texto)
export default function SearchBar({ defaultValue = "", onSearch }) {
  // Estado interno que maneja el value del input
  // Lo inicializamos con defaultValue
  const [text, setText] = useState(defaultValue)

  // Si defaultValue cambia desde fuera, sincronizamos el estado interno
  useEffect(() => {
    setText(defaultValue ?? "")
  }, [defaultValue])

  // Enviar búsqueda (evitamos que el form recargue la página)
  const handleSubmit = (e) => {
    e.preventDefault()
    // Llamamos al callback del padre con el texto actual
    onSearch?.(text)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <input
        value={text}                            // valor controlado (string)
        onChange={(e) => setText(e.target.value)} // actualiza el estado con cada tecla
        placeholder="Buscar por nombre..."
        style={{ padding: 8, flex: 1 }}
        className="border-2 border-blue-500 rounded-full"
      />
      <button type="submit" style={{ padding: "8px 12px" }} className="bg-blue-500 text-white hover:bg-blue-700">
        Buscar
      </button>
    </form>
  )
}
