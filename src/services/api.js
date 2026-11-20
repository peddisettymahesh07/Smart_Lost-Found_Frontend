import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/* ==================== AUTH SERVICE ==================== */
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login/', credentials);
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register/', data);
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) await api.post('/auth/logout/', { refresh });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  },
  getProfile: async () => (await api.get('/auth/profile/')).data,
  updateProfile: async (data) => (await api.patch('/auth/profile/', data)).data,
  getAdminUsers: async () => (await api.get('/auth/admin/users/')).data,
};

/* ==================== LOST ITEMS SERVICE ==================== */
export const lostItemService = {
  getAll: async (params = {}) => (await api.get('/lost-items/', { params })).data,
  getById: async (id) => (await api.get(`/lost-items/${id}/`)).data,
  create: async (formData) => {
    return (await api.post('/lost-items/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  update: async (id, formData) => {
    return (await api.patch(`/lost-items/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  delete: async (id) => (await api.delete(`/lost-items/${id}/`)).data,
};

/* ==================== FOUND ITEMS SERVICE ==================== */
export const foundItemService = {
  getAll: async (params = {}) => (await api.get('/found-items/', { params })).data,
  getById: async (id) => (await api.get(`/found-items/${id}/`)).data,
  create: async (formData) => {
    return (await api.post('/found-items/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  update: async (id, formData) => {
    return (await api.patch(`/found-items/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  delete: async (id) => (await api.delete(`/found-items/${id}/`)).data,
};

/* ==================== AI MATCHES SERVICE ==================== */
export const matchService = {
  getAll: async (params = {}) => (await api.get('/matches/', { params })).data,
  getById: async (id) => (await api.get(`/matches/${id}/`)).data,
  generate: async (payload = {}) => (await api.post('/matches/generate/', payload)).data,
  respond: async (id, status) => (await api.post(`/matches/${id}/respond/`, { status })).data,
};

/* ==================== LOCATIONS SERVICE ==================== */
export const locationService = {
  getAll: async (params = {}) => (await api.get('/locations/', { params })).data,
  getNearby: async (params = {}) => (await api.get('/items/nearby/', { params })).data,
};

/* ==================== NOTIFICATIONS SERVICE ==================== */
export const notificationService = {
  getAll: async () => (await api.get('/notifications/')).data,
  markRead: async (id) => (await api.patch(`/notifications/${id}/read/`)).data,
  markAllRead: async () => (await api.post('/notifications/read-all/')).data,
};

/* ==================== CLAIMS SERVICE ==================== */
export const claimService = {
  getAll: async () => (await api.get('/claims/')).data,
  getById: async (id) => (await api.get(`/claims/${id}/`)).data,
  create: async (formData) => {
    return (await api.post('/claims/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  updateStatus: async (id, payload) => (await api.patch(`/claims/${id}/status/`, payload)).data,
};

/* ==================== DASHBOARD SERVICE ==================== */
export const dashboardService = {
  getAdminStats: async () => (await api.get('/dashboard/stats/')).data,
  getUserStats: async () => (await api.get('/dashboard/user-stats/')).data,
};

export default api;
