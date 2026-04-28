import { useState, useEffect } from 'react';
import { terminalesService } from '../../../services/api/index.js';
import '../styles/TerminalsManagement.css';


export default function TerminalsManagement() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTerminals();
  }, []);

  const loadTerminals = async () => {
    try {
      setLoading(true);
      const data = await terminalesService.getAllTerminals();
      setTerminals(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading terminals:', err);
      setError(`Error al cargar terminales: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerminal = () => {
    setEditingTerminal(null);
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const handleEditTerminal = (terminal) => {
    setEditingTerminal(terminal);
    setFormData({ nombre: terminal.nombre });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTerminal(null);
    setFormData({ nombre: '' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.nombre.trim()) {
        setError('El nombre de la terminal es requerido');
        return;
      }

      if (editingTerminal) {
        
        await terminalesService.updateTerminal(editingTerminal.id, {
          nombre: formData.nombre
        });
      } else {
        
        await terminalesService.createTerminal(formData.nombre);
      }

      await loadTerminals();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving terminal:', err);
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTerminal = async (terminal) => {
    try {
      setSubmitting(true);
      await terminalesService.updateTerminal(terminal.id, {
        activo: !terminal.activo
      });
      await loadTerminals();
    } catch (err) {
      console.error('Error toggling terminal:', err);
      setError(`Error al cambiar estado: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTerminal = async (terminalId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta terminal?')) return;

    setSubmitting(true);
    try {
      await terminalesService.deleteTerminal(terminalId);
      await loadTerminals();
      setError(null);
    } catch (err) {
      console.error('Error deleting terminal:', err);
      if (err.status === 404) {
        setError('No se pudo encontrar la terminal para eliminarla. Intenta recargando.');
      } else {
        setError(`Error al eliminar: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="terminals-container">
      <div className="terminals-header">
        <h1 className="terminals-title">Gestión de Terminales POS</h1>
        <p className="terminals-subtitle">
          Configura los dispositivos desde los que se emitirán órdenes y pagos
        </p>
        <button className="btn-add-terminal" onClick={handleAddTerminal}>
           Agregar Terminal
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button className="close-banner" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Cargando terminales...</p>
        </div>
      ) : terminals.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Sin terminales configuradas</p>
          <p className="empty-text">
            Crea una nueva terminal para comenzar a registrar órdenes y pagos
          </p>
          <button className="btn-add-terminal" onClick={handleAddTerminal}>
             Crear Primera Terminal
          </button>
        </div>
      ) : (
        <div className="terminals-list">
          {terminals.map(terminal => (
            <div key={terminal.id} className={`terminal-card ${!terminal.activo ? 'inactive' : ''}`}>
              <div className="terminal-card-header">
                <h3 className="terminal-card-title">{terminal.nombre}</h3>
                <span className={`status-badge ${terminal.activo ? 'active' : 'inactive'}`}>
                  {terminal.activo ? ' Activa' : ' Inactiva'}
                </span>
              </div>

              <div className="terminal-card-info">
                <div className="info-row">
                  <span className="info-label">ID Terminal:</span>
                  <code className="info-value">{terminal.id}</code>
                </div>
                {terminal.venue_id && (
                  <div className="info-row">
                    <span className="info-label">Sede:</span>
                    <span className="info-value">{terminal.venue_id}</span>
                  </div>
                )}
              </div>

              <div className="terminal-card-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEditTerminal(terminal)}
                  disabled={submitting}
                >
                  ️ Editar
                </button>
                <button
                  className={`btn-toggle ${terminal.activo ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleTerminal(terminal)}
                  disabled={submitting}
                >
                  {terminal.activo ? '⊘ Desactivar' : '✓ Activar'}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTerminal(terminal.id)}
                  disabled={submitting}
                >
                  ️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="terminal-modal-overlay" onClick={handleCloseModal}>
          <div className="terminal-modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingTerminal ? 'Editar Terminal' : 'Crear Nueva Terminal'}
            </h2>

            <form onSubmit={handleSubmit} className="terminal-form">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  Nombre de la Terminal *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Caja Principal, Tablet Meseros 1"
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={submitting || !formData.nombre.trim()}
                >
                  {submitting ? 'Guardando...' : 'Guardar Terminal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
