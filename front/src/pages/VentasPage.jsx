import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Calendar, 
  CheckCircle, XCircle, Clock, Minus, PlusCircle, Save, X, Printer, ChefHat
} from 'lucide-react';
import { getConfig } from '../services/fetch/config.js';
import Ticket from '../components/Ticket.jsx';
import { getOrders, createOrder, updateOrderStatus,updateOrderItems } from '../services/fetch/orders.js';
import { fetchProducts } from '../api/products.js';
import { getPaymentMethods } from '../services/fetch/paymentMethods';
import { get } from '../api/client.js';

// Función para obtener la fecha actual en formato YYYY-MM-DD ajustada a UTC-3
const getTodayInUTC3 = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires', // Ajusta según tu ciudad
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

export default function VentasPage() {
  // --- ESTADOS ---
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(); // Inicializamos con la fecha actual en UTC-3

  // Catálogo completo para búsqueda instantánea
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Impresión: config del local + qué imprimir ({ orden, tipo: 'ticket' | 'comanda' } o null)
  const [config, setConfig] = useState(null);
  const [impresion, setImpresion] = useState(null);



  // --- CARGA INICIAL ---
  
  // 1. Cargar catálogo de productos una sola vez (o cuando cambie la página)
  useEffect(() => {
    async function loadCatalog() {
      try {
        // Traemos un límite alto (ej. 100) para tener todo el menú del café en memoria
        const data = await fetchProducts({ limit: 100 });
        setAllProducts(data.items || []); // <-- CORRECCIÓN: Usar .items
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      }
    }
    loadCatalog();

    async function loadPaymentMethods() {
      try {
        const data = await getPaymentMethods();
        setPaymentMethods(data);
      } catch (err) {
        console.error("Error cargando métodos:", err);
      }
    }

    loadPaymentMethods();

    async function loadConfig() {
      try {
        const data = await getConfig();
        setConfig(data);
      } catch (err) {
        console.error("Error cargando configuración:", err);
      }
    }

    loadConfig();
  }, []);

  // 2. Cargar órdenes según fecha
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Agregamos un limit alto por si la API pagina por defecto (ej. 50 o 100 órdenes)
      const data = await getOrders({ 
        startDate: filterDate, 
        endDate: filterDate,
        limit: 100 // <-- Asegúrate de pedir suficientes registros
      });
      setOrders(data);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // --- LÓGICA DE FILTRADO LOCAL ---
  // Esto hace que el popup sea instantáneo
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    const search = searchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.nombre.toLowerCase().includes(search)
    ).slice(0, 8); // Limitamos a 8 resultados para el popup
  }, [searchQuery, allProducts]);

  // --- ACCIONES ---
  const handleCreateOrder = async () => {
    try {
      const newOrder = await createOrder({ items: [] }); // el back toma el usuario del token
      setOrders([newOrder, ...orders]);
      setSelectedOrder(newOrder);
    } catch (error) {
      alert("Error al abrir nueva orden");
    }
  };
  // Función unificada para manejar cambios en items
  const handleUpdateItem = async (productId, action) => {
    if (!selectedOrder || selectedOrder.status !== 'PENDING') return;
    
    try {
      const updatedOrder = await updateOrderItems(selectedOrder.id, productId, action);
      
      // Actualizamos el estado local de la orden seleccionada
      setSelectedOrder(updatedOrder);
      
      // Actualizamos la lista de órdenes de la izquierda para que el total se vea reflejado
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      
    } catch (error) {
      alert("Error al actualizar la orden: " + error.message);
    }
  };

  // Modificamos addItemToOrder (la que usa el popup)
  const addItemToOrder = (product) => {
    handleUpdateItem(product.id, 'ADD');
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleChangeStatus = async (id, data) => {
    if (!window.confirm(`¿Actualizar orden #${id}?`)) return;
    try {
      const ordenActualizada = await updateOrderStatus(id, data);

      // Si se cobró y en Configuración está activado "imprimir al cobrar", imprimimos el ticket
      if (data.status === 'COMPLETED' && config?.imprimirAlCobrar && selectedOrder?.id === id) {
        setImpresion({ orden: { ...selectedOrder, ...ordenActualizada }, tipo: 'ticket' });
      }

      loadOrders();
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (error) {
      alert("Error al actualizar: " + error.message); // muestra el mensaje del back (ej: falta método de pago)
    }
  };

  // --- RENDER ---
  const StatusBadge = ({ status }) => {
    const styles = {
      PENDING: "badge-aviso",
      COMPLETED: "badge-exito",
      CANCELED: "badge-error"
    };
    return <span className={`badge ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-fondo overflow-hidden">
      {/* Ticket/Comanda: se monta, imprime y se desmonta solo */}
      {impresion && (
        <Ticket orden={impresion.orden} config={config} tipo={impresion.tipo} onAfterPrint={() => setImpresion(null)} />
      )}

      {/* COLUMNA IZQUIERDA: LISTADO DE VENTAS */}
      <div className="w-full md:w-1/3 flex flex-col border-r border-borde bg-superficie">
        <div className="p-4 border-b border-borde space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-dark italic">Ventas</h2>
            <button onClick={handleCreateOrder} className="btn-primario flex items-center gap-2 text-sm">
              <Plus size={18} /> Nueva Orden
            </button>
          </div>
          <div>
            <div className="flex flex-row items-center gap-3 bg-superficie p-2 rounded-xl border border-borde shadow-sm">
            {/* Botón Hoy */}
            <button 
              className='px-3 py-2 text-sm font-medium rounded-lg bg-primary-suave text-secondary hover:bg-borde transition-colors' 
              onClick={() => setFilterDate(getTodayInUTC3())}
            >
              Hoy
            </button>

            {/* Contenedor del Input con Icono */}
            <div className="relative flex items-center">
              <Calendar 
                className="absolute left-3 text-texto-suave/70 pointer-events-none" 
                size={18} 
              />
              <input 
                type="date" 
                value={filterDate || ""} // Evita el error de "uncontrolled component"
                onChange={(e) => setFilterDate(e.target.value)} 
                className="pl-10 pr-4 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-secondary/25 outline-none font-medium text-dark text-sm"
              />
            </div>

            {/* Botón Limpiar (X) */}
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")} // Mejor usar string vacío que undefined para el input
                className="p-2 text-texto-suave/70 hover:text-error hover:bg-error-suave rounded-full transition-all"
                title="Limpiar filtro"
              >
                <X size={18} />
              </button>
            )}
          </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <p className="p-4 text-center">Cargando...</p> : orders.length === 0 ? (
            <p className="p-10 text-center text-texto-suave/70">No hay ventas en esta fecha</p>
          ) : (
            orders.map(order => {
              // Definimos los colores del borde según el estado
              const statusColors = {
                PENDING: 'border-l-aviso',
                COMPLETED: 'border-l-exito',
                CANCELED: 'border-l-error'
              };

              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} 
                  className={`p-4 border-b border-borde cursor-pointer transition border-l-4 ${statusColors[order.status]} ${selectedOrder?.id === order.id ? 'bg-primary-suave' : 'hover:bg-fondo'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-dark">{order.client || 'Cliente no definido'}</span><span className="font-medium text-dark">{' - '}Orden #{order.id}</span>
                    <div className="flex items-center gap-2">
                      {/* Botón para volver a PENDING si no lo está */}
                      {order.status !== 'PENDING' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que se seleccione la orden al tocar el botón
                            handleChangeStatus(order.id, {status: 'PENDING'});
                          }}
                          title="Reabrir orden"
                          className="p-1 text-texto-suave/70 hover:text-aviso hover:bg-aviso-suave rounded-full transition"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-medium">
                    {/* Formato DD/MM/YYYY HH:MM */}
                    <span className="text-texto-suave">
                      {new Date(order.createdAt).toLocaleString('es-AR', {
                        timeZone: 'America/Argentina/Buenos_Aires', // Forzamos UTC-3 en el render
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })} hs { order.paymentMethod ? `- ${order.paymentMethod}` : '' }
                    </span>
                    <span className="text-dark text-sm">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: DETALLE Y BUSCADOR */}
      <div className="flex-1 flex flex-col bg-fondo">
        {selectedOrder ? (
          <>
            <div className="p-6 bg-superficie border-b border-borde flex justify-between items-center">
              <div className='flex flex-col'>
                <div className='flex flex-row gap-4 items-center mb-1'>
                  <h3 className="text-lg font-medium italic uppercase">Detalle Orden #{selectedOrder.id}</h3>
                  <p className="text-xs font-medium text-texto-suave/70">FECHA: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className='flex flex-row gap-4 items-end'>
                  {selectedOrder.status === 'PENDING' ? (<>
                    {/* CLIENTE */}
                    <label className='flex flex-col gap-2'>
                      Cliente:
                      <input
                        type="text"
                        value={selectedOrder.client || ''}
                        onChange={(e) =>
                          setSelectedOrder({
                            ...selectedOrder,
                            client: e.target.value
                          })
                        }
                        className="form-input py-1"
                      />
                    </label>

                    {/* MÉTODO DE PAGO */}
                    <label className='flex flex-col gap-2'>
                      Método de Pago:
                      <select
                        value={selectedOrder.paymentMethod || ""}
                        onChange={(e) =>
                          setSelectedOrder({
                            ...selectedOrder,
                            paymentMethod: e.target.value || null
                          })
                        }
                        className="form-input py-1"
                      >
                        <option value="">No definido</option>

                        {/* Si el actual no existe más, lo agregamos arriba */}
                        {selectedOrder.paymentMethod &&
                          !paymentMethods.some(m => m.nombre === selectedOrder.paymentMethod) && (
                            <option value={selectedOrder.paymentMethod}>
                              {selectedOrder.paymentMethod} (No disponible)
                            </option>
                          )
                        }

                        {paymentMethods.map(method => (
                          <option key={method.id} value={method.nombre}>
                            {method.nombre}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className='btn-primario flex flex-row items-center gap-2'
                      onClick={() =>
                        handleChangeStatus(selectedOrder.id, {
                          client: selectedOrder.client,
                          paymentMethod: selectedOrder.paymentMethod
                        })
                      }
                    >
                    <Save size={18} /> Guardar
                    </button>
                  </>
                  ) : (
                    <span className="text-sm font-medium text-texto-suave">{selectedOrder.client || 'Cliente no definido'}{' - '}{selectedOrder.paymentMethod || 'Pago no definido'}</span>
                  )}
                    </div>
              </div>
              <div className="flex gap-2">
                {/* Imprimir: comanda (para la barra/cocina) y ticket (para el cliente) */}
                <button
                  onClick={() => setImpresion({ orden: selectedOrder, tipo: 'comanda' })}
                  disabled={!selectedOrder.items?.length}
                  title="Imprimir comanda"
                  className="btn-secundario flex items-center gap-2"
                >
                  <ChefHat size={18} />
                </button>
                <button
                  onClick={() => setImpresion({ orden: selectedOrder, tipo: 'ticket' })}
                  disabled={!selectedOrder.items?.length}
                  title="Imprimir ticket"
                  className="btn-secundario flex items-center gap-2"
                >
                  <Printer size={18} />
                </button>
                {selectedOrder.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleChangeStatus(selectedOrder.id, {status: 'COMPLETED', paymentMethod: selectedOrder.paymentMethod})}
                      disabled={!selectedOrder.paymentMethod} // sin método de pago no se puede cobrar
                      title={!selectedOrder.paymentMethod ? 'Seleccioná un método de pago' : ''}
                      className="bg-exito text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:brightness-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={18} /> Cobrar
                    </button>
                    <button onClick={() => handleChangeStatus(selectedOrder.id, {status: 'CANCELED'})} className="bg-superficie text-error border border-error/30 px-4 py-2 rounded-lg font-medium hover:bg-error-suave transition">
                      <XCircle size={18} /> Anular
                    </button>
                  </>
                )}
              </div>
              
            </div>
            

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* BUSCADOR CON POPUP */}
              {selectedOrder.status === 'PENDING' && (
                <div className="relative w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-texto-suave/70" size={20} />
                    <input 
                      type="text"
                      placeholder="Buscar producto..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-borde rounded-xl focus:border-secondary outline-none transition-all font-medium"
                      value={searchQuery}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {showDropdown && searchQuery.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-superficie border-2 border-borde rounded-xl shadow-2xl overflow-hidden">
                      <div className="max-h-[320px] overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => (
                            <div 
                              key={p.id}
                              onMouseDown={() => addItemToOrder(p)}
                              className="h-[50px] px-4 flex items-center justify-between hover:bg-primary hover:text-white cursor-pointer transition-colors border-b border-borde last:border-0"
                            >
                              <span className="font-medium italic uppercase text-sm">{p.nombre}</span>
                              <span className="font-medium bg-fondo text-dark px-2 py-1 rounded text-xs group-hover:bg-primary">${p.precio?.toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-texto-suave/70 font-medium">No se encontraron productos</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TABLA DE ITEMS */}
              <div className="bg-superficie rounded-2xl shadow-sm border border-borde overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-fondo border-b border-borde">
                    <tr className="text-texto-suave/70 uppercase text-xs font-medium">
                      <th className="p-4">Producto</th>
                      <th className="p-4">Cant.</th>
                      <th className="p-4 text-right">Unit.</th>
                      <th className="p-4 text-right">Total</th>
                      {selectedOrder.status === 'PENDING' && <th className="p-4"></th>}
                    </tr>
                  </thead>
                  {/* ... dentro de <table> ... */}
                  <tbody>
                    {selectedOrder.items?.map(item => (
                      <tr key={item.id} className="border-b border-borde last:border-0 hover:bg-fondo transition-colors">
                        
                        {/* 1. COLUMNA PRODUCTO: Aquí va el nombre */}
                        <td className="p-4">
                          <span className="font-medium text-dark uppercase text-sm">
                            {item.nombre}
                          </span>
                        </td>

                        {/* 2. COLUMNA CANTIDAD: Aquí van los controles +/- */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {selectedOrder.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateItem(item.productId, 'REMOVE')} 
                                className="p-1 hover:bg-error-suave text-error rounded transition"
                              >
                                <Minus size={14} strokeWidth={3}/>
                              </button>
                            )}
                            
                            <span className="bg-primary-suave text-secondary px-3 py-1 rounded-lg font-medium text-xs min-w-[32px] text-center">
                              {item.cantidad}
                            </span>

                            {selectedOrder.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateItem(item.productId, 'ADD')} 
                                className="p-1 hover:bg-exito-suave text-exito rounded transition"
                              >
                                <Plus size={14} strokeWidth={3}/>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 3. COLUMNA UNITARIO: El precio snapshot del back */}
                        <td className="p-4 text-right font-medium text-texto-suave">
                          ${item.precio?.toFixed(2)}
                        </td>

                        {/* 4. COLUMNA TOTAL: Multiplicación de precio x cantidad */}
                        <td className="p-4 text-right font-medium text-dark">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </td>

                        {/* 5. COLUMNA ACCIÓN: Botón eliminar (solo si está PENDING) */}
                        {selectedOrder.status === 'PENDING' && (
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleUpdateItem(item.productId, 'DELETE')}
                              className="btn-icono btn-icono-borrar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-6 bg-dark flex justify-between items-center text-white">
                    <span className="font-medium italic uppercase tracking-widest text-white/60">Total Orden</span>
                    <span className="text-4xl font-medium">${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-borde-fuerte">
            <Clock size={80} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-xl font-medium italic uppercase">Esperando Selección</p>
          </div>
        )}
      </div>
    </div>
  );
}