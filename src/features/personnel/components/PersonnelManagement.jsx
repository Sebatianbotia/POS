import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/api/authService';
import usersService from '../../../services/api/usersService';
import '../styles/PersonnelManagement.css';

export default function PersonnelManagement() {
  const { personal, loading: authLoading, deleteEmployee, loadPersonal } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQuickWaiterOpen, setIsQuickWaiterOpen] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'MESERO',
    telefono: ''
  });

  const roles = ['MESERO', 'CAJERO', 'PROPIETARIO'];

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'MESERO',
      telefono: ''
    });
    setError(null);
    setIsFormOpen(false);
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
    setError(null);

    if (!formData.nombre || !formData.email || !formData.password || !formData.rol) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register(
        formData.nombre,
        formData.email,
        formData.password,
        formData.rol,
        formData.telefono
      );

      if (response.success || response.data) {
        setGeneratedCredentials({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre
        });
        setShowCredentialsModal(true);
        resetForm();
      }
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este empleado?')) {
      try {
        setLoading(true);
        await deleteEmployee(id);
      } catch (err) {
        setError(err.message || 'Error al desactivar el usuario');
      } finally {
        setLoading(false);
      }
    }
  };

  const [quickWaiterData, setQuickWaiterData] = useState({ nombre: '', email: '' });

  const handleQuickWaiterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!quickWaiterData.nombre || !quickWaiterData.email) {
      setError('Nombre y email son requeridos');
      return;
    }

    try {
      setLoading(true);
      const response = await usersService.createWaiter(
        quickWaiterData.nombre,
        quickWaiterData.email
      );

      setGeneratedCredentials({
        email: response.credenciales?.email || quickWaiterData.email,
        password: response.credenciales?.password || 'Ver respuesta del servidor',
        nombre: response.usuario?.nombre || quickWaiterData.nombre
      });
      setShowCredentialsModal(true);
      setIsQuickWaiterOpen(false);
      setQuickWaiterData({ nombre: '', email: '' });
      await loadPersonal();
    } catch (err) {
      setError(err.message || 'Error al registrar mesero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personnel-container">
      <div className="personnel-header">
        <h1 className="personnel-title">Gestión de Personal</h1>
        <p className="personnel-subtitle">Administra los empleados de tu restaurante</p>

        <button
          className="btn-add-employee"
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          Nuevo Empleado
        </button>
        <button
          className="btn-add-employee btn-quick-waiter"
          onClick={() => setIsQuickWaiterOpen(true)}
        >
          Registro Rápido Mesero
        </button>
      </div>

      {isFormOpen && (
        <div className="personnel-form-overlay" onClick={() => resetForm()}>
          <div className="personnel-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>Registrar Nuevo Empleado</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="personnel-form">
              {error && (
                <div className="form-error-message">
                  {error}
                </div>
              )}

              <div className="form-section">
                <h3> Información del Usuario</h3>

                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan González"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ej: juan@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña * (mín. 8 caracteres)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Contraseña segura"
                    minLength="8"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      required
                    >
                      {roles.map(rol => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="Ej: +573001234567"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCredentialsModal && generatedCredentials && (
        <div className="personnel-form-overlay" onClick={() => setShowCredentialsModal(false)}>
          <div className="personnel-form-modal credentials-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2> Usuario Registrado Exitosamente</h2>
              <button className="close-btn" onClick={() => setShowCredentialsModal(false)}>×</button>
            </div>

            <div className="credentials-content">
              <p className="credentials-info">El usuario <strong>{generatedCredentials.nombre}</strong> ha sido registrado. Aquí están sus credenciales de acceso:</p>

              <div className="credential-box">
                <div className="credential-field">
                  <label>Email:</label>
                  <div className="credential-value">
                    <code>{generatedCredentials.email}</code>
                    <button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.email);
                        alert('Email copiado al portapapeles');
                      }}
                      title="Copiar"
                    >

                    </button>
                  </div>
                </div>

                <div className="credential-field">
                  <label>Contraseña:</label>
                  <div className="credential-value">
                    <code>{generatedCredentials.password}</code>
                    <button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.password);
                        alert('Contraseña copiada al portapapeles');
                      }}
                      title="Copiar"
                    >

                    </button>
                  </div>
                </div>
              </div>

              <div className="credentials-warning">
                <p>️ Guarda estas credenciales en un lugar seguro. El usuario las utilizará para acceder al sistema.</p>
              </div>

              <button
                className="btn-submit"
                onClick={() => setShowCredentialsModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {isQuickWaiterOpen && (
        <div className="personnel-form-overlay" onClick={() => setIsQuickWaiterOpen(false)}>
          <div className="personnel-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2> Registro Rápido de Mesero</h2>
              <button className="close-btn" onClick={() => setIsQuickWaiterOpen(false)}>×</button>
            </div>

            <form onSubmit={handleQuickWaiterSubmit} className="personnel-form">
              {error && (
                <div className="form-error-message">
                  {error}
                </div>
              )}

              <p className="form-hint">
                La contraseña será generada automáticamente por el sistema.
              </p>

              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={quickWaiterData.nombre}
                  onChange={(e) => setQuickWaiterData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Pedro López"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  value={quickWaiterData.email}
                  onChange={(e) => setQuickWaiterData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ej: pedro@email.com"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsQuickWaiterOpen(false)} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrar Mesero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="personnel-stats">
        <div className="stat-card">
          <span className="stat-number">{personal.length}</span>
          <span className="stat-label">Total Usuarios Registrados</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{personal.filter(p => p.rol === 'MESERO').length}</span>
          <span className="stat-label">Meseros</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{personal.filter(p => p.rol === 'CAJERO').length}</span>
          <span className="stat-label">Cajeros</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{personal.filter(p => p.rol === 'PROPIETARIO').length}</span>
          <span className="stat-label">Propietarios</span>
        </div>
      </div>

      {personal.length === 0 ? (
        <div className="personnel-empty">
          <p>No hay empleados registrados</p>
          <p className="empty-hint">Haz clic en "Nuevo Empleado" para agregar tu primer usuario</p>
        </div>
      ) : (
        <div className="personnel-table-wrapper">
          <table className="personnel-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map(employee => (
                <tr key={employee.id} className="employee-row">
                  <td className="employee-name">
                    <div className="name-info">
                      <strong>{employee.nombre}</strong>
                      <p>ID: {employee.id}</p>
                    </div>
                  </td>
                  <td className="employee-email">{employee.email}</td>
                  <td className="employee-rol">
                    <span className={`rol-badge rol-${employee.rol?.toLowerCase()}`}>
                      {employee.rol}
                    </span>
                  </td>
                  <td className="employee-phone">
                    {employee.telefono || '—'}
                  </td>
                  <td className="employee-status">
                    <span className={`status-badge ${employee.activo ? 'active' : 'inactive'}`}>
                      {employee.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="employee-actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(employee.id)}
                      title="Eliminar usuario"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
