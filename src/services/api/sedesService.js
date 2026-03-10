

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const sedesService = {
  
  async createSede(sedeData) {
    const response = await fetch(`${API_BASE_URL}/sedes`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(sedeData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async getAllSedes() {
    const response = await fetch(`${API_BASE_URL}/sedes`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    
    return data.data || [];
  },

  
  async getSedeById(id) {
    const response = await fetch(`${API_BASE_URL}/sedes/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updateSede(id, sedeData) {
    const response = await fetch(`${API_BASE_URL}/sedes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(sedeData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default sedesService;
