import { useState } from 'react';
import '../styles/OpenCashModal.css';

export default function OpenCashModal({ onClose, onOpen }) {
  const [tipoOperacion, setTipoOperacion] = useState('ADMINISTRATIVA');
  const [monto, setMonto] = useState(0);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setError('');

    if (monto <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    onOpen({
      tipo: tipoOperacion,
      monto: monto,
      fecha: new Date(),
      descripcion: `${tipoOperacion} - $${monto.toLocaleString()}`
    });

    setMonto(0);
    onClose();
  };

  return (
    <div className="open-cash-modal-overlay" onClick={onClose}>
      <div className="open-cash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Abrir Caja</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Tipo de Operación */}
          <div className="operation-type-section">
            <label>Tipo de Operación</label>
            <div className="operation-buttons">
              <button
                className={`operation-btn ${tipoOperacion === 'ADMINISTRATIVA' ? 'active' : ''}`}
                onClick={() => setTipoOperacion('ADMINISTRATIVA')}
              >
                👤 ADMINISTRATIVA
              </button>
              <button
                className={`operation-btn ${tipoOperacion === 'RETIRO' ? 'active' : ''}`}
                onClick={() => setTipoOperacion('RETIRO')}
              >
                💸 RETIRO
              </button>
              <button
                className={`operation-btn ${tipoOperacion === 'INGRESO' ? 'active' : ''}`}
                onClick={() => setTipoOperacion('INGRESO')}
              >
                💰 INGRESO
              </button>
            </div>
          </div>

          <div className="amount-input-section">
            <label>Monto</label>
            <div className="amount-input-group">
              <span className="currency">$</span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="amount-input"
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="operation-info">
            <p>Tipo: <strong>{tipoOperacion}</strong></p>
            <p>Monto: <strong>${monto.toLocaleString()}</strong></p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleOpen}>
            Abrir Caja
          </button>
        </div>
      </div>
    </div>
  );
}
