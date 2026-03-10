import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './KitchenSlip.css';

export default function KitchenSlip({ order, tableNumber, onClose }) {
  const slipRef = useRef(null);

  const handlePrint = () => {
    if (slipRef.current) {
      window.print();
    }
  };

  const handleDownload = () => {
    if (slipRef.current) {
      const element = slipRef.current;
      const opt = {
        margin: 5,
        filename: `comanda-mesa-${tableNumber}.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="kitchen-slip-container">
      <div className="slip-actions">
        <button className="btn-print" onClick={handlePrint}>️ Imprimir</button>
        <button className="btn-download" onClick={handleDownload}> Descargar PDF</button>
        <button className="btn-close" onClick={onClose}>✕ Cerrar</button>
      </div>

      <div ref={slipRef} className="kitchen-slip">
        <div className="slip-header">
          <h2>COMANDA DE COCINA</h2>
          <div className="slip-table-info">
            <span className="table-label">Mesa</span>
            <span className="table-number">{tableNumber}</span>
          </div>
        </div>

        <div className="slip-timestamp">
          <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="slip-items">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} className="slip-item">
                <div className="slip-item-header">
                  <span className="item-qty">{item.cantidad}x</span>
                  <span className="item-name">{item.menu_item_name || item.nombre}</span>
                </div>
                {item.notas && (
                  <div className="slip-item-notes">
                    Notas: {item.notas}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No hay items en la orden</p>
          )}
        </div>

        <div className="slip-footer">
          <p>Preparar para Mesa {tableNumber}</p>
        </div>
      </div>
    </div>
  );
}
