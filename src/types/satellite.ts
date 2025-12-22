export interface SatelliteClient {
  id: number;
  nombre: string;
  dni?: string;
  telefono?: string;
  activo: boolean;
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
  fecha_hora: string; // ISO String
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
  descripcion?: string;
  cliente?: {
    id: number;
    nombre: string;
    telefono?: string;
    dni?: string;
  };
  doctor?: {
    id: number;
    nombre: string;
    color: string;
  };
}

export interface InitialDataResponse {
  doctores: SatelliteDoctor[];
  clientes: SatelliteClient[];
}