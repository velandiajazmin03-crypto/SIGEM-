import { Equipo, Falla, Mantenimiento, Usuario, DashboardStats } from './types';
import { JsonRepository } from './jsonDb';
import { MySqlRepository } from './mysqlDb';
import { SupabaseRepository } from './supabaseDb';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export interface IRepository {
  // Usuarios
  getUsuarioByUsername(username: string): Promise<Usuario | null>;
  createUsuario(usuario: Omit<Usuario, 'id'>): Promise<Usuario>;

  // Equipos
  getEquipos(): Promise<Equipo[]>;
  getEquipoById(id: number): Promise<Equipo | null>;
  createEquipo(equipo: Omit<Equipo, 'id'>): Promise<Equipo>;
  updateEquipo(id: number, equipo: Partial<Equipo>): Promise<Equipo | null>;
  deleteEquipo(id: number): Promise<boolean>;

  // Fallas
  getFallas(): Promise<Falla[]>;
  getFallaById(id: number): Promise<Falla | null>;
  createFalla(falla: Omit<Falla, 'id'>): Promise<Falla>;
  updateFalla(id: number, falla: Partial<Falla>): Promise<Falla | null>;

  // Mantenimientos
  getMantenimientosByEquipo(equipoId: number): Promise<Mantenimiento[]>;
  createMantenimiento(mantenimiento: Omit<Mantenimiento, 'id'>): Promise<Mantenimiento>;
  getAllMantenimientos(): Promise<Mantenimiento[]>;

  // Estadísticas
  getDashboardStats(): Promise<DashboardStats>;
}

let dbInstance: IRepository | null = null;

export async function getDb(): Promise<IRepository> {
  if (dbInstance) return dbInstance;

  // Prioridad 1: Supabase, si SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY están configurados
  if (isSupabaseConfigured()) {
    try {
      const supabaseRepo = new SupabaseRepository();
      const isConnected = await supabaseRepo.testConnection();
      if (isConnected) {
        dbInstance = supabaseRepo;
        return dbInstance;
      }
      console.warn('Supabase configurado pero no se pudo conectar (¿ya ejecutaste supabase_schema.sql?). Usando siguiente opción disponible.');
    } catch (e) {
      console.warn('Error conectando a Supabase, usando siguiente opción disponible:', e);
    }
  }

  // Try MySQL only if all env vars are explicitly set and MySQL password is configured
  const hasMySqlConfig = !!(
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER
  );

  if (hasMySqlConfig) {
    try {
      const mysqlRepo = new MySqlRepository();
      const isConnected = await mysqlRepo.testConnection();
      if (isConnected) {
        dbInstance = mysqlRepo;
        return dbInstance;
      }
    } catch (e) {
      // MySQL not available, fall through to JSON silently
    }
  }

  // Always fallback to JSON Database (Zero-Config, no server needed)
  dbInstance = new JsonRepository();
  return dbInstance;
}
