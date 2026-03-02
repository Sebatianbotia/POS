import { useState, useMemo } from 'react';
import '../styles/OrdersManagement.css';
import OrderDetailModal from './OrderDetailModal';

export default function OrdersManagement({ mesas, onCharge }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');

  const orders = useMemo(() => {
    return mesas
      .filter(mesa => mesa.state === 'ocupada' && mesa.items)
      .map(mesa => ({
        id: mesa.currentOrderId,
        mesaId: mesa.id,
        status: mesa.orderStatus || 'En progreso',
        createdAt: mesa.orderCreatedAt || new Date()
      }));
  }, [mesas]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'Todos') return orders;
    return orders.filter(order => order.status === filterStatus);
  }, [orders, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso':
        return '#4ea3ff';
      case 'Pendiente':
        return '#fcad40';
      case 'Completado':
        return '#48d17a';
      case 'Listo':
        return '#30b0c0';
      default:
        return '#fff';
    }
  };

  const selectedMesa = selectedOrder
    ? mesas.find(m => m.id === selectedOrder.mesaId)
    : null;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Manejo de pedidos</h1>
        <p className="orders-subtitle">Control de órdenes en tiempo real</p>

        <div className="orders-filters">
          <button
            className={`filter-btn ${filterStatus === 'Todos' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Todos')}
          >
            Todo
          </button>
          <button
            className={`filter-btn ${filterStatus === 'En progreso' ? 'active' : ''}`}
            onClick={() => setFilterStatus('En progreso')}
          >
            En Progreso
          </button>
          <button
            className={`filter-btn ${filterStatus === 'Completado' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Completado')}
          >
            Completado
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <p className="empty-message">No hay órdenes en este estado</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Orden ID</th>
                <th>Mesa</th>
                <th>Mesero</th>
                <th>Total</th>
                <th>Tiempo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const mesa = mesas.find(m => m.id === order.mesaId);
                if (!mesa) return null;

                const total = Number(mesa.totalBill || 0) * 1.085;

                return (
                  <tr key={order.id} className={`order-row ${order.status === 'Completado' ? 'order-completed' : ''}`}>
                    <td className="order-id">#{order.id}</td>
                    <td className="order-table">{mesa.number}</td>
                    <td className="order-waiter">{mesa.waiter?.name || '—'}</td>
                    <td className="order-total">${total.toFixed(2)}</td>
                    <td className="order-time">{mesa.occupiedMinutes || 0} min</td>
                    <td className="order-status">
                      <span
                        className="status-badge"
                        style={{ borderColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="order-actions">
                      <button
                        className="btn-view"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Vista
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && selectedMesa && (
        <OrderDetailModal
          order={selectedOrder}
          mesa={selectedMesa}
          onClose={() => setSelectedOrder(null)}
          onCharge={onCharge}
        />
      )}
    </div>
  );
}
