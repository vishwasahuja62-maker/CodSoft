export const API_BASE = import.meta.env.VITE_API_URL || (window.location.origin + '/api');

export const getStaticUrl = (path) => {
  if (!path) return '';
  const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin;
  return `${base}${path}`;
};
function getHeaders() {
  const token = sessionStorage.getItem('jb_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const token = sessionStorage.getItem('jb_token');
  const headers = options.isMultipart ? {} : { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  // If uploading form data, delete content-type so browser sets bounds
  if (options.isMultipart) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned non-JSON: ${text.slice(0, 100)}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });

export const apiPost = (endpoint, body) => 
  apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) });

export const apiPut = (endpoint, body) => 
  apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) });

export const apiPatch = (endpoint, body) => 
  apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) });

export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

export const apiUpload = (endpoint, formData) => 
  apiRequest(endpoint, { method: 'POST', body: formData, isMultipart: true });
