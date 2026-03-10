import { useState, useEffect } from "react";
import { ingredientsService } from '../../../services/api/index.js';
import AddIngredientModal from "./AddIngredientModal";
import EditIngredientModal from "./EditIngredientModal";
import '../styles/IngredientsManagement.css';

export default function IngredientsManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ingredientsService.getAllIngredients();
      setIngredients(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.unit_of_measure.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ingrediente?')) {
      try {
        await ingredientsService.deleteIngredient(id);
        await loadIngredients();
      } catch (err) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  const handleAddClose = () => {
    setShowAddModal(false);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingIngredient(null);
  };

  const handleAddSuccess = () => {
    handleAddClose();
    loadIngredients();
  };

  const handleEditSuccess = () => {
    handleEditClose();
    loadIngredients();
  };

  if (loading) {
    return <div className="ingredients-container"><p>Cargando ingredientes...</p></div>;
  }

  return (
    <div className="ingredients-container">
      <div className="ingredients-header">
        <h1 className="ingredients-title">Gestión de Ingredientes</h1>
        <div className="ingredients-header-right">
          <div className="ingredients-searchbar-container">
            <input
              className="ingredients-searchbar--input"
              type="text"
              placeholder="Buscar ingrediente"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="btn-add-ingredient" onClick={() => setShowAddModal(true)}>
            <span className="plus-icon">+</span> Agregar Ingrediente
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message-alert">
          Error: {error}
        </div>
      )}

      <div className="ingredients-table-wrapper">
        <table className="ingredients-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Unidad de Medida</th>
              <th>Tipo</th>
              <th>Stock Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIngredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td className="ingredient-name">{ingredient.name}</td>
                <td>{ingredient.unit_of_measure}</td>
                <td>
                  <span className="ingredient-type">{ingredient.type}</span>
                </td>
                <td className="stock">
                  <span className={ingredient.stock < 10 ? 'low-stock' : ''}>
                    {ingredient.stock}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(ingredient)}
                    title="Editar ingrediente"
                  >
                    Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(ingredient.id)}
                    title="Eliminar ingrediente"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredIngredients.length === 0 && (
        <div className="no-ingredients">
          <p>No hay ingredientes que coincidan con tu búsqueda</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn prev"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ❮
          </button>
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            if (pageNum <= 3 || pageNum > totalPages - 2 || Math.abs(pageNum - currentPage) <= 1) {
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === 4) {
              return (
                <span key="dots" className="pagination-dots">
                  ...
                </span>
              );
            }
            return null;
          })}
          <button
            className="pagination-btn next"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ❯
          </button>
        </div>
      )}

      {showAddModal && <AddIngredientModal onClose={handleAddClose} onSuccess={handleAddSuccess} />}
      {showEditModal && <EditIngredientModal ingredient={editingIngredient} onClose={handleEditClose} onSuccess={handleEditSuccess} />}
    </div>
  );
}
