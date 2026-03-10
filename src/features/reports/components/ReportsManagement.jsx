import { useState } from 'react';
import '../styles/ReportsManagement.css';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import TipsReport from './TipsReport';

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState('ventas');

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Reportes y Análisis</h1>
        <p className="reports-subtitle">Visualiza información detallada sobre ventas, inventario y propinas</p>
      </div>

      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventas')}
        >
           Ventas
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >
           Inventario
        </button>
        <button
          className={`tab-btn ${activeTab === 'propinas' ? 'active' : ''}`}
          onClick={() => setActiveTab('propinas')}
        >
           Propinas
        </button>
      </div>

      <div className="reports-content">
        {activeTab === 'ventas' && <SalesReport />}
        {activeTab === 'inventario' && <InventoryReport />}
        {activeTab === 'propinas' && <TipsReport />}
      </div>
    </div>
  );
}
