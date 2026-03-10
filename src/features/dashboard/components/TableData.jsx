import { useState } from 'react';
import '../styles/TableData.css';
import { useTableOperations } from '../../../hooks/useTableOperations';
import { tablesService } from '../../../services/api/index.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import WaiterPickerModal from './WaiterPickerModal.jsx';

export default function TableData({ mesa, updateMesaState, close, setShowOrder }) {
  const [newGuests, setNewGuests] = useState('');
  const [showWaiterPicker, setShowWaiterPicker] = useState(false);
  const [pendingGuests, setPendingGuests] = useState(null);

  const { user } = useAuth();

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

  const isFree = state === 'LIBRE' || state === 'available';
  const isBusy = state === 'OCUPADA';

  const { openTable, closeTable } = useTableOperations();

  const items = mesa.items || [];

  
  const executeOpenTable = async (guestsNum, waiterInfo) => {
    try {
      
      await tablesService.updateTableStatus(id, 'OCUPADA');

      
      
      if (user?.rol !== 'MESERO') {
        await tablesService.assignWaiter(id, waiterInfo.id);
      }

      
      const updates = openTable(guestsNum, waiterInfo);
      updateMesaState(id, { ...updates, waiter: waiterInfo });
      close();
    } catch (err) {
      console.error('Error opening table:', err);
      alert(`Error al abrir la mesa: ${err.message}`);
    }
  };

  
  const handleOpenTable = async () => {
    const guestsNum = Number(newGuests);
    if (!Number.isFinite(guestsNum) || guestsNum <= 0) return;

    if (user?.rol === 'MESERO') {
      
      await executeOpenTable(guestsNum, { id: user.id, name: user.nombre });
    } else {
      
      setPendingGuests(guestsNum);
      setShowWaiterPicker(true);
    }
  };

  
  const handleWaiterSelected = async (selectedWaiter) => {
    setShowWaiterPicker(false);
    await executeOpenTable(pendingGuests, { id: selectedWaiter.id, name: selectedWaiter.nombre });
    setPendingGuests(null);
  };

  
  const handleChangeState = async () => {
    try {
      await tablesService.updateTableStatus(id, 'LIBRE');
      const closedTable = closeTable();
      updateMesaState(id, closedTable);
      close();
    } catch (err) {
      console.error('Error changing table state:', err);
      
      const closedTable = closeTable();
      updateMesaState(id, closedTable);
      close();
    }
  };

  
  const bill = (Number(totalBill ?? 0) || 0);
  const tax = 0;
  const grandTotal = bill;

  return (
    <>
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
                  <span className="mesero"> | Mesero: {waiter?.name ?? '—'}</span>
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
                      <p>${Number(p.precio || p.price || 0).toFixed(2)}</p>
                    </div>
                    <div className="item-qty">x{p.qty}</div>
                    <div className="item-total">
                      ${(Number(p.precio || p.price || 0) * Number(p.qty || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-right">
              <h3 className="resumen-title">Resumen</h3>

              <div className="resumen-info">
                <p><span> Comensales:</span> {guests ?? '—'}</p>
              </div>

              <div className="totales">
                <div className="linea">
                  <span>Subtotal</span>
                  <span>${bill.toFixed(2)}</span>
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
                Añadir a Pedido
              </button>

              <button className="btn-change" onClick={handleChangeState}>
                Cambiar Estado
              </button>
            </div>
          </div>
        )}
      </div>

      {showWaiterPicker && (
        <WaiterPickerModal
          onSelect={handleWaiterSelected}
          onCancel={() => {
            setShowWaiterPicker(false);
            setPendingGuests(null);
          }}
        />
      )}
    </>
  );
}
