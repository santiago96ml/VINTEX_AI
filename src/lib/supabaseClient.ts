import { createClient } from '@supabase/supabase-js';

// Usamos import.meta.env para Vite. 
// Si estas variables no están en tu .env, la conexión fallará (pero no el build).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);