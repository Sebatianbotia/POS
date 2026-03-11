
import { API_BASE_URL, getPublicHeader, getAuthHeader, handleApiResponse } from './config.js';

export const authService = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getPublicHeader(),
        body: JSON.stringify({ email, password })
      });
      const data = await handleApiResponse(response);

      if (data.success && data.data) {
        const token = data.data.token;
        const usuario = data.data.usuario;
        const expiresIn = data.data.expires_in;

        if (token) {
          localStorage.setItem('axon_token', token);

        }
        if (usuario) {
          localStorage.setItem('axon_user', JSON.stringify(usuario));
        }
        if (expiresIn) {
          localStorage.setItem('axon_expires_in', expiresIn);
        }

        return data.data;
      }

      throw new Error('Login response missing required fields');
    } catch (err) {
      console.error('Login request failed:', err);
      throw err;
    }
  },


  async registerOwner(nombre, email, password, nombre_sede, direccion, telefono) {
    const response = await fetch(`${API_BASE_URL}/auth/register-owner`, {
      method: 'POST',
      headers: getPublicHeader(),
      body: JSON.stringify({ nombre, email, password, nombre_sede, direccion, telefono })
    });
    const data = await handleApiResponse(response);

    if (data.success && data.data) {
      const token = data.data.token;
      const usuario = data.data.usuario;
      const expiresIn = data.data.expires_in;

      if (token) {
        localStorage.setItem('axon_token', token);
      }
      if (usuario) {
        localStorage.setItem('axon_user', JSON.stringify(usuario));
      }
      if (expiresIn) {
        localStorage.setItem('axon_expires_in', expiresIn);
      }

      return data.data;
    }

    throw new Error('Register owner response missing required fields');
  },


  async register(nombre, email, password, rol, telefono) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ nombre, email, password, rol, telefono })
    });
    return handleApiResponse(response);
  },


  async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);

    if (data.success) {
      localStorage.setItem('axon_user', JSON.stringify(data.data));
    }

    return data.data;
  },


  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      await handleApiResponse(response);
    } finally {
      localStorage.removeItem('axon_token');
      localStorage.removeItem('axon_user');
      localStorage.removeItem('axon_expires_in');
    }
  },


  async switchSede(sede_id) {
    const response = await fetch(`${API_BASE_URL}/auth/switch-sede`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ sede_id: Number(sede_id) })
    });
    const data = await handleApiResponse(response);

    if (data.success && data.data) {
      const token = data.data.token;
      const expiresIn = data.data.expires_in;

      if (token) {
        localStorage.setItem('axon_token', token);
      }
      if (expiresIn) {
        localStorage.setItem('axon_expires_in', expiresIn);
      }

      return data.data;
    }

    throw new Error('Switch sede response missing necessary token');
  },


  async refreshToken(refresh_token) {
    const body = refresh_token ? { refresh_token } : {};
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getPublicHeader(),
      body: JSON.stringify(body)
    });
    const data = await handleApiResponse(response);
    if (data.success && data.data?.token) {
      localStorage.setItem('axon_token', data.data.token);
      if (data.data.expires_in) {
        localStorage.setItem('axon_expires_in', data.data.expires_in);
      }
    }
    return data.data;
  }
};

export default authService;

