import { useState } from 'react';
import { ordersService } from '../../../services/api/index.js';
import '../styles/Order.css';

export default function BillSplittingModal({ order, onClose, onSuccess }) {
  const [splitType, setSplitType] = useState('partes_iguales');
  const [numParts, setNumParts] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSplit = async () => {
    if (splitType === 'partes_iguales' && (numParts < 2 || numParts > 10)) {
      setError('Por favor ingresa un número válido entre 2 y 10');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let divisions;
      if (splitType === 'partes_iguales') {
        divisions = await ordersService.splitBill(
          order.id,
          splitType,
          numParts
        );
      } else if (splitType === 'por_monto' || splitType === 'por_item') {
        
        
        const perPart = Math.round((order.total || 0) / numParts);
        const divisiones = Array.from({ length: numParts }, () => ({
          items: [],
          monto: perPart
        }));
        divisions = await ordersService.splitBill(
          order.id,
          splitType,
          null,
          divisiones
        );
      }
      onSuccess(divisions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Dividir Cuenta</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="bill-split-form">
          <div className="current-total">
            <p>Total de la Orden:</p>
            <h3>${(order.total || 0).toFixed(2)}</h3>
          </div>

          <div className="form-group">
            <label htmlFor="split-type">Tipo de División</label>
            <select
              id="split-type"
              value={splitType}
              onChange={(e) => setSplitType(e.target.value)}
            >
              <option value="partes_iguales">Partes Iguales</option>
              <option value="por_monto">Por Monto</option>
              <option value="por_item">Por Item</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="num-parts">Número de Partes</label>
            <input
              id="num-parts"
              type="number"
              min="2"
              max="10"
              value={numParts}
              onChange={(e) => setNumParts(parseInt(e.target.value) || 2)}
            />
          </div>

          {numParts > 0 && splitType === 'partes_iguales' && (
            <div className="split-preview">
              <p className="preview-title">Precio por Parte:</p>
              <h4>${((order.total || 0) / numParts).toFixed(2)}</h4>
            </div>
          )}

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
              onClick={handleSplit}
              disabled={loading}
            >
              {loading ? 'Dividiendo...' : 'Dividir Cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
