import { useState, useEffect } from 'react';
import { reportsService } from '../../../services/api/reportsService';

export default function InventoryReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventoryReport();
  }, []);

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const report = await reportsService.getInventoryReport();
      setData(report);
    } catch (err) {
      console.error('Error loading inventory report:', err);
      setError('Error al cargar el reporte de inventario. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    
    alert('Descarga de PDF en desarrollo');
  };

  return (
    <div className="report-section">
      <h2> Reporte de Inventario</h2>

      <div className="report-actions">
        <button className="btn-refresh" onClick={fetchInventoryReport} disabled={loading}>
           Actualizar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Cargando reporte...</div>}

      {data && !loading && (
        <div className="report-content">
          <div className="report-summary">
            <div className="summary-card">
              <h3>Valor Total Inventario</h3>
              <p className="amount">
                ${data.valor_total_inventario?.toLocaleString('es-CO') || 0}
              </p>
            </div>

            <div className="summary-card">
              <h3>Items Bajo Stock</h3>
              <p className="alert-number">
                {data.ingredientes_bajo_stock?.length || 0}
              </p>
            </div>
          </div>

          <div className="report-details">
            <h3>Ingredientes Bajo Stock</h3>
            {data.ingredientes_bajo_stock && data.ingredientes_bajo_stock.length > 0 ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Unidad</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ingredientes_bajo_stock.map((item) => (
                    <tr key={item.id} className="low-stock-row">
                      <td>{item.nombre || item.name || 'N/A'}</td>
                      <td>{item.unidad_medida || item.unit_of_measure || 'N/A'}</td>
                      <td>{item.stock_actual || item.stock || 0}</td>
                      <td>{item.stock_minimo || item.minimum_stock || 0}</td>
                      <td>
                        <span className="badge badge-danger">
                           Bajo Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data"> Todos los ingredientes tienen stock adecuado</p>
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
