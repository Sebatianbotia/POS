import { useState, useRef } from 'react';
import '../styles/PaymentModal.css';

export default function PaymentModal({ mesa, onClose, onPaymentComplete }) {
  const [monto, setMonto] = useState(0);
  const [propina, setPropina] = useState(false);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [error, setError] = useState('');

  const total = mesa.totalBill ? Number(mesa.totalBill) * 1.085 : 0;
  const propinaCalculada = propina ? Math.round(total * 0.1) : 0;
  const montoTotal = total + propinaCalculada;

  const handlePropina = (e) => {
    setPropina(e.target.checked);
  };

  const handleNumeroClick = (num) => {
    setMonto(prev => {
      const str = prev === 0 ? String(num) : String(prev) + String(num);
      return Number(str);
    });
  };

  const handlePunto = () => {
    setMonto(prev => {
      if (String(prev).includes('.')) return prev;
      return parseFloat(String(prev) + '.');
    });
  };

  const handleCobrar = async () => {
    setError('');

    if (monto < total) {
      setError(`El monto debe ser mayor o igual a $${Math.ceil(total).toLocaleString()}`);
      return;
    }

    await generarFactura();

    onPaymentComplete({
      mesaId: mesa.id,
      orderId: mesa.currentOrderId,
      monto: monto,
      propina: propinaCalculada,
      metodoPago: metodoPago,
      fecha: new Date(),
      descripcion: `Mesa ${mesa.number} - ${mesa.items?.length || 0} items`
    });

    onClose();
  };

  const generarFactura = async () => {
    try {
      const html2pdf = await import('html2pdf.js');
      
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
          <h2 style="text-align: center; margin-bottom: 20px;">FACTURA</h2>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
          <p><strong>Mesa:</strong> ${mesa.number}</p>
          <p><strong>Mesero:</strong> ${mesa.waiter || 'N/A'}</p>
          <hr style="border: 1px solid #ccc; margin: 15px 0;">
          
          <h3 style="font-size: 14px; margin-bottom: 10px;">Detalles de la Orden</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #ccc;">
                <th style="text-align: left; padding: 5px;">Descripción</th>
                <th style="text-align: right; padding: 5px;">Cantidad</th>
                <th style="text-align: right; padding: 5px;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${mesa.items?.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 5px;">${item.name || 'Producto'}</td>
                  <td style="text-align: right; padding: 5px;">${item.quantity || 1}</td>
                  <td style="text-align: right; padding: 5px;">$${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                </tr>
              `).join('') || '<tr><td colspan="3" style="padding: 5px;">Sin items</td></tr>'}
            </tbody>
          </table>

          <hr style="border: 1px solid #ccc; margin: 15px 0;">
          
          <div style="font-size: 14px;">
            <p style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Subtotal:</span>
              <span>$${(total / 1.085).toLocaleString()}</span>
            </p>
            <p style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Impuesto (8.5%):</span>
              <span>$${(total - (total / 1.085)).toLocaleString()}</span>
            </p>
            ${propinaCalculada > 0 ? `
              <p style="display: flex; justify-content: space-between; margin: 8px 0; color: #fcad40;">
                <span>Propina (10%):</span>
                <span>$${propinaCalculada.toLocaleString()}</span>
              </p>
            ` : ''}
          </div>

          <hr style="border: 2px solid #000; margin: 15px 0;">
          
          <p style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 16px; font-weight: bold;">
            <span>Total:</span>
            <span>$${(total + propinaCalculada).toLocaleString()}</span>
          </p>

          <p style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 14px;">
            <span>Método de Pago:</span>
            <span>${metodoPago}</span>
          </p>

          ${monto !== montoTotal ? `
            <p style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 14px;">
              <span>Cambio:</span>
              <span>$${(monto - montoTotal).toLocaleString()}</span>
            </p>
          ` : ''}

          <hr style="border: 1px solid #ccc; margin: 15px 0;">
          <p style="text-align: center; font-size: 12px; color: #666;">
            ¡Gracias por su compra!<br>
            ${new Date().toLocaleTimeString('es-CO')}
          </p>
        </div>
      `;

      const opt = {
        margin: 5,
        filename: `factura-mesa-${mesa.number}-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      html2pdf.default().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generando factura:', err);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-header">
          <h2>Procesar Pago</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-content">
          {/* Información de la Mesa */}
          <div className="payment-info">
            <p><strong>Mesa {mesa.number}</strong></p>
            <p>Pedido #{mesa.currentOrderId}</p>
          </div>

          {/* TOTAL A PAGAR - Prominente */}
          <div className="payment-total-section">
            <label className="total-label">Total a Pagar</label>
            <div className="payment-total-display">
              ${(total + (propina ? propinaCalculada : 0)).toLocaleString('es-CO', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })}
            </div>
            <div className="total-breakdown">
              <span>Facturado: ${Math.ceil(total).toLocaleString()}</span>
              {propina && <span>+ Propina: ${propinaCalculada.toLocaleString()}</span>}
            </div>
          </div>

          {/* Propina Checkbox */}
          <div className="propina-checkbox-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={propina}
                onChange={handlePropina}
              />
              <span>Agregar propina (10%)</span>
              {propina && <span className="propina-amount">${propinaCalculada.toLocaleString()}</span>}
            </label>
          </div>

          {/* Método de Pago */}
          <div className="metodo-pago-section">
            <label>Método de Pago</label>
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${metodoPago === 'EFECTIVO' ? 'active' : ''}`}
                onClick={() => setMetodoPago('EFECTIVO')}
              >
                💵 EFECTIVO
              </button>
              <button
                className={`payment-method-btn ${metodoPago === 'TARJETA' ? 'active' : ''}`}
                onClick={() => setMetodoPago('TARJETA')}
              >
                💳 TARJETA
              </button>
              <button
                className={`payment-method-btn ${metodoPago === 'TRANSFERENCIA' ? 'active' : ''}`}
                onClick={() => setMetodoPago('TRANSFERENCIA')}
              >
                🏦 TRANSFER
              </button>
            </div>
          </div>

          {/* Monto Ingresado */}
          <div className="payment-amount-input-section">
            <label>Monto Recibido</label>
            <div className="amount-input-display">
              <span>$</span>
              <input
                type="text"
                value={monto === 0 ? '' : monto.toLocaleString('es-CO')}
                readOnly
                className="amount-input-readonly"
              />
            </div>
          </div>

          {/* Calculadora */}
          <div className="calculator-section">
            <div className="calculator-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  className="calc-btn"
                  onClick={() => handleNumeroClick(num)}
                >
                  {num}
                </button>
              ))}
              <button className="calc-btn" onClick={() => handleNumeroClick(0)}>
                0
              </button>
              <button className="calc-btn dot" onClick={handlePunto}>
                .
              </button>
            </div>
            <button 
              className="calc-clear-btn"
              onClick={() => setMonto(0)}
            >
              Limpiar
            </button>
          </div>

          {/* Cambio */}
          {monto > 0 && (
            <div className="cambio-section">
              <span>Cambio:</span>
              <span className="cambio-amount">
                ${(monto - montoTotal).toLocaleString('es-CO', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </span>
            </div>
          )}

          {/* Error */}
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Botones de Acción */}
        <div className="payment-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleCobrar}>
            Cobrar & Imprimir Factura
          </button>
        </div>
      </div>
    </div>
  );
}
