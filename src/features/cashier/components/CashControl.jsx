import { useState } from 'react';
import OpenCashModal from './OpenCashModal';
import '../styles/CashControl.css';

export default function CashControl({ transacciones = [], onNewTransaction, onCloseSesion }) {
  const [showOpenModal, setShowOpenModal] = useState(false);

  // Calcular totales
  const totalIngresos = transacciones
    .filter(t => t.tipo === 'INGRESO')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalEgresos = transacciones
    .filter(t => t.tipo === 'EGRESO')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalPagos = transacciones
    .filter(t => t.tipo === 'PAGO')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalEfectivo = transacciones
    .filter(t => t.tipo === 'PAGO' && t.metodoPago === 'EFECTIVO')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalTarjetas = transacciones
    .filter(t => t.tipo === 'PAGO' && (t.metodoPago === 'TARJETA' || t.metodoPago === 'TRANSFERENCIA'))
    .reduce((sum, t) => sum + t.monto, 0);

  const totalPropinas = transacciones
    .filter(t => t.tipo === 'PAGO')
    .reduce((sum, t) => sum + (t.propina || 0), 0);

  const cajaTotal = totalPagos + totalIngresos - totalEgresos;

  const handleOpenCash = (data) => {
    onNewTransaction({
      ...data,
      tipo: data.tipo === 'ADMINISTRATIVA' ? 'EGRESO' : data.tipo
    });
    setShowOpenModal(false);
  };

  return (
    <div className="cash-control-container">
      <div className="cash-header">
        <h1 className="cash-title">Control de Caja</h1>
        <button className="close-shift-btn" onClick={onCloseSesion}>
          Cerrar Turno
        </button>
      </div>

      {/* Estadísticas */}
      <div className="cash-stats">
        <div className="stat-card">
          <p className="stat-label">Ventas Totales</p>
          <p className="stat-value">${totalPagos.toLocaleString()}</p>
          <span className="stat-icon">💵</span>
        </div>
        <div className="stat-card">
          <p className="stat-label">Efectivo en Caja</p>
          <p className="stat-value">${cajaTotal.toLocaleString()}</p>
          <span className="stat-icon">🏦</span>
        </div>
        <div className="stat-card">
          <p className="stat-label">Tarjetas (TDC/TDD)</p>
          <p className="stat-value">${totalTarjetas.toLocaleString()}</p>
          <span className="stat-icon">💳</span>
        </div>
        <div className="stat-card">
          <p className="stat-label">Otros / Propinas</p>
          <p className="stat-value">${totalPropinas.toLocaleString()}</p>
          <span className="stat-icon">🎁</span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="cash-actions">
        <button 
          className="action-btn ingreso"
          onClick={() => setShowOpenModal(true)}
        >
          Abrir Caja
        </button>
      </div>

      {/* Tabla de Transacciones */}
      <div className="transactions-section">
        <h2 className="section-title">Transacciones Recientes</h2>
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>HORA</th>
                <th>MESA</th>
                <th>METODO</th>
                <th>MONTO</th>
                <th>TIPO</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.length > 0 ? (
                transacciones.map((t, idx) => (
                  <tr key={idx}>
                    <td>{`#TRX-${String(9999 - idx).padStart(4, '0')}`}</td>
                    <td>{new Date(t.fecha).toLocaleTimeString('es-CO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</td>
                    <td>{t.mesaId ? `Mesa ${t.mesa?.number || t.mesaId}` : '-'}</td>
                    <td>{t.metodoPago || t.tipo}</td>
                    <td>${t.monto.toLocaleString()}</td>
                    <td>
                      <span className={`tipo-badge ${t.tipo.toLowerCase()}`}>
                        {t.tipo === 'PAGO' ? 'Ingreso' : t.tipo === 'EGRESO' ? 'Egreso' : 'Ingreso'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    Sin transacciones aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Abrir Caja */}
      {showOpenModal && (
        <OpenCashModal
          onClose={() => setShowOpenModal(false)}
          onOpen={handleOpenCash}
        />
      )}
    </div>
  );
}
