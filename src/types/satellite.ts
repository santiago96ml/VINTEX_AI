export interface SatelliteClient {
  id: number;
  nombre: string;
  dni?: string;
  telefono?: string;
  activo: boolean;
  solicitud_de_secretaria?: boolean;
}

export interface SatelliteDoctor {
  id: number;
  nombre: string;
  especialidad: string;
  color: string;
  activo: boolean;
}

export interface SatelliteCita {
  id: number;
  doctor_id: number;
  cliente_id?: number;
  fecha_hora: string;
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
  descripcion?: string;
  cliente?: SatelliteClient;
  doctor?: SatelliteDoctor;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
  };
}

export interface ClientFile {
  id: number;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  created_at: string;
  storage_path: string;
}