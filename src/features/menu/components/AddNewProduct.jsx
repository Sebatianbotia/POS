import { useState, useEffect } from 'react';
import { useProducts } from '../../../contexts/ProductContext';
import { categoriesService } from '../../../services/api/categoriesService';
import { ingredientsService } from '../../../services/api/index.js';
import '../styles/MenuManagement.css';

export default function AddNewProduct({ onClose }) {
  const { addProduct } = useProducts();
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: 'entradas',
    price: '',
    description: '',
    availability: 'siempre',
    icon: '️'
  });
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const allCategories = await categoriesService.getAllCategories();
        setCategories(allCategories || []);
        if (allCategories && allCategories.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: allCategories[0].slug
          }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoadingIngredients(true);
        const allIngredients = await ingredientsService.getAllIngredients();
        setIngredients(allIngredients || []);
      } catch (error) {
        console.error('Error loading ingredients:', error);
        setIngredients([]);
      } finally {
        setLoadingIngredients(false);
      }
    };
    loadIngredients();
  }, []);

  const categoryOptions = categories;

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

  const handleIngredientAdd = () => {
    setSelectedIngredients(prev => [...prev, { ingredient_id: '', quantity: '' }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'ingredient_id' ? parseInt(value) : parseFloat(value)
    };
    setSelectedIngredients(updatedIngredients);
  };

  const handleIngredientRemove = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del plato es requerido';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (selectedIngredients.length === 0) {
      newErrors.ingredients = 'Debes agregar al menos un ingrediente';
    }

    const invalidIngredients = selectedIngredients.some(
      ing => !ing.ingredient_id || !ing.quantity || ing.quantity <= 0
    );
    if (invalidIngredients) {
      newErrors.ingredients = 'Todos los ingredientes deben tener ID y cantidad válidos';
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
      price: parseFloat(formData.price),
      ingredients: selectedIngredients
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
                <span className="section-icon">️</span>
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
            </div>


            <div className="form-section">
              <div className="section-header">
                <span className="section-icon"></span>
                <h3>Ingredientes (Receta)</h3>
              </div>

              {loadingIngredients ? (
                <p>Cargando ingredientes...</p>
              ) : ingredients.length === 0 ? (
                <p className="warning-text">No hay ingredientes disponibles. Crea algunos primero.</p>
              ) : (
                <>
                  <div className="ingredients-list">
                    {selectedIngredients.map((item, index) => (
                      <div key={index} className="ingredient-row">
                        <select
                          value={item.ingredient_id}
                          onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                          className="ingredient-select"
                        >
                          <option value="">Selecciona ingrediente...</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.unit_of_measure})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Cantidad"
                          value={item.quantity}
                          onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                          className="ingredient-quantity"
                          step="0.01"
                          min="0"
                        />
                        <button
                          type="button"
                          className="btn-remove-ingredient"
                          onClick={() => handleIngredientRemove(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {errors.ingredients && (
                    <span className="error-message">{errors.ingredients}</span>
                  )}

                  <button
                    type="button"
                    className="btn-add-ingredient"
                    onClick={handleIngredientAdd}
                  >
                    + Agregar Ingrediente
                  </button>
                </>
              )}
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
