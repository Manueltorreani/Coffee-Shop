import { useState, useRef } from "react";
import CategoriasForm from "./CategoriasForm";
import CategoriasPanel from "./CategoriasPanel";

// Gestión de categorías: form + tabla. Va dentro de un modal (ver ProductForm).
// Hace de "página padre" igual que GastosPage: guarda el ref del panel para refrescarlo cuando el form guarda.
// props.onChange: se llama cada vez que se crea o edita una categoría (ProductForm lo usa para recargar su select)
export default function CategoriasGestion(props){
    const panelRef = useRef(null);
    const [editando, setEditando] = useState(null) // fila que se está editando (null = el form está en modo "crear")

    function handleGuardado(){
        setEditando(null);              // el form vuelve a modo "crear"
        panelRef.current?.fetchData();  // ← refresca la tabla
        props.onChange?.();             // ← avisa hacia afuera que cambiaron las categorías
    }

    return (
        <div className="flex flex-row gap-3 items-start flex-wrap">
            {/* key: al cambiar la fila en edición, React crea el form de nuevo y carga esos datos */}
            <CategoriasForm
                key={editando ? editando.id : "nueva"}
                isModified={editando !== null}
                categoria={editando}
                onCreated={handleGuardado}
                onCancel={() => setEditando(null)}
            />
            <CategoriasPanel ref={panelRef} onEdit={(fila) => setEditando(fila)}/>
        </div>
    )
}
