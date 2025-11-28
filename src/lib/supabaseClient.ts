import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu archivo .env del frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan las variables de entorno de Supabase en el Frontend (.env)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);