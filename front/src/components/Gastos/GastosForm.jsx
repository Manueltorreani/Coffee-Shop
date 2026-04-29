import { useState } from "react";
import { useEffect } from "react";
import { getTipoGastos } from "../../services/fetch/gastos";
import { createGasto } from "../../services/fetch/gastos";

export default function GastosForm (props){
   const [nombre, setNombre] = useState("edea");
   const [precio, setPrecio] = useState("");
   const [tipoGastoId, setTipoGastoId] = useState("");
   const[tipoGastos, setTipoGastos] = useState([]);
   const [error, setError] = useState(null);


    const fetchData = async () => {
         try {
           const data = await getTipoGastos();
           setTipoGastos(data);
           console.log(data);
         } catch (error) {
           console.error("Error cargando tipos:", error);
         }
       };

   useEffect( ()=> {
    fetchData();
    },[]);

    function handleCreate(){
        const  fetchCreate = async() => {
            try {
                const res = await createGasto({
                    nombre,
                    precio: Number(precio),
                    tipoGastoId:Number(tipoGastoId)
                });
                setError(null);
                props.onCreated?.();
                console.log(res);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchCreate();
    }

    function handleModified(){
            window.alert("Modificando tipo de gasto");
    }

    return (
    <div className="w-[300px] bg-slate-100 text-black rounded-2xl shadow-md flex flex-col gap-3 py-6 px-4">
        Formulario de Gastos
        
        <div className="flex flex-col gap-2">Nombre
            <input className="p-2 border-2 border-blue-300 rounded-2xl bg-white"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
        </div>

        <div className="flex flex-col gap-2">Precio
            <input className="p-2 border-2 border-blue-300 rounded-2xl bg-white"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
            />
        </div>

        <div className="flex flex-col gap-2">Categoría
            <select className="p-2 border-2 border-blue-300 rounded-2xl bg-white"
                value={tipoGastoId}
                onChange={(e) => setTipoGastoId(e.target.value)}
            >
                <option value="">Seleccione categoría</option>
                {tipoGastos.map((tipo) =>(
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
               ) )}
            </select>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button className="bg-blue-500 text-white p-2 rounded-xl"
            onClick={handleCreate}>
            Crear
        </button>
    </div>
)

}