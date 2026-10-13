import { useState } from "react";
import { useEffect } from "react";
import { getTipoGastos } from "../../services/fetch/gastos";
import { createGasto, updateGasto } from "../../services/fetch/gastos";
import { getPaymentMethods } from "../../services/fetch/paymentMethods";
import ModalLoading from "../ModalLoading";

// Sirve para CREAR y para EDITAR (mismo patrón que TipoGastosForm):
// - crear: <GastosForm onCreated={...}/>
// - editar: <GastosForm isModified={true} gasto={fila} onCreated={...}/>
export default function GastosForm (props){
   const [nombre, setNombre] = useState("");
   const [precio, setPrecio] = useState("");
   const [tipoGastoId, setTipoGastoId] = useState("");
   const [paymentMethod, setPaymentMethod] = useState("");
   const[tipoGastos, setTipoGastos] = useState([]);
   const [paymentMethods, setPaymentMethods] = useState([]);
   const [isModified, setIsModified] = useState(false);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(false)    

    const fetchData = async () => {
        setIsLoading(true)
         try {
           const data = await getTipoGastos();
           // solo tipos activos (o el que ya tiene el gasto que estamos editando)
           setTipoGastos(data.filter((tipo) => tipo.estado || tipo.id === props.gasto?.tipoGastoId));
           const metodos = await getPaymentMethods();
           setPaymentMethods(metodos);
         } catch (error) {
           console.error("Error cargando tipos:", error);
         }finally{
            setIsLoading(false)
         }
       };

   useEffect( ()=> {
    fetchData();
    // si viene en modo edición, cargamos los datos de la fila en el form
    if(props.isModified == true){
        setIsModified(true);
        setNombre(props.gasto.nombre);
        setPrecio(props.gasto.precio);
        setTipoGastoId(props.gasto.tipoGastoId ?? "");
        setPaymentMethod(props.gasto.paymentMethod ?? "");
    }
    },[]);

    function handleCreate(){
        const  fetchCreate = async() => {
            setIsLoading(true)
            try {
                const res = await createGasto({
                    nombre,
                    precio: Number(precio),
                    tipoGastoId:Number(tipoGastoId),
                    paymentMethod
                });
                setError(null);
                setNombre(""); // limpiamos el form para cargar otro
                setPrecio("");
                props.onCreated?.();
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
        const fetchUpdate = async () => {
            setIsLoading(true)
            try {
                const res = await updateGasto(props.gasto.id, {
                    nombre,
                    precio: Number(precio),
                    tipoGastoId: Number(tipoGastoId),
                    paymentMethod
                });
                setError(null);
                props.onCreated?.(); // refresca la tabla y cierra el modal
                console.log(res);
            } catch (err) {
                setError(err.message);
            }finally{
               setIsLoading(false)
            }
        }
        fetchUpdate();
    }

    return (
    <>    
     { isLoading && <ModalLoading/>}
    <div className="form-card">
        <h3 className="form-titulo">{isModified ? "Editar gasto" : "Formulario de Gastos"}</h3>
        
        <div className="form-campo">Nombre
            <input className="form-input"
                type="text"
                placeholder="edea"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
        </div>

        <div className="form-campo">Precio
            <input className="form-input"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
            />
        </div>

        <div className="form-campo">Categoría
            <select className="form-input"
                value={tipoGastoId}
                onChange={(e) => setTipoGastoId(e.target.value)}
            >
                <option value="">Seleccione categoría</option>
                {tipoGastos.map((tipo) =>(
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
               ) )}
            </select>
        </div>

        <div className="form-campo">Método de pago
            <select className="form-input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
            >
                <option value="">No definido</option>
                {paymentMethods.map((metodo) =>(
                    <option key={metodo.id} value={metodo.nombre}>{metodo.nombre}</option>
               ) )}
            </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primario"
            onClick={() => {
                if(isModified){
                    handleModified();
                }else{
                    handleCreate();
                }
            }}>
            {isModified ? "Guardar cambios" : "Crear"}
        </button>
    </div>
    </>
)

}
