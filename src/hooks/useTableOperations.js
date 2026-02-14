// hooks/useTableOperations.js
import { useCallback } from 'react';
import { tables } from '../services/tableService';

const table = tables;

export function useTableOperations() {
    
    const openTable = (guests, waiterInfo) => {
        return {
            state: "ocupada",
            currentOrderId: Date.now(),
            waiter: waiterInfo,
            guests: parseInt(guests),
            totalBill: 0,
            occupiedMinutes: 0
        };
    };
    
    const closeTable = () => {
            return {
                state: "disponible",
                currentOrderId: null,
                waiter: null,
                guests: 0,
                totalBill: 0,
                occupiedMinutes: 0,
                items: null
            };
    };

    const addItemsToTable = useCallback((tableId, newItems, mesas) => {
    return mesas.map(mesa => {
        if (mesa.id !== tableId) return mesa;

        const existing = Array.isArray(mesa.items) ? mesa.items : [];

        const map = new Map(existing.map(i => [i.id, { ...i }]));

        for (const item of newItems) {
        const price = Number(item.price);
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
        (sum, p) => sum + Number(p.price) * Number(p.qty),
        0
        );

        return {
        ...mesa,
        items: mergedItems,
        totalBill: Number(subtotal.toFixed(2)),
        };
    });
    }, []);

    return { openTable, addItemsToTable, closeTable };
}