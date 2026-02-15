import { useState } from 'react';
import '../styles/component_style/TableData.css';
import { useTableOperations } from '../hooks/useTableOperations';

export default function TableData({ mesa, updateMesaState, close, setShowOrder }) {
  const [newGuests, setNewGuests] = useState("");

  const {
    id,
    number,
    state,
    waiter,
    guests,
    occupiedMinutes,
    totalBill,
    currentOrderId
  } = mesa;

  const isFree = state === "disponible";
  const isBusy = state === "ocupada";

  const username = localStorage.getItem('axon_client_name') || 'Usuario';
  const userId = localStorage.getItem('userId') || 'unknown';

  const { openTable, closeTable } = useTableOperations();

  const items = mesa.items || [];

  const handleOpenTable = () => {
    const guestsNum = Number(newGuests);
    if (!Number.isFinite(guestsNum) || guestsNum <= 0) return;

    const updates = openTable(guestsNum, {
      id: userId,
      name: username
    });

    updateMesaState(id, updates);

    close();
  };

  const handleChangeState = () => {
    const closedTable = closeTable();
    updateMesaState(id, closedTable);
    close();
  };

  const bill = Number(totalBill ?? 0);
  const tax = bill * 0.10;
  const grandTotal = bill + tax;

  return (
    <div className="tabledata-container">
      {isFree && (
        <div className="mesa-disponible-panel">
          <button className="close-modal-btn" onClick={close}>✕</button>

          <h2 className="mesa-title">{number}</h2>

          <input
            type="number"
            placeholder="Número de comensales"
            className="comensales-input"
            value={newGuests}
            onChange={(e) => setNewGuests(e.target.value)}
            min="1"
          />

          <button className="abrir-btn" onClick={handleOpenTable}>
            Abrir Mesa
          </button>
        </div>
      )}

      {isBusy && (
        <div className="tabledata-wrapper">
          <button className="close-modal-btn close-anim" onClick={close}>✕</button>

          <div className="panel-left">
            <div className="panel-left-header">
              <h2 className="mesa-title">{number}</h2>
              <p className="order-id">Pedido #{currentOrderId}</p>

              <div className="estado-info">
                <span className="estado-dot ocupado"></span>
                Ocupada
                <span className="mesero"> | Mesero: {waiter?.name ?? "—"}</span>
              </div>
            </div>

            <div className="items-list">
              {items.length === 0 && (
                <p className="empty-items">Sin productos en el pedido.</p>
              )}

              {items.map((p) => (
                <div key={p.id} className="item-card">
                  <div className="item-info">
                    <h4>{p.name}</h4>
                    <p>${Number(p.price).toFixed(2)}</p>
                  </div>
                  <div className="item-qty">x{p.qty}</div>
                  <div className="item-total">
                    ${(Number(p.price) * Number(p.qty)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-right">
            <h3 className="resumen-title">Resumen</h3>

            <div className="resumen-info">
              <p><span>👥 Comensales:</span> {guests ?? "—"}</p>
              <p><span>⏱️ Tiempo:</span> {occupiedMinutes ?? 0} min</p>
            </div>

            <div className="totales">
              <div className="linea">
                <span>Subtotal</span>
                <span>${bill.toFixed(2)}</span>
              </div>
              <div className="linea">
                <span>Impuestos (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="total-final">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
            className="btn-add"
            onClick={() => setShowOrder(true)}
            >
            ➕ Añadir a Pedido
            </button>

            <button className="btn-print">🧾 Imprimir Cuenta</button>
            <button className="btn-change" onClick={handleChangeState}>
              🔄 Cambiar Estado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}