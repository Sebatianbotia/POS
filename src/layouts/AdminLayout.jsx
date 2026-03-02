import { useState } from 'react';
import Sidebar from '../features/sidebar/components/Sidebar';
import TablePanel from '../features/dashboard/components/TablePanel';
import OrdersManagement from '../features/orders/components/OrdersManagement';
import CashControl from '../features/cashier/components/CashControl';
import MenuManagement from '../features/menu/components/MenuManagment';
import '../styles/layouts/AdminLayout.css';
import { useNavigate } from 'react-router-dom';
import { tables } from '../services/tableService';

export default function AdminLayout() {
    const navigate = useNavigate();
    const [currentSection, setCurrentSection] = useState('mesas');
    const [mesas, setMesas] = useState(() => {
      return tables.map(table => ({
        ...table,
        items: null,
        orderStatus: null,
        orderCreatedAt: null
      }));
    });
    const [transacciones, setTransacciones] = useState([]);

    const restaurante = localStorage.getItem('restaurante') || 'Sin nombre'
    const nombre = localStorage.getItem('axon_client_name') || 'Usuario'

    function closeSesion(){
      localStorage.clear();
      navigate('/auth');
    }

    function handlePayment(paymentData) {
      const transaccion = {
        id: transacciones.length + 1,
        mesaId: paymentData.mesaId,
        mesa: mesas.find(m => m.id === paymentData.mesaId),
        monto: paymentData.monto,
        propina: paymentData.propina,
        metodoPago: paymentData.metodoPago,
        fecha: paymentData.fecha,
        tipo: 'PAGO'
      };

      setTransacciones(prev => [...prev, transaccion]);

      setMesas(prevMesas =>
        prevMesas.map(mesa =>
          mesa.id === paymentData.mesaId
            ? {
                ...mesa,
                state: 'ocupada',
                orderStatus: 'Completado',
                requiresCleaning: true
              }
            : mesa
        )
      );
    }

    function handleNewTransaction(transaction) {
      setTransacciones(prev => [...prev, transaction]);
    }

  return (
    <div className="admin-layout">
      <Sidebar 
        restaurante={restaurante} 
        name={nombre} 
        onClose={closeSesion}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      <div className="admin-content">
        {currentSection === 'mesas' && (
          <TablePanel mesas={mesas} setMesas={setMesas} />
        )}
        {currentSection === 'pedidos' && (
          <OrdersManagement 
            mesas={mesas} 
            onCharge={handlePayment}
          />
        )}
        {currentSection === 'caja' && (
          <CashControl 
            transacciones={transacciones}
            onNewTransaction={handleNewTransaction}
            onCloseSesion={closeSesion}
          />
        )}
        {currentSection === 'menu' && (
          <MenuManagement/>
        )}
      </div>
    </div>
  );
}
