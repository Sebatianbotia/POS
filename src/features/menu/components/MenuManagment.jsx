import { useState, useMemo, useEffect } from "react";
import '../styles/MenuManagement.css';
import { useProducts } from '../../../contexts/ProductContext';
import { categoriesService } from "../../../services/api/categoriesService";
import AddNewProduct from "./AddNewProduct";
import EditProduct from "./EditProduct";
import CategoryManager from "./CategoryManager";

export default function MenuManagement({ userRole }) {
  const { products, deleteProduct } = useProducts();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [filterCategory, setFilterCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const canEditMenu = userRole === 'PROPIETARIO';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const allCategories = await categoriesService.getAllCategories();
        setCategories(allCategories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const itemsPerPage = 5;

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (filterCategory !== 'todos') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        (p.name || p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || p.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, filterCategory, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  const handleAddClose = () => {
    setShowAddModal(false);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const getCategoryName = (slug) => {
    return categories.find(c => c.slug === slug)?.name || 'Sin categoría';
  };

  const getAvailabilityLabel = (availability) => {
    const labels = {
      'siempre': 'Disponible',
      'limitado': 'Por Tiempo Limitado',
      'agotado': 'Agotado'
    };
    return labels[availability] || 'Disponible';
  };

  const [menuTab, setMenuTab] = useState('platos'); 

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Manejo de Menú</h1>
        <div className="menu-header-right">
          <div className="menu-searchbar-container">
            {menuTab === 'platos' && (
              <input
                className="menu-searchbar--input"
                type="text"
                placeholder="Buscar plato"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
          {canEditMenu && menuTab === 'platos' && (
            <button className="btn-add-product" onClick={() => setShowAddModal(true)}>
              <span className="plus-icon">+</span> Agregar Plato
            </button>
          )}
        </div>
      </div>

      
      <div className="menu-tabs">
        <button
          className={`menu-tab-btn ${menuTab === 'platos' ? 'active' : ''}`}
          onClick={() => setMenuTab('platos')}
        >
          ️ Platos
        </button>
        {canEditMenu && (
          <button
            className={`menu-tab-btn ${menuTab === 'categorias' ? 'active' : ''}`}
            onClick={() => setMenuTab('categorias')}
          >
            ️ Categorías
          </button>
        )}
      </div>

      {menuTab === 'categorias' && canEditMenu ? (
        <CategoryManager categories={categories} setCategories={setCategories} />
      ) : (
        <>
          <div className="products-filters">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${filterCategory === cat.slug ? 'active' : ''}`}
                onClick={() => {
                  setFilterCategory(cat.slug);
                  setCurrentPage(1);
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="product-name">
                      {product.nombre}
                    </td>
                    <td>{getCategoryName(product.category)}</td>
                    <td>
                      <span className={`status-badge ${product.availability || 'siempre'}`}>
                        {getAvailabilityLabel(product.availability || 'siempre')}
                      </span>
                    </td>
                    <td className="price">
                      ${(product.precio || 0).toFixed(2)}
                    </td>
                    <td className="actions">
                      {canEditMenu && (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(product)}
                            title="Editar producto"
                          >
                            Editar
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(product.id)}
                            title="Eliminar producto"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>No hay productos que coincidan con tu búsqueda</p>
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

          {showAddModal && <AddNewProduct onClose={handleAddClose} />}
          {showEditModal && <EditProduct product={editingProduct} onClose={handleEditClose} />}
        </>
      )}
    </div>
  );
}