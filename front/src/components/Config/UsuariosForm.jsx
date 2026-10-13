import { useState } from "react";
import { useEffect } from "react";
import { createUsuario, updateUsuario } from "../../services/fetch/usuarios";
import ModalLoading from "../ModalLoading";

// Sirve para CREAR y para EDITAR:
// - crear: <UsuariosForm onCreated={...}/>
// - editar: <UsuariosForm isModified={true} usuario={fila} onCreated={...}/>
// Al editar, la contraseña es opcional: si queda vacía no se cambia.
export default function UsuariosForm (props){
   const [nombre, setNombre] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isAdmin, setIsAdmin] = useState(false);
   const [isModified, setIsModified] = useState(false);
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   // si viene en modo edición, cargamos los datos de la fila en el form
   useEffect( ()=> {
    if(props.isModified == true){
        setIsModified(true);
        setNombre(props.usuario.nombre || "");
        setEmail(props.usuario.email);
        setIsAdmin(props.usuario.isAdmin);
    }
   },[]);

    function handleCreate(){
        const fetchCreate = async () =>{
            setIsLoading(true)
            try {
                await createUsuario({ nombre, email, password, isAdmin });
                setError(null)
                setNombre(""); setEmail(""); setPassword(""); setIsAdmin(false);
                props.onCreated?.();  // ← refresca la tabla
            } catch (err) {
                setError(err.message); // ej: 409 email repetido
            }finally{
                setIsLoading(false)
            }
        }
        fetchCreate();
    }

    function handleModified(){
        const fetchUpdate = async () =>{
            setIsLoading(true)
            try {
                const data = { nombre, email, isAdmin };
                if (password) data.password = password; // solo si escribió una nueva
                await updateUsuario(props.usuario.id, data);
                setError(null)
                props.onCreated?.();  // ← refresca la tabla y cierra el modal
            } catch (err) {
                setError(err.message);
            }finally{
                setIsLoading(false)
            }
        }
        fetchUpdate();
    }

    return(
        <>
        { isLoading && <ModalLoading/>}
        <div className="form-card">
            <h3 className="form-titulo">{isModified ? "Editar usuario" : "Nuevo usuario"}</h3>
            <div className="form-campo">Nombre
                <input className="form-input" type="text" placeholder="Juan"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}/>
            </div>
            <div className="form-campo">Email
                <input className="form-input" type="email" placeholder="juan@cafe.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}/>
            </div>
            <div className="form-campo">{isModified ? "Nueva contraseña (opcional)" : "Contraseña"}
                <input className="form-input" type="password" placeholder="mínimo 6 caracteres"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}/>
            </div>
            <div className="flex flex-row gap-2 items-center text-sm font-medium text-texto-suave">Administrador
                <input className="w-5 h-5" type="checkbox"
                checked={isAdmin}
                onChange={(e)=>setIsAdmin(e.target.checked)}/>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primario" onClick={ () => {
                if(isModified){
                    handleModified();
                }else{
                    handleCreate();
                }
            }} >
                {(isModified)?"Guardar cambios": "Crear"}
            </button>
        </div>
        </>
    )
}
