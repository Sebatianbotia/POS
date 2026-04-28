import { useMemo, useState, useEffect } from "react";
import "../styles/Order.css";
import { menuService, ordersService } from "../../../services/api/index.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";

export default function Order({ mesa, close, addItemsToTable, updateMesaState }) {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [orderItems, setOrderItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const items = await menuService.getMenu();
        setMenuItems(items);

        const categoryMap = new Map();
        categoryMap.set('todos', { id: 0, name: "Todos", slug: "todos" });

        (items || []).forEach(item => {
          const catName = item.categoria || item.category;
          if (catName) {
            const slug = catName.toLowerCase().replace(/\s+/g, '-');
            if (!categoryMap.has(slug)) {
              categoryMap.set(slug, {
                id: item.categoria_id || item.category_id || Math.random(),
                name: catName,
                slug: slug
              });
            }
          }
        });

        setCategories(Array.from(categoryMap.values()));
      } catch (err) {
        console.error('Error loading menu:', err);
        alert('Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  useEffect(() => {
    const loadOrderIfExists = async () => {
      if (mesa?.currentOrderId && menuItems.length > 0) {
        try {
          const existingOrder = await ordersService.getOrderById(mesa.currentOrderId);
          setOrder(existingOrder);

          const mappedItems = (existingOrder.items || []).map(item => {
            const menuItem = menuItems.find(m => m.id === (item.menu_item_id || item.id));
            return {
              order_item_id: item.id,
              id: item.menu_item_id || item.id,
              menu_item_id: item.menu_item_id || item.id,
              menu_item_name: item.nombre || item.name || menuItem?.nombre || menuItem?.name || `Item #${item.menu_item_id || item.id}`,
              name: item.nombre || item.name || menuItem?.nombre || menuItem?.name || `Item #${item.menu_item_id || item.id}`,
              precio: Number(item.precio_unitario ?? item.price ?? menuItem?.sales_price ?? menuItem?.precio ?? 0),
              price: Number(item.precio_unitario ?? item.price ?? menuItem?.sales_price ?? menuItem?.precio ?? 0),
              quantity: Number(item.cantidad ?? item.qty ?? 1),
              qty: Number(item.cantidad ?? item.qty ?? 1),
              notas: item.notas || ''
            };
          });
          setOrderItems(mappedItems);

          const statusMap = {
            abierta: 'abierta',
            enviada: 'enviada',
            en_preparacion: 'en_preparacion',
            lista: 'lista',
            pagada: 'pagada',
            cancelada: 'cancelada'
          };
          setOrderStatus(statusMap[existingOrder.estado] || existingOrder.estado || 'en_progreso');
        } catch (err) {
          console.error('Error loading order:', err);
        }
      }
    };

    loadOrderIfExists();
  }, [mesa?.currentOrderId, menuItems]);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return menuItems.filter(p => {
      const itemCategory = (p.categoria || p.category || '').toLowerCase();
      const activeCat = activeCategory.toLowerCase();
      
      const matchCategory = activeCat === "todos" || itemCategory === activeCat;
      const matchSearch = (p.name || p.nombre || '').toLowerCase().includes(s);
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory, menuItems]);

  function addProduct(product) {
    setOrderItems(prevItems => {
      const exist = prevItems.find(i => i.id === product.id);

      if (exist) {
        return prevItems.map(i =>
          i.id === product.id
            ? { ...i, quantity: Number(i.quantity || i.qty) + 1 }
            : i
        );
      }

      return [...prevItems, {
        ...product,
        menu_item_id: product.id,
        menu_item_name: product.name || product.nombre,
        precio: Number(product.precio || product.sales_price || product.price || 0),
        quantity: 1,
        notas: notes[product.id] || ''
      }];
    });
  }

  function decrease(productId) {
    setOrderItems(prev =>
      prev
        .map(i => (i.id === productId ? {
          ...i,
          quantity: Number(i.quantity || i.qty) - 1
        } : i))
        .filter(i => (i.quantity || i.qty) > 0)
    );
  }

  function updateNotes(productId, note) {
    setNotes(prev => ({ ...prev, [productId]: note }));
    setOrderItems(prev =>
      prev.map(i =>
        i.id === productId ? { ...i, notas: note } : i
      )
    );
  }

  const subtotal = orderItems.reduce(
    (sum, p) => sum + (Number(p.precio || p.price || 0) * Number(p.quantity || p.qty || 0)),
    0
  );
  const impuestos = 0;
  const total = subtotal;

  async function confirmAdd() {
    if (orderItems.length === 0) {
      alert('Por favor agrega al menos un producto');
      return;
    }

    try {
      setLoading(true);

      let currentOrder = order;

      if (!currentOrder) {
        const meseroId = user?.rol === 'MESERO'
          ? user.id
          : (mesa.waiter?.id ?? null);

        currentOrder = await ordersService.createOrder(
          String(mesa.id),
          meseroId != null ? String(meseroId) : undefined
        );
        setOrder(currentOrder);
        setOrderStatus('abierta');

        if (updateMesaState) {
          updateMesaState(mesa.id, {
            currentOrderId: currentOrder.id,
            state: 'OCUPADA',
            orderStatus: 'Abierta',
            orderEstado: 'abierta',
            orderCreatedAt: new Date()
          });
        }
      }

      const itemsToAdd = orderItems
        .filter(item => !item.order_item_id)
        .map(item => ({
          menu_item_id: String(item.menu_item_id || item.id),
          cantidad: parseInt(item.quantity || item.qty || 1, 10),
          notas: item.notas || ''
        }));

      if (itemsToAdd.length > 0) {
        await ordersService.addOrderItems(currentOrder.id, itemsToAdd);
      }

      if (addItemsToTable) {
        addItemsToTable(orderItems.map(item => ({
          ...item,
          id: item.menu_item_id || item.id,
          price: item.precio ?? item.price ?? 0,
          qty: item.quantity ?? item.qty ?? 1,
          name: item.menu_item_name || item.name || item.nombre
        })));
      }

      alert('Productos agregados. Usa "Enviar a Cocina" cuando estés listo.');
      setOrderItems([]);
      close();
    } catch (err) {
      console.error('Error adding items:', err);
      alert(`Error al agregar productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }



  if (loading && menuItems.length === 0) {
    return <div className="order-container"><p>Cargando menú...</p></div>;
  }



  return (
    <div className="order-container">
      <button className="close-modal-btn" onClick={close}>✕</button>

      <div className="order-left">
        <h2 className="order-title">Menú: {mesa.number}</h2>
        <p className="order-subtitle">Estado: {orderStatus || 'Sin orden'}</p>

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
              <h4>{prod.name || prod.nombre}</h4>
              <p>${Number(prod.precio || prod.sales_price || prod.price || 0).toFixed(2)}</p>
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
            <div key={item.id || item.menu_item_id} className="order-item-row">
              <div className="item-info">
                <h4>{item.menu_item_name || item.name || item.nombre}</h4>
                <p>${Number(item.precio || item.price || 0).toFixed(2)}</p>
                <input
                  type="text"
                  placeholder="Notas (sin cebolla, etc)"
                  className="item-notes"
                  value={item.notas || ''}
                  onChange={(e) => updateNotes(item.id || item.menu_item_id, e.target.value)}
                />
              </div>

              <div className="item-controls">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); decrease(item.id || item.menu_item_id); }}
                >
                  −
                </button>

                <span>{item.quantity || item.qty}</span>

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

            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>



        <button
          className="order-confirm-btn"
          onClick={confirmAdd}
          type="button"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Confirmar y Añadir'}
        </button>
      </div>
    </div>
  );
}
