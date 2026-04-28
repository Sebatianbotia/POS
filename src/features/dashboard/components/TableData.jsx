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
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [isAssigningWaiterToReserved, setIsAssigningWaiterToReserved] = useState(false);
  const [reservedGuests, setReservedGuests] = useState(mesa.guests || '');

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
  const isReserved = state === 'RESERVADA';

  const { openTable, closeTable } = useTableOperations();

  const items = mesa.items || [];

  
  const executeOpenTable = async (guestsNum, waiterInfo, changeStatus = true) => {
    try {
      if (changeStatus) {
        await tablesService.updateTableStatus(id, 'OCUPADA');
      }
      
      if (user?.rol !== 'MESERO') {
        await tablesService.assignWaiter(id, waiterInfo.id);
      }

      if (changeStatus) {
        const updates = openTable(guestsNum, waiterInfo);
        updateMesaState(id, { ...updates, waiter: waiterInfo });
      } else {
        updateMesaState(id, { waiter: waiterInfo });
      }
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
    const changeStatus = !isAssigningWaiterToReserved;
    await executeOpenTable(pendingGuests, { id: selectedWaiter.id, name: selectedWaiter.nombre }, changeStatus);
    setPendingGuests(null);
    setIsAssigningWaiterToReserved(false);
  };

  const handleChangeState = async (newStatus) => {
    try {
      await tablesService.updateTableStatus(id, newStatus);
      
      let updates = {};
      if (newStatus === 'LIBRE') {
        updates = closeTable();
      } else if (newStatus === 'OCUPADA') {
        updates = { state: 'OCUPADA' };
      } else if (newStatus === 'RESERVADA') {
        updates = { state: 'RESERVADA', items: [], totalBill: 0, occupiedMinutes: null };
      }
      
      updateMesaState(id, updates);
      setShowStateSelector(false);
      close();
    } catch (err) {
      console.error('Error changing table state:', err);
      alert(`Error al cambiar estado: ${err.message}`);
    }
  };

  const handleDeleteTable = async () => {
    if (!window.confirm(`¿Eliminar la mesa ${number}?`)) return;
    
    try {
      await tablesService.deleteTable(id);
      updateMesaState(id, { deleted: true });
      close();
    } catch (err) {
      console.error('Error deleting table:', err);
      alert(`Error al eliminar mesa: ${err.message}`);
    }
  };

  const handleSaveReservedGuests = async () => {
    const guestsNum = Number(reservedGuests);
    if (!Number.isFinite(guestsNum) || guestsNum <= 0) {
      alert('Ingresa un número válido de comensales');
      return;
    }

    try {
      updateMesaState(id, { guests: guestsNum });
      close();
    } catch (err) {
      console.error('Error saving reserved guests:', err);
      alert(`Error al guardar comensales: ${err.message}`);
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

            <button className="btn-delete" onClick={handleDeleteTable}>
              Eliminar Mesa
            </button>
          </div>
        )}

        {isReserved && (!waiter || !guests) && (
          <div className="mesa-disponible-panel">
            <button className="close-modal-btn" onClick={close}>✕</button>

            <h2 className="mesa-title">{number}</h2>
            <p style={{ textAlign: 'center', color: 'var(--ios-text-muted)', fontSize: '14px', marginBottom: '20px' }}>Reservada</p>

            {!guests && (
              <>
                <input
                  type="number"
                  placeholder="Número de comensales"
                  className="comensales-input"
                  value={reservedGuests}
                  onChange={(e) => setReservedGuests(e.target.value)}
                  min="1"
                />

                <button className="abrir-btn" onClick={handleSaveReservedGuests}>
                  Guardar Comensales
                </button>
              </>
            )}

            {!waiter && (
              <button className="abrir-btn" onClick={() => {
                setIsAssigningWaiterToReserved(true);
                setShowWaiterPicker(true);
              }}>
                Asignar Mesero
              </button>
            )}

            <button className="btn-delete" onClick={handleDeleteTable}>
              Eliminar Mesa
            </button>
          </div>
        )}

        {(isBusy || isReserved) && (
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

              <button className="btn-change" onClick={() => setShowStateSelector(!showStateSelector)}>
                Cambiar Estado
              </button>
              
              {showStateSelector && (
                <div className="state-selector">
                  <button className="state-option" onClick={() => handleChangeState('LIBRE')}>Disponible</button>
                  <button className="state-option" onClick={() => handleChangeState('RESERVADA')}>Reservada</button>
                  <button className="state-option" onClick={() => handleChangeState('OCUPADA')}>Ocupada</button>
                </div>
              )}
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
            setIsAssigningWaiterToReserved(false);
          }}
        />
      )}
    </>
  );
}
