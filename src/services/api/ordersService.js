

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const ordersService = {
  
  async createOrder(mesa_id, mesero_id) {
    const response = await fetch(`${API_BASE_URL}/ordenes`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        mesa_id: mesa_id != null ? String(mesa_id) : undefined,
        mesero_id: mesero_id != null ? String(mesero_id) : undefined
      })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async getOrdersByTable(table_id) {
    const response = await fetch(`${API_BASE_URL}/ordenes?table_id=${table_id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async getOrderById(id) {
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async addOrderItems(id, items) {
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}/items`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ items })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async removeOrderItem(id, item_id) {
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}/items/${item_id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async sendToKitchen(id) {
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}/enviar-cocina`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updateOrderStatus(id, statusId) {
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ status_id: statusId })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async splitBill(id, tipo_division, numero_partes = null, divisiones = null) {
    const body = { tipo_division };
    if (tipo_division === 'partes_iguales' && numero_partes) {
      body.numero_partes = numero_partes;
    }
    if ((tipo_division === 'por_monto' || tipo_division === 'por_item') && divisiones) {
      body.divisiones = divisiones;
    }
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}/dividir`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(body)
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async checkout(id) {
    const response = await fetch(`${API_BASE_URL}/ordenes/${id}/checkout`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default ordersService;
