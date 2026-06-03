import axios from 'axios';

// Instancia de axios con la URL base del backend (del .env)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ─── Interceptor de REQUEST ──────────────────────────────────
// Corre ANTES de cada llamada: adjunta el token si existe.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de RESPONSE ─────────────────────────────────
// Corre DESPUÉS de cada respuesta: si el back devuelve 401
// (token vencido o inválido), limpia la sesión y manda al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);