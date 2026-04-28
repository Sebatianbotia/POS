import { useEffect, useState } from 'react';
import '../styles/TablePanel.css';
import TableCard from './TableCard';
import TableData from './TableData';
import { tablesService } from '../../../services/api/index.js';
import AddTableModal from '../../table-management/components/AddTableModal';
import Order from '../../order/components/Order';
import { useTableOperations } from '../../../hooks/useTableOperations';



export default function TablePanel({ mesas: propMesas, setMesas: setPropMesas }) {

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [localMesas, setLocalMesas] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [filterState, setFilterState] = useState('todas');

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoadingTables(true);
        const data = await tablesService.getAllTables();

        setLocalMesas(data || []);
      } catch (err) {
        console.error('Error loading tables:', err);
      } finally {
        setLoadingTables(false);
      }
    };
    if (!propMesas) {
      loadTables();
    }
  }, [propMesas]);

  const mesas = propMesas !== undefined ? propMesas : localMesas;
  const setMesas = setPropMesas !== undefined ? setPropMesas : setLocalMesas;

  useEffect(() => {
    const interval = setInterval(() => {
      setMesas(prevMesas =>
        prevMesas.map(mesa => {
          if (mesa.state === "OCUPADA" && mesa.occupiedMinutes !== null) {
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
      numero: parseInt(newMesa.number),
      capacidad: parseInt(newMesa.capacity)
    };

    
    tablesService.createTable(mesaConFormato.numero, mesaConFormato.capacidad)
      .then((response) => {
        
        const mesaFromApi = {
          id: response.id,
          number: response.number || mesaConFormato.numero,
          capacity: response.capacity || mesaConFormato.capacidad,
          state: response.state || 'LIBRE',
          waiter: null,
          guests: null,
          occupiedMinutes: null,
          totalBill: null,
          currentOrderId: null,
          items: null,
          orderStatus: null,
          orderCreatedAt: null
        };

        setMesas(prev => [...prev, mesaFromApi]);
        setShowAddModal(false);
      })
      .catch((error) => {
        console.error('Error creating table:', error);
        alert('Error al crear la mesa. Por favor intenta de nuevo.');
      });
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

  const filteredMesas = mesas
    .filter(mesa => !mesa.deleted)
    .filter(mesa => {
      if (filterState === 'todas') return true;
      if (filterState === 'disponibles') return mesa.state === 'LIBRE' || mesa.state === 'available';
      if (filterState === 'ocupadas') return mesa.state === 'OCUPADA';
      if (filterState === 'reservadas') return mesa.state === 'RESERVADA';
      return true;
    });

  return (
    <div className="admin-container">

      <div className="admin-header">
        <h1 className="admin-title">Gestión de Mesas</h1>
        <p className="admin-subtitle">Vista general del estado del salón.</p>

        <div className="admin-filters">
          <button 
            className={`filter-btn ${filterState === 'todas' ? 'active' : ''}`}
            onClick={() => setFilterState('todas')}
          >
            Todas
          </button>
          <button 
            className={`filter-btn green ${filterState === 'disponibles' ? 'active' : ''}`}
            onClick={() => setFilterState('disponibles')}
          >
            Disponibles
          </button>
          <button 
            className={`filter-btn blue ${filterState === 'ocupadas' ? 'active' : ''}`}
            onClick={() => setFilterState('ocupadas')}
          >
            Ocupadas
          </button>
          <button 
            className={`filter-btn yellow ${filterState === 'reservadas' ? 'active' : ''}`}
            onClick={() => setFilterState('reservadas')}
          >
            Reservadas
          </button>
        </div>
        <div className='table-actions'>
          <button className="add-table-btn" onClick={() => setShowAddModal(true)}>
            <span className="plus">＋</span> Agregar Mesa
          </button>

        </div>
      </div>

      <h2 className="room-title">Salón Principal</h2>

      <div className="tables-grid">
        {filteredMesas.map((mesa) => (
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
            updateMesaState={updateMesaState}
            addItemsToTable={(items) => handleAddItemsToTable(selectedTable.id, items)}
          />
        </div>
      )}
    </div>
  );
}
