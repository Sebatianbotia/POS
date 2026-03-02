import { useEffect, useState } from 'react';
import '../styles/TablePanel.css';
import TableCard from './TableCard';
import TableData from './TableData';
import { tables } from '../../../services/tableService';
import AddTableModal from '../../table-management/components/AddTableModal';
import Order from '../../order/components/Order';
import { useTableOperations } from '../../../hooks/useTableOperations'; 



export default function TablePanel({ mesas: propMesas, setMesas: setPropMesas }) {
  
    const [selectedTableId, setSelectedTableId] = useState(null);  
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    
    const [localMesas, setLocalMesas] = useState(() =>
      tables.map(table => ({
        ...table,
        items: null,
        orderStatus: null,
        orderCreatedAt: null
      }))
    );

    const mesas = propMesas !== undefined ? propMesas : localMesas;
    const setMesas = setPropMesas !== undefined ? setPropMesas : setLocalMesas;
    
    useEffect(() => {
      const interval = setInterval(() => {
        setMesas(prevMesas =>
          prevMesas.map(mesa => {
            if (mesa.state === "ocupada" && mesa.occupiedMinutes !== null) {
              return {
                ...mesa,
                occupiedMinutes: mesa.occupiedMinutes + 1
              };
            }
            return mesa;
          })
        );
      }, 60000); 

      return () => clearInterval(interval);
    }, [setMesas]);
    
  const selectedTable = mesas.find(m => m.id === selectedTableId) || null;
  const { updateTableItems } = useTableOperations();

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
      items: null,
      orderStatus: null,
      orderCreatedAt: null
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
    setMesas(prevMesas => {
      const updatedMesas = updateTableItems(tableId, newItems, prevMesas);
      
      return updatedMesas.map(mesa => {
        if (mesa.id === tableId && mesa.items && mesa.items.length > 0) {
          return {
            ...mesa,
            orderStatus: mesa.orderStatus || 'En progreso',
            orderCreatedAt: mesa.orderCreatedAt || new Date()
          };
        }
        return mesa;
      });
    });
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

        </div>
      </div>

      <h2 className="room-title">Salón Principal</h2>

      <div className="tables-grid">
        {mesas.map((mesa) => (
          <TableCard
            key={mesa.id}
            mesa={mesa}
            updateMesaState={updateMesaState}
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
              key={`order-${selectedTable.id}`}
              mesa={selectedTable}
              close={() => {
                setShowOrder(false);
              }}
              addItemsToTable={(items) => handleAddItemsToTable(selectedTable.id, items)}
            />
          </div>
        )}
    </div>
  );
}
