import { useMemo, useState, useEffect } from "react";
import "../styles/component_style/Order.css";

import { categories } from "../services/categoryService";
import { products } from "../services/productService";

export default function Order({ mesa, close, addItemsToTable }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    // Resetear items cuando se abre otra mesa
    setOrderItems([]);
    
    // Si la mesa tiene items, cargarlos
    if (Array.isArray(mesa?.items) && mesa.items.length > 0) {
      setOrderItems([...mesa.items]);
    }
  }, [mesa.id, mesa.items]);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => {
      const matchCategory = activeCategory === "todos" || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(s);
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

  function addProduct(product) {
    setOrderItems(prevItems => {
      const exist = prevItems.find(i => i.id === product.id);

      if (exist) {
        return prevItems.map(i =>
          i.id === product.id
            ? { ...i, qty: Number(i.qty) + 1 }
            : i
        );
      }

      return [...prevItems, { ...product, price: Number(product.price), qty: 1 }];
    });
  }

  function decrease(productId) {
    setOrderItems(prev =>
      prev
        .map(i => (i.id === productId ? { ...i, qty: Number(i.qty) - 1 } : i))
        .filter(i => i.qty > 0)
    );
  }

    const subtotal = orderItems.reduce(
    (sum, p) => sum + (Number(p.price) * Number(p.qty)),
    0
    );
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  function confirmAdd() {
    if (orderItems.length === 0) return;

    // Pasar todos los items actuales - updateTableItems los reemplazará completamente
    addItemsToTable(orderItems);
    
    // Limpiar y cerrar
    setOrderItems([]);
    close();
  }

  return (
    <div className="order-container">
      <button className="close-modal-btn" onClick={close}>✕</button>

      <div className="order-left">
        <h2 className="order-title">Añadir a Pedido: {mesa.number}</h2>
        <p className="order-subtitle">Selecciona productos del menú</p>

        <input
          type="text"
          placeholder="Buscar plato o bebida..."
          className="order-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="order-categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={"order-category-btn " + (activeCategory === cat.slug ? "active" : "")}
              onClick={() => setActiveCategory(cat.slug)}
              type="button"
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="order-products-grid">
          {filteredProducts.map(prod => (
            <div
              key={prod.id}
              className="order-product-card"
              onClick={() => addProduct(prod)}
              role="button"
            >
              <div className="product-icon">{prod.icon}</div>
              <h4>{prod.name}</h4>
              <p>${Number(prod.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="order-right">
        <div className="order-right-header">
          <h3>Resumen del Pedido</h3>
        </div>

        <div className="order-items-list">
          {orderItems.length === 0 && (
            <p className="empty-items">No hay productos</p>
          )}

          {orderItems.map(item => (
            <div key={item.id} className="order-item-row">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>${Number(item.price).toFixed(2)}</p>
              </div>

              <div className="item-controls">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); decrease(item.id); }}
                >
                  −
                </button>

                <span>{item.qty}</span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); addProduct(item); }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="order-totals">
          <div className="linea">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="linea">
            <span>Impuestos (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="total-final">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button className="order-confirm-btn" onClick={confirmAdd} type="button">
          Confirmar y Añadir a Pedido
        </button>
      </div>
    </div>
  );
}