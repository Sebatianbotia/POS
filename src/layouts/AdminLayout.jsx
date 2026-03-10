import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../features/sidebar/components/Sidebar';
import TablePanel from '../features/dashboard/components/TablePanel';
import OrdersManagement from '../features/orders/components/OrdersManagement';
import CashControl from '../features/cashier/components/CashControl';
import TerminalSelector from '../features/cashier/components/TerminalSelector';
import TerminalsManagement from '../features/cashier/components/TerminalsManagement';
import MenuManagement from '../features/menu/components/MenuManagment';
import PersonnelManagement from '../features/personnel/components/PersonnelManagement';
import ReportsManagement from '../features/reports/components/ReportsManagement';
import IngredientsManagement from '../features/ingredients/components/IngredientsManagement';
import SedesManagement from '../features/sedes/components/SedesManagement';
import { useAuth } from '../contexts/AuthContext';
import { tablesService, ordersService, menuService } from '../services/api/index.js';
import '../styles/layouts/AdminLayout.css';
import { useNavigate } from 'react-router-dom';


const STATUS_MAP = {
  abierta: 'Abierta',
  enviada: 'Enviada',
  en_preparacion: 'En preparación',
  lista: 'Lista',
  pagada: 'Completado',
  cancelada: 'Cancelada'
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout, currentSede, changeSede, currentTerminal, changeTerminal, loadTerminals } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [loadingMesas, setLoadingMesas] = useState(true);
  const [transacciones, setTransacciones] = useState([]);
  const [showTerminalSelector, setShowTerminalSelector] = useState(false);

  
  const getAccessibleSections = () => {
    if (!user?.rol) return [];

    const allRoles = {
      mesas: ['PROPIETARIO', 'CAJERO', 'MESERO'],
      pedidos: ['PROPIETARIO', 'CAJERO', 'MESERO'],
      menu: ['PROPIETARIO', 'CAJERO'],
      caja: ['PROPIETARIO', 'CAJERO'],
      terminales: ['PROPIETARIO'],
      ingredientes: ['PROPIETARIO'],
      personal: ['PROPIETARIO'],
      reportes: ['PROPIETARIO'],
      sedes: ['PROPIETARIO']
    };

    return Object.entries(allRoles).reduce((acc, [section, roles]) => {
      if (roles.includes(user.rol)) {
        acc.push(section);
      }
      return acc;
    }, []);
  };

  const accessibleSections = getAccessibleSections();

  const [currentSection, setCurrentSection] = useState(
    accessibleSections.includes('mesas') ? 'mesas' : 'pedidos'
  );

  useEffect(() => {
    if (user && !currentTerminal) {
      if (user.rol === 'PROPIETARIO' || user.rol === 'CAJERO') {
        setShowTerminalSelector(true);
      }
    }
  }, [user, currentTerminal]);

  useEffect(() => {
    if (!accessibleSections.includes(currentSection)) {
      const fallbackSection = accessibleSections.includes('mesas') ? 'mesas' : accessibleSections[0];
      setCurrentSection(fallbackSection);
    }
  }, [user?.rol]);

  const loadMesas = useCallback(async () => {
    const token = localStorage.getItem('axon_token');
    if (!token) {
      console.warn('No authentication token found');
      return;
    }

    try {
      setLoadingMesas(true);
      const [rawTables, menuItems] = await Promise.all([
        tablesService.getAllTables(),
        menuService.getMenu().catch(err => {
          console.error("No se pudo cargar el menú completo de soporte:", err);
          return [];
        })
      ]);

      const hydratedTables = await Promise.all(
        (rawTables || []).map(async (table) => {
          const mesa = {
            id: table.id,
            number: table.number,
            capacity: table.capacity,
            state: table.state || 'LIBRE',
            waiter: null,
            guests: null,
            occupiedMinutes: null,
            totalBill: null,
            currentOrderId: null,
            items: null,
            orderStatus: null,
            orderEstado: null,
            orderCreatedAt: null
          };

          if (table.arrival_time && mesa.state === 'OCUPADA') {
            const arrival = new Date(table.arrival_time);
            mesa.occupiedMinutes = Math.max(0, Math.round((Date.now() - arrival.getTime()) / 60000));
          }
          if (mesa.state === 'OCUPADA') {
            try {
              const orders = await ordersService.getOrdersByTable(mesa.id);
              const activeOrderSummary = Array.isArray(orders)
                ? orders.find(o => !['pagada', 'cancelada'].includes(o.estado))
                : (orders?.estado && !['pagada', 'cancelada'].includes(orders.estado) ? orders : null);

              if (activeOrderSummary) {
                let fullOrder = activeOrderSummary;
                try {
                  fullOrder = await ordersService.getOrderById(activeOrderSummary.id);
                } catch (e) {
                  console.warn('Could not fetch full order, using summary:', e.message);
                }

                mesa.currentOrderId = fullOrder.id;
                mesa.orderEstado = fullOrder.estado || 'abierta';
                mesa.orderStatus = STATUS_MAP[fullOrder.estado] || 'Abierta';
                mesa.orderCreatedAt = fullOrder.fecha_creacion || null;
                mesa.totalBill = fullOrder.subtotal ?? null;

                if (Array.isArray(fullOrder.items) && fullOrder.items.length > 0) {
                  mesa.items = fullOrder.items.map(item => {
                    const realProduct = menuItems.find(m => m.id === (item.menu_item_id || item.id));
                    return {
                      order_item_id: item.id,
                      id: item.menu_item_id || item.id,
                      name: item.nombre || item.name || realProduct?.nombre || realProduct?.name || `Item #${item.menu_item_id || item.id}`,
                      price: Number(item.precio_unitario ?? item.precio ?? item.price ?? realProduct?.sales_price ?? realProduct?.precio ?? 0),
                      qty: Number(item.cantidad ?? item.qty ?? 1)
                    };
                  });
                }

                if (fullOrder.mesero_id) {
                  mesa.waiter = { id: fullOrder.mesero_id, name: null };
                }
              }
            } catch (err) {
              console.warn(`Could not hydrate orders for table ${mesa.id}:`, err.message);
            }

            try {
              const assignments = await tablesService.getTableAssignments(mesa.id);
              const active = Array.isArray(assignments)
                ? assignments.find(a => !a.desasignado_en)
                : null;
              if (active) {
                mesa.waiter = {
                  id: active.user_id,
                  name: active.nombre_mesero || mesa.waiter?.name || null
                };
              }
            } catch (err) {
              console.warn(`Could not hydrate assignments for table ${mesa.id}:`, err.message);
            }
          }

          return mesa;
        })
      );

      setMesas(hydratedTables);
    } catch (err) {
      console.error('Error loading tables:', err);
      if (err.message?.includes('401')) {
        logout();
        navigate('/auth');
      }
    } finally {
      setLoadingMesas(false);
    }
  }, [currentSede, logout, navigate]);

  useEffect(() => {
    loadMesas();
  }, [loadMesas]);

  const nombreUsuario = user?.nombre || localStorage.getItem('axon_client_name') || 'Usuario'

  function closeSesion() {
    logout();
    navigate('/auth');
  }

  const handleChangeSede = (sede) => {
    changeSede(sede);
    setCurrentSection('mesas');
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
            state: 'LIBRE',
            orderStatus: 'Completado',
            orderEstado: 'pagada',
            waiter: null,
            guests: 0,
            totalBill: 0,
            items: null,
            occupiedMinutes: 0
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
        restaurante={currentSede?.nombre}
        name={nombreUsuario}
        onClose={closeSesion}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onChangeSede={handleChangeSede}
      />
      <div className="admin-content">
        {currentSection === 'mesas' && accessibleSections.includes('mesas') && (
          <TablePanel mesas={mesas} setMesas={setMesas} />
        )}
        {currentSection === 'pedidos' && accessibleSections.includes('pedidos') && (
          <OrdersManagement
            mesas={mesas}
            onCharge={handlePayment}
            userRole={user?.rol}
            onRefreshMesas={loadMesas}
          />
        )}
        {currentSection === 'caja' && accessibleSections.includes('caja') && (
          <CashControl
            transacciones={transacciones}
            onNewTransaction={handleNewTransaction}
            onCloseSesion={closeSesion}
          />
        )}
        {currentSection === 'menu' && accessibleSections.includes('menu') && (
          <MenuManagement userRole={user?.rol} />
        )}
        {currentSection === 'ingredientes' && accessibleSections.includes('ingredientes') && (
          <IngredientsManagement />
        )}
        {currentSection === 'personal' && accessibleSections.includes('personal') && (
          <PersonnelManagement />
        )}
        {currentSection === 'reportes' && accessibleSections.includes('reportes') && (
          <ReportsManagement />
        )}
        {currentSection === 'sedes' && accessibleSections.includes('sedes') && (
          <SedesManagement />
        )}
        {currentSection === 'terminales' && accessibleSections.includes('terminales') && (
          <TerminalsManagement />
        )}
      </div>

      {showTerminalSelector && (
        <TerminalSelector
          onTerminalSelected={() => {
            setShowTerminalSelector(false);
            loadTerminals();
          }}
        />
      )}
    </div> 
  );       
}
