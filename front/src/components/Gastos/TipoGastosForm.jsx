import { useState } from "react";
import { useEffect } from "react";
import { createTipoGasto } from "../../services/fetch/gastos";
import ModalLoading from "../ModalLoading";

export default function TipoGastosForm (props){
   const [isOpen, setIsOpen] = useState(false);
   const [nombre, setNombre] = useState("edea");
   const [isActive, setIsActive] = useState(true);
   const [isModified, setIsModified] = useState(false);
   const [error , setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   useEffect( ()=> {
    if(props.isModified == true){
        setNombre(props.tipoGastos.nombre);
        setIsActive(props.tipoGastos.isActive);
    }
   } 
    ,[]);

    function handleCreate(){
        const fetchCreate = async () =>{
            setIsLoading(true)
            try {
                const res = await createTipoGasto({ nombre, estado: isActive });
                setError(null)
                props.onCreated?.();  // ← refresca la tabla
                console.log(res);
                
            } catch (err) {
                setError(err.message);
            }finally{
                setIsLoading(false)
            }
        }
        fetchCreate();
       
    }

    function handleModified(){
            window.alert("Modificando tipo de gasto");
    }

    return(
        <> 
        { isLoading && <ModalLoading/>}
        <div className="w-[300px] h-[300px] bg-slate-100 text-black rounded-2xl shadow-md flex flex-col gap-3 justify-between py-6 px-4.5" >
            Formulario de tipo de Gastos 
            <div className="flex flex-col gap-2">Nombre de categoria 
                <input className="p-2 border-2 border-blue-300 rounded-2xl bg-white " type="text" name="nombre" id="nombre" placeholder="luz"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}/>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                {nombre}
            </div>
             <div className="flex flex-row gap-2">Activo           
                <input className="w-5 h-5 " type="checkbox" name="activo" id="activo"
                checked={isActive}
                onChange={(e)=>setIsActive(e.target.checked)}/>
                {isActive?"true":"false"} 
            </div>
                <button className="bg-blue-500 text-white " onClick={ () => {
                if(isModified){
                    handleModified();
                }else{
                    handleCreate();
                }
            }} > 
                {
                    (isModified)?"modificando": "creando"
                }
            </button>
        </div>
        </>

    )

}