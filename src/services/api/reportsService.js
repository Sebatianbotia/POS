

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const reportsService = {
  
  async getSalesReport(fecha_inicio, fecha_fin, tipo = 'por_dia') {
    const params = new URLSearchParams({
      fecha_inicio,
      fecha_fin,
      tipo
    });
    const response = await fetch(`${API_BASE_URL}/reportes/ventas?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async getInventoryReport() {
    const response = await fetch(`${API_BASE_URL}/reportes/inventario`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async getTipsReport(fecha_inicio, fecha_fin) {
    const params = new URLSearchParams({
      fecha_inicio,
      fecha_fin
    });
    const response = await fetch(`${API_BASE_URL}/reportes/propinas?${params}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  }
};

export default reportsService;
