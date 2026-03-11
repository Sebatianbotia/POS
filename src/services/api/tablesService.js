

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const tablesService = {
  
  async getAllTables() {
    const response = await fetch(`${API_BASE_URL}/mesas`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async getTableById(id) {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async createTable(numero, capacidad) {
    const response = await fetch(`${API_BASE_URL}/mesas`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ numero, capacidad })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updateTableStatus(id, estado) {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}/estado`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ estado })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async assignWaiter(id, user_id) {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}/asignar`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ user_id })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async getTableAssignments(id) {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}/asignaciones`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async deleteTable(id) {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default tablesService;
