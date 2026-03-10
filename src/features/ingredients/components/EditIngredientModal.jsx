import { useState } from 'react';
import { ingredientsService } from '../../../services/api/index.js';
import '../styles/IngredientsManagement.css';

export default function EditIngredientModal({ ingredient, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: ingredient.name,
    unit_of_measure: ingredient.unit_of_measure,
    type: ingredient.type,
    stock: ingredient.stock
  });

  const [showStockForm, setShowStockForm] = useState(false);
  const [stockMovement, setStockMovement] = useState({
    cantidad: '',
    tipo_movimiento: 'entrada',
    motivo: ''
  });

  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState(false);

  const unitOptions = ['kg', 'g', 'l', 'ml', 'unidad', 'docena', 'paquete'];
  const typeOptions = ['dry', 'liquid', 'fresh', 'frozen', 'packaged'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? (value === '' ? '' : parseFloat(value)) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setStockMovement(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del ingrediente es requerido';
    }

    if (!formData.unit_of_measure) {
      newErrors.unit_of_measure = 'La unidad de medida es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStockMovement = () => {
    const newErrors = {};

    if (stockMovement.cantidad === '' || stockMovement.cantidad < 0) {
      newErrors.cantidad = 'La cantidad debe ser un número válido';
    }

    if (!stockMovement.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await ingredientsService.updateIngredient(ingredient.id, formData);
      onSuccess();
    } catch (err) {
      alert(`Error al actualizar ingrediente: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();

    if (!validateStockMovement()) {
      return;
    }

    setLoading(true);
    try {
      await ingredientsService.updateStock(
        ingredient.id,
        stockMovement.cantidad,
        stockMovement.tipo_movimiento,
        stockMovement.motivo
      );
      setShowStockForm(false);
      setStockMovement({
        cantidad: '',
        tipo_movimiento: 'entrada',
        motivo: ''
      });
      setErrors();
      onSuccess();
    } catch (err) {
      alert(`Error al actualizar stock: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Ingrediente</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {!showStockForm ? (
          <form onSubmit={handleSubmit} className="ingredient-form">
            <div className="form-group">
              <label htmlFor="name">Nombre del Ingrediente</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Azúcar, Sal, Harina"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unit_of_measure">Unidad de Medida</label>
                <select
                  id="unit_of_measure"
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleChange}
                >
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Tipo</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Stock Actual: <strong>{formData.stock}</strong></label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => setShowStockForm(true)}
              >
                Ajustar Stock
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStockSubmit} className="ingredient-form">
            <div className="stock-info">
              <p><strong>{ingredient.name}</strong></p>
              <p>Stock actual: {formData.stock} {ingredient.unit_of_measure}</p>
            </div>

            <div className="form-group">
              <label htmlFor="tipo_movimiento">Tipo de Movimiento</label>
              <select
                id="tipo_movimiento"
                name="tipo_movimiento"
                value={stockMovement.tipo_movimiento}
                onChange={handleStockChange}
              >
                <option value="entrada">Entrada (Compra)</option>
                <option value="salida">Salida (Uso)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cantidad">Cantidad</label>
              <input
                id="cantidad"
                type="number"
                name="cantidad"
                value={stockMovement.cantidad}
                onChange={handleStockChange}
                placeholder="0"
                min="0"
                className={errors.cantidad ? 'input-error' : ''}
              />
              {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="motivo">Motivo</label>
              <input
                id="motivo"
                type="text"
                name="motivo"
                value={stockMovement.motivo}
                onChange={handleStockChange}
                placeholder="Ej: Compra semanal, Uso en cocina"
                className={errors.motivo ? 'input-error' : ''}
              />
              {errors.motivo && <span className="error-message">{errors.motivo}</span>}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowStockForm(false);
                  setStockMovement({
                    cantidad: '',
                    tipo_movimiento: 'entrada',
                    motivo: ''
                  });
                  setErrors();
                }}
              >
                Atrás
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Registrar Movimiento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
