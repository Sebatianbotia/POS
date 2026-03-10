import { useState } from 'react';
import { ingredientsService } from '../../../services/api/index.js';
import '../styles/IngredientsManagement.css';

export default function AddIngredientModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    unit_of_measure: 'kg',
    type: 'dry',
    stock: ''
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del ingrediente es requerido';
    }

    if (!formData.unit_of_measure) {
      newErrors.unit_of_measure = 'La unidad de medida es requerida';
    }

    if (formData.stock === '' || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser un número válido';
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
      const newIngredient = await ingredientsService.createIngredient(
        formData.name,
        formData.unit_of_measure,
        formData.type,
        formData.stock
      );



      if (formData.stock > 0 && newIngredient?.id) {
        try {
          await ingredientsService.updateStock(
            newIngredient.id,
            formData.stock,
            'entrada',
            'Stock inicial'
          );
        } catch (stockErr) {
          console.warn('Could not set initial stock via movement:', stockErr.message);

        }
      }

      onSuccess();
    } catch (err) {
      alert(`Error al crear ingrediente: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nuevo Ingrediente</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

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
            <label htmlFor="stock">Stock Inicial</label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={errors.stock ? 'input-error' : ''}
            />
            {errors.stock && <span className="error-message">{errors.stock}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
