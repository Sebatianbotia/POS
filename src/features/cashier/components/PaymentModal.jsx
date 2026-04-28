import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useProducts } from '../../../contexts/ProductContext';
import { paymentsService, ordersService, ingredientsService } from '../../../services/api/index.js';
import '../styles/PaymentModal.css';

export default function PaymentModal({ mesa, onClose, onPaymentComplete }) {
  const { currentTerminal } = useAuth();
  const { products } = useProducts();
  const [montoStr, setMontoStr] = useState('');
  const [propina, setPropina] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const subtotal = Number(mesa.totalBill) || 0;
  const total = subtotal;
  const propinaCalculada = propina ? Math.round(total * 0.1) : 0;
  const montoTotal = total + propinaCalculada;
  const monto = montoStr === '' ? 0 : parseFloat(montoStr) || 0;

  const handlePropina = (e) => {
    setPropina(e.target.checked);
  };

  const handleNumeroClick = (num) => {
    setMontoStr(prev => {
      if (prev === '') return String(num);
      if (prev === '0' && !prev.includes('.')) return String(num);
      return prev + String(num);
    });
  };

  const handlePunto = () => {
    setMontoStr(prev => {
      if (prev === '') return '0.';
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  };

  const handleCobrar = async () => {
    setError('');

    if (monto < montoTotal) {
      setError(`El monto debe ser mayor o igual a $${Math.ceil(montoTotal).toLocaleString()}`);
      return;
    }
    if (!currentTerminal || !currentTerminal.id) {
      setError('Terminal no asignada. Por favor, verifica tu sesión.');
      return;
    }

    setProcessing(true);
    try {
      if (mesa.currentOrderId) {
        await ordersService.checkout(mesa.currentOrderId);
      }
      if (mesa.currentOrderId) {
        await paymentsService.processPayment(
          mesa.currentOrderId,
          metodoPago,
          Math.round(montoTotal),
          propinaCalculada,
          {},
          null,
          currentTerminal.id
        );
      }

      ingredientsService.deductInventory(mesa.items || [], products).catch(err => {
        console.error('Inventory deduction delayed error:', err);
      });

    } catch (err) {
      console.error('Error processing payment:', err);
      setError(`Error al procesar el pago: ${err.message}`);
      setProcessing(false);
      return;
    }

    generarFactura();

    onPaymentComplete({
      mesaId: mesa.id,
      orderId: mesa.currentOrderId,
      monto: montoTotal,
      vuelto: monto - montoTotal,
      propina: propinaCalculada,
      metodoPago: metodoPago,
      fecha: new Date(),
      descripcion: `Mesa ${mesa.number} - ${mesa.items?.length || 0} items`,
      terminalId: currentTerminal.id
    });

    setProcessing(false);
    onClose();
  };

  const generarFactura = async () => {
    try {
      const html2pdf = await import('html2pdf.js');

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
          <h2 style="text-align: center; margin-bottom: 5px; font-size: 16px;">FACTURA</h2>
          <p style="text-align: center; margin: 5px 0; font-weight: bold; font-size: 14px;">AXON POS</p>
          <p style="text-align: center; margin: 3px 0; font-size: 12px;">RUT/NIT: Restaurante</p>
          <p style="text-align: center; margin: 3px 0; font-size: 12px;">Calle Principal 123, Piso 1</p>
          <p style="text-align: center; margin: 5px 0; font-size: 11px; color: #666;">Terminal: ${currentTerminal?.nombre || 'Sin terminal'}</p>
          <hr style="border: 1px solid #ccc; margin: 15px 0;">
          
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
          <p style="margin: 5px 0;"><strong>Mesa:</strong> ${mesa.number}</p>
          <p style="margin: 5px 0;"><strong>Comensales:</strong> ${mesa.guests || '—'}</p>
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
                  <td style="text-align: right; padding: 5px;">${item.quantity || item.qty || 1}</td>
                  <td style="text-align: right; padding: 5px;">$${((item.precio || item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString()}</td>
                </tr>
              `).join('') || '<tr><td colspan="3" style="padding: 5px;">Sin items</td></tr>'}
            </tbody>
          </table>

          <hr style="border: 1px solid #ccc; margin: 15px 0;">
          
          <div style="font-size: 14px;">
            <p style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Subtotal:</span>
              <span>$${total.toLocaleString()}</span>
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

          ${monto > 0 ? `
            <p style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 14px;">
              <span>Monto Entregado:</span>
              <span>$${monto.toLocaleString()}</span>
            </p>
          ` : ''}

          ${monto > montoTotal ? `
            <p style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 14px; color: #48d17a; font-weight: bold;">
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
          <div className="payment-info">
            <p><strong>Mesa {mesa.number}</strong></p>
            <p>Pedido #{mesa.currentOrderId}</p>
          </div>

          <div className="payment-total-section">
            <label className="total-label">Total a Pagar</label>
            <div className="payment-total-display">
              ${(total + (propina ? propinaCalculada : 0)).toLocaleString('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
            <div className="total-breakdown">
              <span>Facturado: ${total.toLocaleString()}</span>
              {propina && <span>+ Propina: ${propinaCalculada.toLocaleString()}</span>}
            </div>
          </div>

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

          <div className="metodo-pago-section">
            <label>Método de Pago</label>
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${metodoPago === 'efectivo' ? 'active' : ''}`}
                onClick={() => setMetodoPago('efectivo')}
              >
                EFECTIVO
              </button>
              <button
                className={`payment-method-btn ${metodoPago === 'tarjeta' ? 'active' : ''}`}
                onClick={() => setMetodoPago('tarjeta')}
              >
                TARJETA
              </button>
              <button
                className={`payment-method-btn ${metodoPago === 'multiple' ? 'active' : ''}`}
                onClick={() => setMetodoPago('multiple')}
              >
                MÚLTIPLE
              </button>
            </div>
          </div>

          <div className="payment-amount-input-section">
            <label>Monto Recibido</label>
            <div className="amount-input-display">
              <span>$</span>
              <input
                type="text"
                value={montoStr}
                readOnly
                className="amount-input-readonly"
              />
            </div>
          </div>

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
              onClick={() => setMontoStr('')}
            >
              Limpiar
            </button>
          </div>

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

          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="payment-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleCobrar} disabled={processing}>
            {processing ? 'Procesando...' : 'Cobrar & Imprimir Factura'}
          </button>
        </div>
      </div>
    </div>
  );
}
