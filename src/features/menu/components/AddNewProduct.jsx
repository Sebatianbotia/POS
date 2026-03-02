import { useState } from 'react';
import { useProducts } from '../../../contexts/ProductContext';
import { categories } from '../../../services/categoryService';
import '../styles/MenuManagement.css';

export default function AddNewProduct({ onClose }) {
  const { addProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    category: 'entradas',
    price: '',
    description: '',
    availability: 'siempre',
    icon: '🍽️'
  });

  const [errors, setErrors] = useState({});

  const categoryOptions = categories.filter(c => c.slug !== 'todos');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      newErrors.name = 'El nombre del plato es requerido';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    addProduct({
      ...formData,
      price: parseFloat(formData.price)
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nuevo Plato</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">ℹ️</span>
                <h3>Información General</h3>
              </div>

              <div className="form-group">
                <label htmlFor="name">Nombre del plato</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="El Lomo De Cerdo"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoría</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categoryOptions.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price">Precio (COP)</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="$ 0.00"
                  step="0.01"
                  min="0"
                  className={errors.price ? 'input-error' : ''}
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe sabores, ingredientes, etc."
                  rows="5"
                  className={errors.description ? 'input-error' : ''}
                  maxLength="300"
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
                <span className="char-count">{formData.description.length}/300</span>
              </div>
            </div>

            {/* Sección Disponibilidad */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">⏱️</span>
                <h3>Disponibilidad</h3>
              </div>

              <div className="form-group radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value="siempre"
                    checked={formData.availability === 'siempre'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">Disponible Siempre</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value="limitado"
                    checked={formData.availability === 'limitado'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">Por Tiempo Limitado</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value="agotado"
                    checked={formData.availability === 'agotado'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">Agotado</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              Guardar Plato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
