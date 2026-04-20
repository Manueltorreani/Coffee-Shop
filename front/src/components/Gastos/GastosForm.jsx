import { useState } from "react";
import { useEffect } from "react";

export default function GastosForm (props){
   const [isOpen, setIsOpen] = useState(false);
   const [nombre, setNombre] = useState("edea");
   const [categoria, setCategoria] = useState("");
   const[categoriasCargadas, setCategoriasCargadas] = useState(["valor x defecto"]);
   const [isActive, setIsActive] = useState(true);
   const [isModified, setIsModified] = useState(false);

   useEffect( ()=> {
    if(props.isModified == true){
        setNombre(props.tipoGastos.nombre);
        setIsActive(props.tipoGastos.isActive);
    }
   } 
    ,[]);

    function handleCreate(){
        window.alert("Creando tipo de gasto");
    }

    function handleModified(){
            window.alert("Modificando tipo de gasto");
    }

    return(
        <> 
        <div className="w-[300px] h-[300px] bg-slate-100 text-black rounded-2xl shadow-md flex flex-col gap-3 justify-between py-6 px-4.5" >
            Formulario de Gastos 
            <div className="flex flex-col gap-2">Categoria
                <select className="p-2 border-2 border-blue-300 rounded-2xl bg-white " type="text" name="nombre" id="nombre" placeholder="luz"
                value={categoria}
                onChange={(e)=>setCategoria(e.target.value)}
                > <option value="">seleccione la categoria</option>
                {categoriasCargadas.map((cat,index) =>(
                    <option key={index} value={cat}> {cat} </option>
                ))}
                </select>
                {categoria}
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