import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import '../styles/PersonnelManagement.css';

export default function PersonnelManagement() {
  const { personal, addEmployee, updateEmployee, deleteEmployee } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: 'Mesero',
    baseSalary: '0',
    startDate: new Date().toISOString().split('T')[0]
  });

  const positions = ['Mesero', 'Chef', 'Gerente', 'Caja'];

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      position: 'Mesero',
      baseSalary: '0',
      startDate: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingId) {
      updateEmployee(editingId, formData);
      alert('Empleado actualizado exitosamente');
      resetForm();
    } else {
      const newEmployee = addEmployee(formData);
      // Mostrar credenciales generadas
      setGeneratedCredentials(newEmployee.credentials);
      setShowCredentialsModal(true);
      resetForm();
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setEditingId(employee.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      deleteEmployee(id);
      alert('Empleado eliminado exitosamente');
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
            setFormData({
              name: '',
              email: '',
              phone: '',
              address: '',
              position: 'Mesero',
              baseSalary: '0',
              startDate: new Date().toISOString().split('T')[0]
            });
            setEditingId(null);
            setIsFormOpen(true);
          }}
        >
          ➕ Nuevo Empleado
        </button>
      </div>

      {isFormOpen && (
        <div className="personnel-form-overlay" onClick={() => resetForm()}>
          <div className="personnel-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>{editingId ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="personnel-form">
              <div className="form-section">
                <h3>📋 Información General</h3>
                
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan González"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ej: 3123456789"
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
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Calle 10 #25-50"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>💼 Información Laboral</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Cargo</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                    >
                      {positions.map(pos => (
                        <option className="position-option" key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Salario Base</label>
                    <input
                      type="number"
                      name="baseSalary"
                      value={formData.baseSalary}
                      onChange={handleInputChange}
                      placeholder="Ej: 0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? 'Actualizar' : 'Registrar'}
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
              <h2>✅ Credenciales Generadas</h2>
              <button className="close-btn" onClick={() => setShowCredentialsModal(false)}>×</button>
            </div>

            <div className="credentials-content">
              <p className="credentials-info">Las siguientes credenciales fueron generadas automáticamente para el nuevo mesero:</p>
              
              <div className="credential-box">
                <div className="credential-field">
                  <label>Usuario:</label>
                  <div className="credential-value">
                    <code>{generatedCredentials.usuario}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(generatedCredentials.usuario)}
                      title="Copiar"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="credential-field">
                  <label>Contraseña:</label>
                  <div className="credential-value">
                    <code>{generatedCredentials.password}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(generatedCredentials.password)}
                      title="Copiar"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className="credentials-warning">
                <p>⚠️ Guarda estas credenciales en un lugar seguro. El mesero las utilizará para acceder al sistema.</p>
              </div>

              <button 
                className="btn-submit"
                onClick={() => setShowCredentialsModal(false)}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="personnel-stats">

        <div className="stat-card">
          <span className="stat-number">{personal.length}</span>
          <span className="stat-label">Total Empleados</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{personal.filter(p => p.position === 'Mesero').length}</span>
          <span className="stat-label">Meseros</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{personal.filter(p => p.position === 'Chef').length}</span>
          <span className="stat-label">Chefs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{personal.filter(p => p.position === 'Gerente').length}</span>
          <span className="stat-label">Gerentes</span>
        </div>
      </div>

      {personal.length === 0 ? (
        <div className="personnel-empty">
          <p>No hay empleados registrados</p>
          <p className="empty-hint">Haz clic en "Nuevo Empleado" para agregar tu primer empleado</p>
        </div>
      ) : (
        <div className="personnel-table-wrapper">
          <table className="personnel-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map(employee => (
                <tr key={employee.id} className="employee-row">
                  <td className="employee-name">
                    <div className="name-info">
                      <strong>{employee.name}</strong>
                      <p>ID: {employee.id}</p>
                    </div>
                  </td>
                  <td className="employee-position">{employee.position}</td>
                  <td className="employee-user">
                    <div className="user-info">
                      <code>{employee.credentials?.usuario}</code>
                      <button 
                        className="copy-btn-small"
                        onClick={() => {
                          navigator.clipboard.writeText(employee.credentials?.usuario);
                          alert('Usuario copiado');
                        }}
                        title="Copiar usuario"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="employee-contact">
                    <div>📱 {employee.phone}</div>
                    <div>📧 {employee.email}</div>
                  </td>
                  <td className="employee-status">
                    <span className="status-badge active">Activo</span>
                  </td>
                  <td className="employee-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(employee)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(employee.id)}
                      title="Eliminar"
                    >
                      🗑️
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
