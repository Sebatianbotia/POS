

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const propietarioService = {
  
  async getPropietario() {
    const response = await fetch(`${API_BASE_URL}/propietario`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  
  async updatePropietario(propietarioData) {
    const response = await fetch(`${API_BASE_URL}/propietario`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(propietarioData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default propietarioService;
