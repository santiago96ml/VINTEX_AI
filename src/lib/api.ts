import axios from 'axios';
import { supabase } from './supabaseClient';

// Clave para persistir la URL del backend asignado
const API_URL_KEY = 'vintex_active_backend_url';

// 1. Obtener la URL actual (o la default del .env)
export const getApiUrl = () => {
  const storedUrl = localStorage.getItem(API_URL_KEY);
  return storedUrl || import.meta.env.VITE_API_URL || 'https://clinica.vintex.net.br/';
};

// 2. Función para "Enchufar" el frontend a otro backend (Satélite)
export const setApiUrl = (url: string) => {
  if (url) {
    localStorage.setItem(API_URL_KEY, url);
    // Forzamos recarga de la instancia de axios
    api.defaults.baseURL = url;
  }
};

// 3. Instancia de Axios Configurada
export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 4. Interceptor: Inyectar Token y URL actualizada en cada petición
api.interceptors.request.use(async (config) => {
  // Asegurarnos de que usa la URL más reciente
  config.baseURL = getApiUrl();

  // Obtener sesión de Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper para limpiar la configuración al cerrar sesión
export const clearApiConfig = () => {
  localStorage.removeItem(API_URL_KEY);
};