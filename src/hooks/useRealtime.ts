import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface SatelliteConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const useRealtime = (
  config: SatelliteConfig | null, 
  onUpdate: () => void
) => {
  useEffect(() => {
    if (!config) return;

    // Conexión directa a la DB del satélite (solo lectura realtime)
    const client = createClient(config.supabaseUrl, config.supabaseAnonKey);

    const channel = client
      .channel('cambios-db-general')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citas' },
        () => {
          console.log('⚡ Realtime: Cambio detectado en Citas');
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => {
          console.log('⚡ Realtime: Cambio detectado en Clientes');
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [config, onUpdate]);
};