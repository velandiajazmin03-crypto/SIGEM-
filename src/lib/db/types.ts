export interface Usuario {
  id: number;
  username: string;
  password?: string; // Hashed password
  nombre: string;
  rol: 'admin' | 'tecnico';
  created_at?: string;
}

export type EstadoEquipo = 'Excelente' | 'Bueno' | 'Falla' | 'De Baja';

export interface Equipo {
  id: number;
  codigo_inventario: string;
  nombre: string;
  marca: string;
  modelo: string;
  serial: string;
  procesador: string;
  ram: string;
  disco_duro: string;
  sistema_operativo: string;
  estado: EstadoEquipo;
  ubicacion: string;
  observaciones: string;
  foto_url?: string | null;
  fecha_registro?: string;
}

export type EstadoReparacion = 'Reportado' | 'En Proceso' | 'Resuelto';

export interface Falla {
  id: number;
  equipo_id: number;
  equipo_nombre?: string; // Join info
  equipo_codigo?: string; // Join info
  descripcion: string;
  fecha_reporte: string;
  estado_reparacion: EstadoReparacion;
  responsable: string;
  solucion?: string;
  fecha_solucion?: string;
  evidencia_url?: string | null;
}

export type TipoMantenimiento = 'Preventivo' | 'Correctivo';

export interface Mantenimiento {
  id: number;
  equipo_id: number;
  equipo_nombre?: string; // Join info
  tipo: TipoMantenimiento;
  descripcion: string;
  fecha_mantenimiento: string;
  responsable: string;
  costo: number;
  documento_url?: string | null;
}

export interface DashboardStats {
  totalEquipos: number;
  equiposBuenEstado: number; // Excelente + Bueno
  equiposConFallas: number; // Falla
  equiposDeBaja: number; // De Baja
  fallasReportadas: number; // Reportadas
  fallasEnProceso: number; // En proceso
  fallasResueltas: number; // Resueltas
}
