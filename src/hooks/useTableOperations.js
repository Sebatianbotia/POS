
import { useCallback } from 'react';

export function useTableOperations() {

  const openTable = (guests, waiterInfo) => {
    return {
      state: "OCUPADA",
      
      waiter: waiterInfo,
      guests: parseInt(guests),
      totalBill: 0,
      occupiedMinutes: 0,

      
      currentOrderId: null,
      items: null,
      orderStatus: 'Sin orden',
      orderEstado: 'abierta',
      orderCreatedAt: new Date()
    };
  };

  const closeTable = () => {
    return {
      state: "LIBRE",
      currentOrderId: null,
      waiter: null,
      guests: 0,
      totalBill: 0,
      occupiedMinutes: 0,
      items: null
    };
  };

  const updateTableItems = useCallback((tableId, newItems, mesas) => {
    return mesas.map(mesa => {
      if (mesa.id !== tableId) return mesa;

      const items = Array.isArray(newItems) ? newItems : [];

      const subtotal = items.reduce(
        (sum, p) => sum + (Number(p.precio || p.price) || 0) * (Number(p.qty) || 0),
        0
      );

      return {
        ...mesa,
        items: items.length > 0 ? items : null,
        totalBill: Number(subtotal.toFixed(2)),
      };
    });
  }, []);


  const addItemsToTable = useCallback((tableId, newItems, mesas) => {
    return mesas.map(mesa => {
      if (mesa.id !== tableId) return mesa;

      const existing = Array.isArray(mesa.items) ? mesa.items : [];

      const map = new Map(existing.map(i => [i.id, { ...i }]));

      for (const item of newItems) {
        const price = Number(item.precio || item.price);
        const qty = Number(item.qty);

        const prev = map.get(item.id);
        if (prev) {
          map.set(item.id, { ...prev, qty: Number(prev.qty) + qty });
        } else {
          map.set(item.id, { ...item, price, qty });
        }
      }

      const mergedItems = Array.from(map.values());

      const subtotal = mergedItems.reduce(
        (sum, p) => sum + Number(p.precio || p.price) * Number(p.qty),
        0
      );

      return {
        ...mesa,
        items: mergedItems,
        totalBill: Number(subtotal.toFixed(2)),
      };
    });
  }, []);

  return { openTable, addItemsToTable, updateTableItems, closeTable };
}