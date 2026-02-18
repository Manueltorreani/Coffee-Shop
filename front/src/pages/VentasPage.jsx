import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Calendar, 
  CheckCircle, XCircle, Clock, Minus, PlusCircle, Save, X
} from 'lucide-react';
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
  const [filterDate, setFilterDate] = useState(getTodayInUTC3()); // Inicializamos con la fecha actual en UTC-3

  // Catálogo completo para búsqueda instantánea
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);



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
      const newOrder = await createOrder({ userId: 1, items: [] }); 
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
      await updateOrderStatus(id, data);
      loadOrders();
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  // --- RENDER ---
  const StatusBadge = ({ status }) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELED: "bg-red-100 text-red-800"
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-50 overflow-hidden">
      
      {/* COLUMNA IZQUIERDA: LISTADO DE VENTAS */}
      <div className="w-full md:w-1/3 flex flex-col border-r bg-white">
        <div className="p-4 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 italic">Ventas</h2>
            <button onClick={handleCreateOrder} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition">
              <Plus size={18} /> Nueva Orden
            </button>
          </div>
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"/>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <p className="p-4 text-center">Cargando...</p> : orders.length === 0 ? (
            <p className="p-10 text-center text-gray-400">No hay ventas en esta fecha</p>
          ) : (
            orders.map(order => {
              // Definimos los colores del borde según el estado
              const statusColors = {
                PENDING: 'border-l-orange-500',
                COMPLETED: 'border-l-green-500',
                CANCELED: 'border-l-red-500'
              };

              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} 
                  className={`p-4 border-b cursor-pointer transition border-l-4 ${statusColors[order.status]} ${selectedOrder?.id === order.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-700">{order.client || 'Cliente no definido'}</span><span className="font-bold text-gray-700">{' - '}Orden #{order.id}</span>
                    <div className="flex items-center gap-2">
                      {/* Botón para volver a PENDING si no lo está */}
                      {order.status !== 'PENDING' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que se seleccione la orden al tocar el botón
                            handleChangeStatus(order.id, {status: 'PENDING'});
                          }}
                          title="Reabrir orden"
                          className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold">
                    {/* Formato DD/MM/YYYY HH:MM */}
                    <span className="text-gray-500">
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
                    <span className="text-gray-900 text-sm">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: DETALLE Y BUSCADOR */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {selectedOrder ? (
          <>
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <div className='flex flex-col'>
                <div className='flex flex-row gap-4 items-center mb-1'>
                  <h3 className="text-lg font-black italic uppercase">Detalle Orden #{selectedOrder.id}</h3>
                  <p className="text-xs font-bold text-gray-400">FECHA: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
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
                        className="border border-gray-300 rounded px-2 py-1"
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
                        className="border border-gray-300 rounded px-2 py-1"
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
                      className='flex flex-row text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold items-center gap-2 transition'
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
                    <span className="text-sm font-bold text-gray-500">{selectedOrder.client || 'Cliente no definido'}{' - '}{selectedOrder.paymentMethod || 'Pago no definido'}</span>
                  )}
                    </div>
              </div>
              <div className="flex gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleChangeStatus(selectedOrder.id, {status: 'COMPLETED', paymentMethod: selectedOrder.paymentMethod})} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition">
                      <CheckCircle size={18} /> Cobrar
                    </button>
                    <button onClick={() => handleChangeStatus(selectedOrder.id, {status: 'CANCELED'})} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition">
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
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                      type="text"
                      placeholder="Buscar producto..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all font-bold"
                      value={searchQuery}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {showDropdown && searchQuery.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-100 rounded-xl shadow-2xl overflow-hidden">
                      <div className="max-h-[320px] overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => (
                            <div 
                              key={p.id}
                              onMouseDown={() => addItemToOrder(p)}
                              className="h-[50px] px-4 flex items-center justify-between hover:bg-blue-600 hover:text-white cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                            >
                              <span className="font-black italic uppercase text-sm">{p.nombre}</span>
                              <span className="font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs group-hover:bg-blue-500">${p.precio?.toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-400 font-bold">No se encontraron productos</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TABLA DE ITEMS */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-400 uppercase text-xs font-black">
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
                      <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        
                        {/* 1. COLUMNA PRODUCTO: Aquí va el nombre */}
                        <td className="p-4">
                          <span className="font-bold text-gray-800 uppercase text-sm">
                            {item.nombre}
                          </span>
                        </td>

                        {/* 2. COLUMNA CANTIDAD: Aquí van los controles +/- */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {selectedOrder.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateItem(item.productId, 'REMOVE')} 
                                className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                              >
                                <Minus size={14} strokeWidth={3}/>
                              </button>
                            )}
                            
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-black text-xs min-w-[32px] text-center">
                              {item.cantidad}
                            </span>

                            {selectedOrder.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateItem(item.productId, 'ADD')} 
                                className="p-1 hover:bg-green-100 text-green-600 rounded transition"
                              >
                                <Plus size={14} strokeWidth={3}/>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 3. COLUMNA UNITARIO: El precio snapshot del back */}
                        <td className="p-4 text-right font-medium text-gray-600">
                          ${item.precio?.toFixed(2)}
                        </td>

                        {/* 4. COLUMNA TOTAL: Multiplicación de precio x cantidad */}
                        <td className="p-4 text-right font-black text-gray-900">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </td>

                        {/* 5. COLUMNA ACCIÓN: Botón eliminar (solo si está PENDING) */}
                        {selectedOrder.status === 'PENDING' && (
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleUpdateItem(item.productId, 'DELETE')}
                              className="text-gray-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-6 bg-gray-900 flex justify-between items-center text-white">
                    <span className="font-black italic uppercase tracking-widest text-gray-400">Total Orden</span>
                    <span className="text-4xl font-black">${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <Clock size={80} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-xl font-black italic uppercase">Esperando Selección</p>
          </div>
        )}
      </div>
    </div>
  );
}