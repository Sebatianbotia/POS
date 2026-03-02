import { useState } from 'react';
import PaymentModal from '../../cashier/components/PaymentModal';
import '../styles/OrdersManagement.css';

export default function OrderDetailModal({ order, mesa, onClose, onCharge }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleChargeClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentData) => {
    onCharge(paymentData);
    setShowPaymentModal(false);
    onClose();
  };

  return (
    <>
      <div className="order-detail-overlay" onClick={onClose}>
        <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
          <button className="order-detail-close" onClick={onClose}>✕</button>

          <div className="order-detail-header">
            <h2 className="order-detail-title">Orden #{order.id}</h2>
            <span className={`order-detail-status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
              {order.status}
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
            {mesa.items && mesa.items.length > 0 ? (
              mesa.items.map(item => (
                <div key={item.id} className="order-detail-item">
                  <div className="item-info-detail">
                    <h4>{item.name}</h4>
                    <p>${Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="item-qty-detail">x{item.qty}</div>
                  <div className="item-subtotal">
                    ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-items-detail">Sin productos</p>
            )}
          </div>

          <div className="order-detail-summary">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>${Number(mesa.totalBill || 0).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Impuesto (8.5%)</span>
              <span>${(Number(mesa.totalBill || 0) * 0.085).toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${(Number(mesa.totalBill || 0) * 1.085).toFixed(2)}</span>
            </div>
          </div>

          {mesa.requiresCleaning && (
            <div className="cleaning-required-badge">
              🧹 Esta mesa requiere limpieza
            </div>
          )}

          <div className="order-detail-actions">
            <button
              className="btn-charge"
              onClick={handleChargeClick}
              disabled={mesa.requiresCleaning}
            >
              {mesa.requiresCleaning ? 'Pagado' : 'Cobrar'}
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          mesa={mesa}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}
