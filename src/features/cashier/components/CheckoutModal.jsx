import { useState } from 'react';
import { paymentsService, ingredientsService } from '../../../services/api/index.js';
import { useProducts } from '../../../contexts/ProductContext';
import '../styles/PaymentModal.css';

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: '' },
  { id: 'tarjeta', label: 'Tarjeta Crédito/Débito', icon: '' },
  { id: 'multiple', label: 'Pago Múltiple', icon: '' }
];

export default function CheckoutModal({ order, onClose, onSuccess }) {
  const { products } = useProducts();
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amount, setAmount] = useState(order.total || 0);
  const [tip, setTip] = useState(0);
  const [cardReference, setCardReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = parseFloat(amount) + parseFloat(tip);
  const change = parseFloat(amount) - parseFloat(order.total || 0);

  const handleTipPercentage = (percentage) => {
    const tipAmount = (order.total * percentage) / 100;
    setTip(tipAmount);
  };

  const handleCheckout = async () => {
    if (!amount || amount < 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detalles_pago = {};
      if (paymentMethod === 'tarjeta' && cardReference) {
        detalles_pago.referencia_tarjeta = cardReference;
      }

      const payment = await paymentsService.processPayment(
        order.id,
        paymentMethod,
        amount,
        tip,
        detalles_pago
      );


      ingredientsService.deductInventory(order.items, products).catch(err => {
        console.error('Inventory deduction delayed error:', err);
      });

      onSuccess(payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Checkout</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-container">
          <div className="payment-methods">
            <h3>Método de Pago</h3>
            <div className="methods-grid">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  className={`method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <span className="method-icon">{method.icon}</span>
                  <span className="method-label">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'tarjeta' && (
            <div className="card-details">
              <label htmlFor="card-ref">Referencia de Tarjeta</label>
              <input
                id="card-ref"
                type="text"
                value={cardReference}
                onChange={(e) => setCardReference(e.target.value)}
                placeholder="Ej: REF-123456"
              />
            </div>
          )}

          <div className="payment-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${(order.subtotal || order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="tip-section">
            <h3>Propina</h3>
            <div className="tip-buttons">
              <button
                className="tip-btn"
                onClick={() => handleTipPercentage(10)}
              >
                10%
              </button>
              <button
                className="tip-btn"
                onClick={() => handleTipPercentage(15)}
              >
                15%
              </button>
              <button
                className="tip-btn"
                onClick={() => handleTipPercentage(20)}
              >
                20%
              </button>
            </div>
            <div className="tip-input">
              <label htmlFor="tip">Propina Personalizada</label>
              <input
                id="tip"
                type="number"
                value={tip}
                onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="payment-amount">
            <label htmlFor="amount">Monto a Pagar</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>

          {paymentMethod === 'efectivo' && change > 0 && (
            <div className="change-info">
              <span>Cambio:</span>
              <span className="change-amount">${change.toFixed(2)}</span>
            </div>
          )}

          <div className="payment-total">
            <span>Total a Cobrar:</span>
            <span className="total-amount">${total.toFixed(2)}</span>
          </div>

          {error && (
            <div className="error-message-alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Procesar Pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
