import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import '../styles/SedesManagement.css';

export default function SedesManagement() {
  const { sedes, currentSede, createSede, changeSede, loading, error } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: ''
  });
  const [localError, setLocalError] = useState(null);

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: ''
    });
    setIsFormOpen(false);
    setLocalError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.nombre.trim()) {
      setLocalError('El nombre de la sede es requerido');
      return;
    }

    try {
        
      await createSede(formData);
      resetForm();
    } catch (err) {
      setLocalError(err.message || 'Error al crear la sede');
    }
  };

  return (
    <div className="sedes-management">
      <div className="sedes-header">
        <h2>Gestión de Sedes</h2>
        <button 
          className="btn-primary" 
          onClick={() => setIsFormOpen(true)}
        >
          + Nueva Sede
        </button>
      </div>

      {(error || localError) && (
        <div className="error-message">{error || localError}</div>
      )}

      {isFormOpen && (
        <div className="form-container">
          <div className="form-overlay" onClick={resetForm}></div>
          <form className="sedes-form" onSubmit={handleSubmit}>
            <h3>Nueva Sede</h3>
            
            <div className="form-field">
              <label htmlFor="nombre">Nombre de la Sede *</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Sede Centro"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ej: Calle 1 #2-3"
              />
            </div>

            <div className="form-field">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: +573001234567"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Sede'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sedes-list">
        <h3>Tus Sedes ({sedes.length})</h3>
        {sedes.length === 0 ? (
          <p className="empty-message">No tienes sedes registradas</p>
        ) : (
          <div className="sedes-grid">
            {sedes.map(sede => (
              <div 
                key={sede.id} 
                className={`sede-card ${currentSede?.id === sede.id ? 'active' : ''}`}
                onClick={() => changeSede(sede)}
              >
                <div className="sede-icon"></div>
                <div className="sede-info">
                  <h4>{sede.nombre}</h4>
                  {sede.direccion && <p className="sede-direccion">{sede.direccion}</p>}
                  {sede.telefono && <p className="sede-telefono">{sede.telefono}</p>}
                  <p className="sede-status">{sede.activo ? '✓ Activa' : '✗ Inactiva'}</p>
                </div>
                {currentSede?.id === sede.id && (
                  <div className="sede-badge">
                    <span>ACTIVA</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
