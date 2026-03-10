import { createContext, useState, useContext, useEffect } from 'react';
import { menuService } from '../services/api/index.js';
import useApiData from '../hooks/useApiData.js';
import { useAuth } from './AuthContext.jsx';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { user, currentSede } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    data: fetchedProducts,
    loading: isLoadingMenu,
    refetch: reloadMenuData
  } = useApiData(
    () => menuService.getMenu(),
    [],
    [user?.id, currentSede?.id]
  );

  useEffect(() => {
    setProducts([]);
  }, [currentSede?.id]);

  useEffect(() => {
    if (Array.isArray(fetchedProducts)) {
      setProducts(fetchedProducts);
    }
  }, [fetchedProducts]);

  useEffect(() => {
    setLoading(isLoadingMenu);
  }, [isLoadingMenu]);

  const addProduct = async (newProduct) => {
    try {
      const created = await menuService.createMenuItem(
        newProduct.name || newProduct.nombre,
        newProduct.precio || newProduct.sales_price || newProduct.price,
        newProduct.ingredients || []
      );
      setProducts([...products, created]);
      return created;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const updated = await menuService.updateMenuItem(id, updatedData);
      setProducts(products.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductById = (id) => {
    return products.find(p => p.id === id);
  };

  const reloadProducts = async () => {
    const token = localStorage.getItem('axon_token');
    if (!token) return;

    try {
      setLoading(true);
      const items = await menuService.getMenu();
      setProducts(items || []);
    } catch (err) {
      console.error('Error reloading menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      reloadProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};
