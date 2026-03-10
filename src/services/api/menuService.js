

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const menuService = {
  
  async getMenu() {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async createMenuItem(name, sales_price, ingredients) {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ name, sales_price, ingredients })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updateMenuItem(id, menuData) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(menuData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default menuService;
