
const API_BASE_URL = 'http://72.61.73.95:8080';

export const getAuthHeader = () => {
  const token = localStorage.getItem('axon_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getPublicHeader = () => ({
  'Content-Type': 'application/json'
});


async function tryRefreshToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const newToken = json?.data?.token;
    if (newToken) {
      localStorage.setItem('axon_token', newToken);
      if (json.data.expires_in) {
        localStorage.setItem('axon_expires_in', json.data.expires_in);
      }
    }
    return newToken || null;
  } catch {
    return null;
  }
}


export const handleApiResponse = async (response, retry) => {
  let errorData = {};
  try {
    errorData = await response.json();
  } catch (e) { /* empty body */ }

  if (!response.ok) {
    if (response.status === 401) {
      const newToken = await tryRefreshToken();
      if (newToken && retry) {
        return retry();
      }
      localStorage.removeItem('axon_token');
      localStorage.removeItem('axon_user');
      localStorage.removeItem('axon_expires_in');
    }
    const errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return errorData;
};

export { API_BASE_URL };
