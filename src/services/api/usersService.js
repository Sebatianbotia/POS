

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const usersService = {
  
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(userData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async createWaiter(nombre, email) {
    const response = await fetch(`${API_BASE_URL}/usuarios/mesero`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ nombre, email })
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default usersService;
