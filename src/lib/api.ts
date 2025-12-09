import axios from 'axios';

// Detecta automáticamente la URL dependiendo si estás en local o producción
// Si VITE_API_BASE_URL no está definida, usa el fallback seguro.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-clinica.vintex.net.br';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE REQUEST (Seguridad de salida) ---
api.interceptors.request.use(
  (config) => {
    // Intentamos obtener el token de varias fuentes posibles
    let token = localStorage.getItem('access_token');
    
    // Si usas Supabase auth, a veces el token está dentro del objeto de sesión
    if (!token) {
        const sessionStr = localStorage.getItem('vintex_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                token = session.access_token;
            } catch (e) {
                console.error("Error parseando sesión", e);
            }
        }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPONSE (Seguridad de entrada) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend dice "No autorizado" (401), cerramos la sesión automáticamente
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o inválida. Redirigiendo al login...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('vintex_session');
      localStorage.removeItem('vintex_user');
      
      // Redirigir al login solo si no estamos ya allí
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;