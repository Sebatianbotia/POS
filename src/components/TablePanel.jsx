import { useEffect, useState } from 'react';
import '../styles/component_style/TablePanel.css';
import TableCard from './TableCard';
import TableData from './TableData';
import { tables } from '../services/tableService';
import AddTableModal from './admin/AddTableModal';
import Order from './Order';
import { useTableOperations } from '../hooks/useTableOperations'; 



export default function TablePanel() {
  
    const [selectedTableId, setSelectedTableId] = useState(null);  
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    
    const [mesas, setMesas] = useState(
      tables.map(table => ({
        ...table,
        items: null
      }))
    );
    
    
    
  const selectedTable = mesas.find(m => m.id === selectedTableId) || null;
  const { addItemsToTable } = useTableOperations();

  function createMesa(newMesa) {
    const mesaConFormato = {
      id: Date.now(),
      number: newMesa.number,
      state: "disponible",
      waiter: null,
      guests: null,
      occupiedMinutes: null,
      totalBill: null,
      currentOrderId: null,
      items: null 
    };

    setMesas(prev => [...prev, mesaConFormato]);
    setShowAddModal(false);
  }

  function closeModal() {
    setSelectedTableId(null);
  }

  function updateMesaState(id, newData) {
    setMesas(prev =>
        prev.map(m => m.id === id ? { ...m, ...newData } : m)
    );
  }

  function handleAddItemsToTable(tableId, newItems) {
    setMesas(prevMesas => addItemsToTable(tableId, newItems, prevMesas));
  }

  return (
    <div className="admin-container">

      <div className="admin-header">
        <h1 className="admin-title">Gestión de Mesas</h1>
        <p className="admin-subtitle">Vista general del estado del salón.</p>

        <div className="admin-filters">
          <button className="filter-btn active">Todas</button>
          <button className="filter-btn green">Disponibles</button>
          <button className="filter-btn blue">Ocupadas</button>
          <button className="filter-btn yellow">Sucias</button>
        </div>
        <div className='table-actions'>
          <button className="add-table-btn" onClick={() => setShowAddModal(true)}>
            <span className="plus">＋</span> Agregar Mesa
          </button> 
          <button className="join-tables-btn">
            <span className="plus">🔗</span>  Unir Mesas
          </button> 
        </div>
      </div>

      <h2 className="room-title">Salón Principal</h2>

      <div className="tables-grid">
        {mesas.map((mesa) => (
          <TableCard
            key={mesa.id}
            mesa={mesa}
            setSelected={setSelectedTableId}
          />
        ))}
      </div>
      {selectedTable && !showOrder && (
        <div className="tabledata-overlay">
          <TableData
            key={selectedTableId}
            mesa={selectedTable}
            updateMesaState={updateMesaState}
            close={closeModal}
            setShowOrder={setShowOrder}
          />
        </div>
      )}
      {showAddModal && (
        <AddTableModal
          close={() => setShowAddModal(false)}
          onCreate={createMesa}
        />
      )}
      {showOrder && selectedTable && (
          <div className="tabledata-overlay">
            <Order
              key={selectedTableId} 
              mesa={selectedTable}
              close={() => setShowOrder(false)}
              addItemsToTable={(items) => handleAddItemsToTable(selectedTable.id, items)}
            />
          </div>
        )}
    </div>
  );
}
