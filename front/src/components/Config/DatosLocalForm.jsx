import { useState } from "react";
import { useEffect } from "react";
import { getConfig, updateConfig } from "../../services/fetch/config";
import ModalLoading from "../ModalLoading";
import Ticket from "../Ticket";

// Datos del local + configuración de impresión.
// No es CRUD: hay una sola configuración, así que el form siempre EDITA (no crea).
// mode="local" muestra los datos del local, mode="impresion" muestra las opciones del ticket.
export default function DatosLocalForm ({ mode }){
   const [config, setConfig] = useState(null); // el objeto completo que viene del back
   const [error , setError] = useState(null)
   const [mensaje, setMensaje] = useState(null) // "Guardado ✓"
   const [isLoading, setIsLoading] = useState(false)
   const [imprimiendo, setImprimiendo] = useState(false) // ticket de prueba

   const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getConfig();
        setConfig(data);
      } catch (err) {
        console.error("Error cargando configuración:", err);
      }finally{
        setIsLoading(false)
      }
   };

   useEffect( ()=> {
    fetchData();
   },[]);

   // un solo handler para todos los inputs: usa el "name" del input como clave
   function handleChange(e){
     const { name, value, type, checked } = e.target;
     setConfig({ ...config, [name]: type === "checkbox" ? checked : value });
     setMensaje(null);
   }

   function handleSave(){
        const fetchUpdate = async () =>{
            setIsLoading(true)
            try {
                const data = await updateConfig({
                  nombre: config.nombre,
                  direccion: config.direccion,
                  telefono: config.telefono,
                  cuit: config.cuit,
                  mensajeTicket: config.mensajeTicket,
                  anchoTicket: Number(config.anchoTicket),
                  imprimirAlCobrar: config.imprimirAlCobrar,
                });
                setConfig(data);
                setError(null)
                setMensaje("Guardado ✓")
            } catch (err) {
                setError(err.message);
            }finally{
                setIsLoading(false)
            }
        }
        fetchUpdate();
   }

   if (!config) return isLoading ? <ModalLoading/> : null;

   // orden de ejemplo para el ticket de prueba
   const ordenPrueba = {
     id: 0, client: "Mesa 1", paymentMethod: "Efectivo", total: 3500, createdAt: new Date().toISOString(),
     items: [ { id: 1, nombre: "Café con leche", cantidad: 2, precio: 1200 }, { id: 2, nombre: "Medialuna", cantidad: 2, precio: 550 } ]
   };

   return(
        <>
        { isLoading && <ModalLoading/>}
        { imprimiendo && <Ticket orden={ordenPrueba} config={config} tipo="ticket" onAfterPrint={() => setImprimiendo(false)}/> }
        <div className="form-card w-[340px]">
          {mode === "local" ? (
            <>
              <h3 className="form-titulo">Datos del local</h3>
              <div className="form-campo">Nombre
                  <input className="form-input" type="text" name="nombre"
                  value={config.nombre || ""} onChange={handleChange}/>
              </div>
              <div className="form-campo">Dirección
                  <input className="form-input" type="text" name="direccion"
                  value={config.direccion || ""} onChange={handleChange}/>
              </div>
              <div className="form-campo">Teléfono
                  <input className="form-input" type="text" name="telefono"
                  value={config.telefono || ""} onChange={handleChange}/>
              </div>
              <div className="form-campo">CUIT
                  <input className="form-input" type="text" name="cuit"
                  value={config.cuit || ""} onChange={handleChange}/>
              </div>
              <div className="form-campo">Mensaje al pie del ticket
                  <input className="form-input" type="text" name="mensajeTicket" placeholder="¡Gracias por su visita!"
                  value={config.mensajeTicket || ""} onChange={handleChange}/>
              </div>
            </>
          ) : (
            <>
              <h3 className="form-titulo">Impresión de tickets y comandas</h3>
              <p className="text-xs text-texto-suave">
                La impresora se instala en Windows como cualquier otra. Al imprimir se abre el diálogo
                del navegador: elegí la impresora térmica, márgenes "Ninguno" y desactivá encabezados.
              </p>
              <div className="form-campo">Ancho del papel
                  <select className="form-input" name="anchoTicket"
                  value={config.anchoTicket} onChange={handleChange}>
                    <option value={58}>58 mm</option>
                    <option value={80}>80 mm</option>
                  </select>
              </div>
              <div className="flex flex-row gap-2 items-center text-sm font-medium text-texto-suave">Imprimir ticket automáticamente al cobrar
                  <input className="w-5 h-5" type="checkbox" name="imprimirAlCobrar"
                  checked={config.imprimirAlCobrar} onChange={handleChange}/>
              </div>
              <button className="btn-secundario" onClick={() => setImprimiendo(true)}>
                Imprimir ticket de prueba
              </button>
            </>
          )}
          {error && <p className="form-error">{error}</p>}
          {mensaje && <p className="text-exito text-xs">{mensaje}</p>}
          <button className="btn-primario" onClick={handleSave}>
              Guardar cambios
          </button>
        </div>
        </>
   )
}
