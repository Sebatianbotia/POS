import { useState, useMemo } from 'react';
import '../styles/OrdersManagement.css';
import OrderDetailModal from './OrderDetailModal';

const STATUS_LABELS = {
  'Abierta': { color: '#fcad40', bg: 'rgba(252,173,64,0.12)' },
  'Enviada': { color: '#4ea3ff', bg: 'rgba(78,163,255,0.12)' },
  'Lista': { color: '#48d17a', bg: 'rgba(72,209,122,0.12)' },
  'Completado': { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'Cancelada': { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

const ALL_FILTERS = ['Todos', 'Abierta', 'Enviada', 'Lista', 'Completado'];

export default function OrdersManagement({ mesas, onCharge, userRole, onRefreshMesas }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const canCharge = userRole === 'PROPIETARIO' || userRole === 'CAJERO';

  const orders = useMemo(() => {
    return mesas
      .filter(mesa => (mesa.state === 'OCUPADA' || mesa.orderEstado === 'pagada') && mesa.currentOrderId)
      .map(mesa => ({
        id: mesa.currentOrderId,
        mesaId: mesa.id,
        status: mesa.orderStatus || 'Abierta',
        orderEstado: mesa.orderEstado || 'abierta',
        createdAt: mesa.orderCreatedAt || new Date()
      }));
  }, [mesas]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'Todos') return orders;
    return orders.filter(order => order.status === filterStatus);
  }, [orders, filterStatus]);

  const selectedMesa = selectedOrder
    ? mesas.find(m => m.id === selectedOrder.mesaId)
    : null;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Manejo de pedidos</h1>
        <p className="orders-subtitle">Control de órdenes en tiempo real</p>

        <div className="orders-filters">
          {ALL_FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${filterStatus === f ? 'active' : ''}`}
              onClick={() => setFilterStatus(f)}
            >
              {f}
            </button>
          ))}
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const mesa = mesas.find(m => m.id === order.mesaId);
                if (!mesa) return null;

                const total = (Number(mesa.totalBill) || 0) * 1.19;
                const statusStyle = STATUS_LABELS[order.status] || { color: '#fff', bg: 'transparent' };

                return (
                  <tr key={order.id} className="order-row">
                    <td className="order-id">#{order.id}</td>
                    <td className="order-table">{mesa.number}</td>
                    <td className="order-waiter">{mesa.waiter?.name || '—'}</td>
                    <td className="order-total">${total.toFixed(2)}</td>
                    <td className="order-status">
                      <span
                        className="status-badge"
                        style={{
                          color: statusStyle.color,
                          background: statusStyle.bg,
                          borderColor: statusStyle.color
                        }}
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
          canCharge={canCharge}
          onOrderUpdate={onRefreshMesas}
        />
      )}
    </div>
  );
}
