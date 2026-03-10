import { useState, useEffect } from 'react';
import { reportsService } from '../../../services/api/reportsService';

export default function SalesReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    tipo: 'por_dia',
  });

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = customFilters || filters;
      const report = await reportsService.getSalesReport(
        filtersToUse.fecha_inicio,
        filtersToUse.fecha_fin,
        filtersToUse.tipo
      );
      setData(report);
    } catch (err) {
      console.error('Error loading sales report:', err);
      setError('Error al cargar el reporte de ventas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchSalesReport(filters);
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    
    alert('Descarga de PDF en desarrollo');
  };

  return (
    <div className="report-section">
      <h2> Reporte de Ventas</h2>

      <div className="report-filters">
        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            name="fecha_inicio"
            value={filters.fecha_inicio}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            name="fecha_fin"
            value={filters.fecha_fin}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Tipo</label>
          <select name="tipo" value={filters.tipo} onChange={handleFilterChange}>
            <option value="por_dia">Por Día</option>
            <option value="por_item">Por Item</option>
            <option value="por_hora">Por Hora</option>
          </select>
        </div>

        <button className="btn-apply-filter" onClick={handleApplyFilters}>
          Aplicar Filtros
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Cargando reporte...</div>}

      {data && !loading && (
        <div className="report-content">
          <div className="report-summary">
            <div className="summary-card">
              <h3>Período</h3>
              <p>
                {data.periodo?.inicio} a {data.periodo?.fin}
              </p>
            </div>

            <div className="summary-card">
              <h3>Total Ventas</h3>
              <p className="amount">${data.total_ventas?.toLocaleString('es-CO') || 0}</p>
            </div>

            <div className="summary-card">
              <h3>Total Órdenes</h3>
              <p>{data.total_ordenes || 0}</p>
            </div>

            <div className="summary-card">
              <h3>Ticket Promedio</h3>
              <p className="amount">${data.ticket_promedio?.toLocaleString('es-CO') || 0}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
