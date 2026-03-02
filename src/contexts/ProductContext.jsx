import { createContext, useState, useContext } from 'react';
import { products as initialProducts } from '../services/productService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = (newProduct) => {
    const maxId = Math.max(...products.map(p => p.id), 0);
    const productToAdd = {
      ...newProduct,
      id: maxId + 1,
      icon: newProduct.icon || '🍽️'
    };
    setProducts([...products, productToAdd]);
    return productToAdd;
  };

  const updateProduct = (id, updatedData) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...updatedData } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductById = (id) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct,
      getProductById 
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
