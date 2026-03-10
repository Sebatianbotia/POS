

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const terminalesService = {
  
  async createTerminal(nombre) {
    const response = await fetch(`${API_BASE_URL}/terminales`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ nombre })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async getAllTerminals() {
    const response = await fetch(`${API_BASE_URL}/terminales`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async getTerminalById(id) {
    const response = await fetch(`${API_BASE_URL}/terminales/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updateTerminal(id, terminalData) {
    const response = await fetch(`${API_BASE_URL}/terminales/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(terminalData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async deleteTerminal(id) {
    const response = await fetch(`${API_BASE_URL}/terminales/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    await handleApiResponse(response);
    return true;
  }
};

export default terminalesService;
