import React, { useEffect, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, subDays, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale"; // fechas en español
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, ShoppingBag, TrendingUp, Calendar, ChevronDown, Loader2, AlertCircle 
} from 'lucide-react';
import { getRevenueSummary, getDailyRevenue } from "../services/fetch/orders";

/**
 * Función para rellenar los días que no tienen ventas en el gráfico
 */
const fillMissingDates = (startDate, endDate, apiData) => {
  if (!startDate || !endDate) return [];
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return allDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    // Buscamos si el día existe en los datos devueltos por el backend
    const found = apiData.find((d) => d.date === dateStr);

    return {
      date: dateStr,
      total: found ? found.total : 0,
      orders: found ? found.orders : 0,
    };
  });
};

export default function DashboardPage() {
  // ESTADOS
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados del DatePicker (Iniciamos con los últimos 30 días)
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  // CARGA DE DATOS
  const loadDashboardData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      // Formateamos para la API YYYY-MM-DD
      const sStr = format(startDate, "yyyy-MM-dd");
      const eStr = format(endDate, "yyyy-MM-dd");

      const [summaryRes, dailyRes] = await Promise.all([
        getRevenueSummary(sStr, eStr),
        getDailyRevenue(sStr, eStr)
      ]);

      setSummary(summaryRes);
      
      // Aplicamos la funcion para que el gráfico sea representativo
      const completeData = fillMissingDates(startDate, endDate, dailyRes);
      setChartData(completeData);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Manejador del cambio de fechas en el DatePicker
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const ticketPromedio = summary.totalOrders > 0 
    ? (summary.totalRevenue / summary.totalOrders).toFixed(2) 
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reporte de Ventas</h1>
            <p className="text-slate-500 font-medium">Análisis de rendimiento comercial (UTC-3)</p>
          </div>

          {/* Date Range Picker Container */}
          <div className="relative inline-block">
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-2.5 hover:border-blue-400 transition-all cursor-pointer group">
              <Calendar size={20} className="text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                maxDate={new Date()}
                dateFormat="dd MMM, yyyy"
                locale={es}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 cursor-pointer w-44 md:w-52"
                placeholderText="Seleccionar periodo"
              />
              <ChevronDown size={18} className="text-slate-400 ml-1" />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Ingresos Totales" 
            value={`$${Number(summary.totalRevenue).toLocaleString()}`} 
            icon={<DollarSign />}
            color="emerald"
            description="Ventas brutas del periodo"
          />
          <StatCard 
            label="Órdenes Completadas" 
            value={summary.totalOrders} 
            icon={<ShoppingBag />}
            color="blue"
            description="Volumen de transacciones"
          />
          <StatCard 
            label="Ticket Promedio" 
            value={`$${Number(ticketPromedio).toLocaleString()}`} 
            icon={<TrendingUp />}
            color="violet"
            description="Promedio por compra"
          />
        </div>

        {/* CHART SECTION */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Tendencia de Ingresos</h3>
              <p className="text-sm text-slate-500">Visualización de la línea de tiempo completa</p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
                <Loader2 className="animate-spin" size={18} /> Actualizando...
              </div>
            )}
          </div>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  minTickGap={40}
                  tickFormatter={(val) => format(parseISO(val), "dd MMM")}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente: Tarjeta de Estadística Individual
 */
function StatCard({ label, value, icon, color, description }) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm transition-hover hover:shadow-md transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border ${themes[color]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h2 className="text-3xl font-black text-slate-900 mt-1">{value}</h2>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  );
}

/**
 * Componente: Tooltip Personalizado para el Gráfico
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800">
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">
          {label ? format(parseISO(label), "eeee, dd 'de' MMMM", { locale: es }) : ""}
        </p>
        <div className="space-y-1">
          <p className="text-xl font-black text-blue-400">
            ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            {payload[0].payload.orders} pedidos registrados
          </p>
        </div>
      </div>
    );
  }
  return null;
}