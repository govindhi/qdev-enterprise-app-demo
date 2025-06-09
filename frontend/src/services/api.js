import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productApi = {
  getAll: async (category = null, maxPrice = null) => {
    let url = '/products';
    const params = {};
    
    if (category) params.category = category;
    if (maxPrice) params.max_price = maxPrice;
    
    const response = await api.get(url, { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/products/${id}`);
    return true;
  },
};

// Auth API
export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/token', { username, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export default api;
