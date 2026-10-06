import { useEffect } from "react";
import { createPortal } from "react-dom";

// Ticket / Comanda para impresora térmica usando la impresión del navegador (window.print).
// ¿Cómo funciona?
// 1. createPortal dibuja el ticket directamente en <body>, FUERA de #root (la app).
// 2. En index.css, @media print oculta #root y muestra solo .print-area -> se imprime solo el ticket.
// 3. Apenas se monta, llama a window.print(); cuando el diálogo se cierra avisa con onAfterPrint.
//
// Props:
// - orden: { id, client, paymentMethod, total, createdAt, items: [{ id, nombre, cantidad, precio }] }
// - config: datos del local (nombre, direccion, telefono, cuit, mensajeTicket, anchoTicket)
// - tipo: "ticket" (para el cliente, con precios) | "comanda" (para cocina/barra, sin precios)
// - onAfterPrint: función para desmontar el ticket después de imprimir
export default function Ticket({ orden, config, tipo = "ticket", onAfterPrint }) {

  useEffect(() => {
    const handleAfterPrint = () => onAfterPrint?.();
    window.addEventListener("afterprint", handleAfterPrint);
    window.print();
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const fecha = new Date(orden.createdAt).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  const ancho = config?.anchoTicket || 80; // mm

  return createPortal(
    <div className="print-area" style={{ width: `${ancho - 6}mm`, fontSize: ancho === 58 ? "11px" : "13px" }}>
      {tipo === "ticket" ? (
        <>
          <div style={{ textAlign: "center" }}>
            <strong style={{ fontSize: "1.3em" }}>{config?.nombre}</strong>
            {config?.direccion && <div>{config.direccion}</div>}
            {config?.telefono && <div>Tel: {config.telefono}</div>}
            {config?.cuit && <div>CUIT: {config.cuit}</div>}
          </div>
          <hr />
          <div>Orden #{orden.id} - {fecha}</div>
          {orden.client && <div>Cliente: {orden.client}</div>}
          <hr />
          <table style={{ width: "100%" }}>
            <tbody>
              {orden.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.cantidad} x {item.nombre}</td>
                  <td style={{ textAlign: "right" }}>${(item.precio * item.cantidad).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2em" }}>
            <strong>TOTAL</strong>
            <strong>${orden.total?.toFixed(2)}</strong>
          </div>
          {orden.paymentMethod && <div>Pago: {orden.paymentMethod}</div>}
          {config?.mensajeTicket && (
            <>
              <hr />
              <div style={{ textAlign: "center" }}>{config.mensajeTicket}</div>
            </>
          )}
          <div style={{ textAlign: "center", fontSize: "0.85em", marginTop: 4 }}>No válido como factura</div>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center" }}>
            <strong style={{ fontSize: "1.4em" }}>COMANDA</strong>
          </div>
          <div>Orden #{orden.id} - {fecha}</div>
          {orden.client && <div style={{ fontSize: "1.2em" }}><strong>{orden.client}</strong></div>}
          <hr />
          {orden.items?.map((item) => (
            <div key={item.id} style={{ fontSize: "1.2em" }}>
              <strong>{item.cantidad}</strong> x {item.nombre}
            </div>
          ))}
        </>
      )}
    </div>,
    document.body
  );
}
