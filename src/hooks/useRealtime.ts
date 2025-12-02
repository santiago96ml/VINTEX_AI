import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const useRealtime = (config: any, onUpdate: () => void) => {
  useEffect(() => {
    if (!config) return;

    const client = createClient(config.supabaseUrl, config.supabaseAnonKey);

    const channel = client
      .channel('cambios-db-general')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, () => {
          console.log('⚡ Realtime: Cambio en Citas');
          onUpdate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
          console.log('⚡ Realtime: Cambio en Clientes');
          onUpdate();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [config, onUpdate]);
};