import { useEffect, useState } from 'react';


export const useApiData = (apiCall, defaultValue = null, dependencies = []) => {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    
    const token = localStorage.getItem('axon_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result || defaultValue);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
};

export default useApiData;
