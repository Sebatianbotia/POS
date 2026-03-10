

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const categoriesService = {
  
  async getAllCategories() {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  
  async createCategory(name) {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ name })
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default categoriesService;
