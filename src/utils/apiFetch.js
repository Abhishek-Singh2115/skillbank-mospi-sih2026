import { API_BASE_URL } from '../config/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("skillbank_token");
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:logout'));
  }

  return response;
};
