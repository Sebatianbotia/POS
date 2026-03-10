import { useState } from 'react';
import PaymentModal from '../../cashier/components/PaymentModal';
import { ordersService } from '../../../services/api/index.js';
import '../styles/OrdersManagement.css';

export default function OrderDetailModal({ order, mesa, onClose, onCharge, canCharge = true, onOrderUpdate }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localEstado, setLocalEstado] = useState(order.orderEstado || 'abierta');
  const [localItems, setLocalItems] = useState(mesa.items || []);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleChargeClick = () => setShowPaymentModal(true);

  const handlePaymentComplete = (paymentData) => {
    onCharge(paymentData);
    setShowPaymentModal(false);
    onClose();
  };

  
  const handleSendToKitchen = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction(true);
      await ordersService.updateOrderStatus(order.id, 2);
      await ordersService.sendToKitchen(order.id);
      setLocalEstado('enviada');
      if (onOrderUpdate) onOrderUpdate();

      generarComanda(); 
    } catch (err) {
      alert(`Error al enviar a cocina: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  
  const handleMarkAsReady = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction(true);
      await ordersService.updateOrderStatus(order.id, 4);
      setLocalEstado('lista');
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      alert(`Error al marcar como lista: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveItem = async (item) => {
    if (!window.confirm('¿Eliminar este producto de la orden?')) return;
    try {
      setLoadingAction(true);
      const itemIdToDelete = item.order_item_id || item.id;
      await ordersService.removeOrderItem(order.id, itemIdToDelete);

      setLocalItems(prev => prev.filter(i => i.id !== item.id));
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      alert(`Error al eliminar ítem: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const subtotal = localItems.reduce(
    (sum, i) => sum + (Number(i.precio || i.price || 0) * Number(i.qty || 0)), 0
  );
  const impuesto = 0;
  const total = subtotal;

  const generarComanda = async () => {
    try {
      const html2pdf = await import('html2pdf.js');

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px; color: #000;">
          <h2 style="text-align: center; margin-bottom: 20px;">COMANDA DE COCINA</h2>
          <p><strong>Mesa:</strong> ${mesa.number}</p>
          <p><strong>Mesero:</strong> ${mesa.waiter?.name || 'N/A'}</p>
          <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CO')}</p>
          <hr style="border: 1px dashed #000; margin: 15px 0;">
          
          <h3 style="font-size: 14px; margin-bottom: 10px;">Productos</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid #ccc;">
                <th style="text-align: left; padding: 5px; width: 40px;">Cant</th>
                <th style="text-align: left; padding: 5px;">Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${localItems.map(item => `
                <tr style="border-bottom: 1px dotted #ccc;">
                  <td style="padding: 5px; vertical-align: top; font-weight: bold;">${item.qty || 1}x</td>
                  <td style="padding: 5px;">
                    ${item.name || item.nombre || 'Producto'}
                    ${item.notas ? `<div style="font-size: 12px; font-style: italic; color: #555; margin-top: 4px;">• Notas: ${item.notas}</div>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <hr style="border: 1px dashed #000; margin: 15px 0;">
          <p style="text-align: center; font-size: 14px; font-weight: bold;">Preparar para Mesa ${mesa.number}</p>
        </div>
      `;

      const opt = {
        margin: 5,
        filename: `comanda-mesa-${mesa.number}-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
      };

      html2pdf.default().set(opt).from(element).save();
    } catch (err) {
      console.error('Error al generar la comanda PDF:', err);
    }
  };

  const STATUS_LABEL = {
    abierta: 'Abierta',
    enviada: 'Enviada',
    en_preparacion: 'En preparación',
    lista: 'Lista',
    pagada: 'Completado',
    cancelada: 'Cancelada',
  };
  const STATUS_COLOR = {
    abierta: '#fcad40',
    enviada: '#4ea3ff',
    en_preparacion: '#a78bfa',
    lista: '#48d17a',
    pagada: '#94a3b8',
    cancelada: '#f87171',
  };

  const labelEstado = STATUS_LABEL[localEstado] || localEstado;
  const colorEstado = STATUS_COLOR[localEstado] || '#fff';

  return (
    <>
      <div className="order-detail-overlay" onClick={onClose}>
        <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
          <button className="order-detail-close" onClick={onClose}>✕</button>

          <div className="order-detail-header">
            <h2 className="order-detail-title">Orden #{order.id}</h2>
            <span
              className="order-detail-status-badge"
              style={{ color: colorEstado, borderColor: colorEstado, background: `${colorEstado}1a` }}
            >
              {labelEstado}
            </span>
          </div>

          <div className="order-detail-info">
            <div className="info-block">
              <span className="info-label">Mesa</span>
              <span className="info-value">{mesa.number}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Mesero</span>
              <span className="info-value">{mesa.waiter?.name || '—'}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Comensales</span>
              <span className="info-value">{mesa.guests || '—'}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Tiempo transcurrido</span>
              <span className="info-value">{mesa.occupiedMinutes || 0} min</span>
            </div>
          </div>

          <h3 className="order-detail-items-title">Productos</h3>
          <div className="order-detail-items">
            {localItems && localItems.length > 0 ? (
              localItems.map((item, index) => (
                <div key={item.order_item_id || index} className="order-detail-item">
                  <div className="item-info-detail">
                    <h4>{item.name}</h4>
                    <p>${Number(item.precio || item.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="item-qty-detail">x{item.qty}</div>
                  <div className="item-subtotal">
                    ${(Number(item.precio || item.price || 0) * Number(item.qty || 0)).toFixed(2)}
                  </div>
                  {localEstado === 'abierta' && (
                    <button
                      className="btn-remove-item"
                      onClick={() => handleRemoveItem(item)}
                      disabled={loadingAction}
                      title="Eliminar producto"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-items-detail">Sin productos</p>
            )}
          </div>

          <div className="order-detail-summary">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-detail-actions">
            
            {localEstado === 'abierta' && (
              <button
                className="btn-send-kitchen"
                onClick={handleSendToKitchen}
                disabled={loadingAction}
              >
                {loadingAction ? 'Enviando...' : ' Enviar a Cocina'}
              </button>
            )}

            
            {localEstado === 'enviada' && (
              <button
                className="btn-mark-ready"
                onClick={handleMarkAsReady}
                disabled={loadingAction}
              >
                {loadingAction ? 'Marcando...' : ' Marcar como Lista'}
              </button>
            )}

            {canCharge && localEstado !== 'cancelada' && localEstado !== 'pagada' && (
              <button
                className="btn-charge"
                onClick={handleChargeClick}
                disabled={loadingAction}
              >
                Cobrar
              </button>
            )}
            {!canCharge && (
              <p className="info-text">Contacta a un cajero para procesar el pago</p>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          mesa={{ ...mesa, totalBill: subtotal }}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}
