import { useState, useEffect } from 'react';
import { reportsService } from '../../../services/api/reportsService';

export default function TipsReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTipsReport();
  }, []);

  const fetchTipsReport = async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = customFilters || filters;
      const report = await reportsService.getTipsReport(
        filtersToUse.fecha_inicio,
        filtersToUse.fecha_fin
      );
      setData(report);
    } catch (err) {
      console.error('Error loading tips report:', err);
      setError('Error al cargar el reporte de propinas. Intenta nuevamente.');
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
    fetchTipsReport(filters);
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    
    alert('Descarga de PDF en desarrollo');
  };

  const totalTips = data?.reduce((sum, item) => sum + (item.total_propinas || 0), 0) || 0;

  return (
    <div className="report-section">
      <h2> Reporte de Propinas</h2>

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
                {filters.fecha_inicio} a {filters.fecha_fin}
              </p>
            </div>

            <div className="summary-card">
              <h3>Total Propinas</h3>
              <p className="amount">
                ${totalTips.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="summary-card">
              <h3>Meseros con Propinas</h3>
              <p>{data?.length || 0}</p>
            </div>
          </div>

          <div className="report-details">
            <h3>Propinas por Mesero</h3>
            {data && data.length > 0 ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Mesero</th>
                    <th>Órdenes</th>
                    <th>Total Propinas</th>
                    <th>Propina Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const promedio =
                      item.numero_ordenes > 0
                        ? Math.round(item.total_propinas / item.numero_ordenes)
                        : 0;
                    return (
                      <tr key={item.mesero_id}>
                        <td>{item.mesero_nombre || item.waiter_name || 'N/A'}</td>
                        <td>{item.numero_ordenes || 0}</td>
                        <td>${item.total_propinas?.toLocaleString('es-CO') || 0}</td>
                        <td>${promedio.toLocaleString('es-CO')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No hay datos de propinas para este período</p>
            )}
          </div>

          <button className="btn-download" onClick={handleDownloadPDF}>
             Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}
