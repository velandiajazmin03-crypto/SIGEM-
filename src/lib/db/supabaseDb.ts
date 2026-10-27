import { IRepository } from './repository';
import { Equipo, Falla, Mantenimiento, Usuario, DashboardStats, EstadoEquipo, EstadoReparacion, TipoMantenimiento } from './types';
import { getSupabaseClient } from '@/lib/supabaseClient';

type FallaRow = Omit<Falla, 'equipo_nombre' | 'equipo_codigo'> & {
  equipos: { nombre: string; codigo_inventario: string } | null;
};

type MantenimientoRow = Omit<Mantenimiento, 'equipo_nombre'> & {
  equipos: { nombre: string } | null;
};

function mapFalla(r: FallaRow): Falla {
  const { equipos, ...rest } = r;
  return {
    ...rest,
    equipo_nombre: equipos?.nombre || 'Equipo Desconocido',
    equipo_codigo: equipos?.codigo_inventario || 'N/A',
  };
}

function mapMantenimiento(r: MantenimientoRow): Mantenimiento {
  const { equipos, ...rest } = r;
  return {
    ...rest,
    equipo_nombre: equipos?.nombre || 'Equipo Desconocido',
    costo: parseFloat(String(rest.costo || 0)),
  };
}

export class SupabaseRepository implements IRepository {
  private get client() {
    return getSupabaseClient();
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.from('equipos').select('id', { count: 'exact', head: true });
      return !error;
    } catch (e) {
      console.warn('Fallo al conectar a Supabase:', e);
      return false;
    }
  }

  // --- Usuarios ---
  async getUsuarioByUsername(username: string): Promise<Usuario | null> {
    const { data, error } = await this.client.from('usuarios').select('*').ilike('username', username).maybeSingle();
    if (error || !data) return null;
    return data as Usuario;
  }

  async createUsuario(usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
    const { data, error } = await this.client.from('usuarios').insert(usuario).select().single();
    if (error) throw error;
    return data as Usuario;
  }

  // --- Equipos ---
  async getEquipos(): Promise<Equipo[]> {
    const { data, error } = await this.client.from('equipos').select('*').order('id', { ascending: false });
    if (error) throw error;
    return (data || []) as Equipo[];
  }

  async getEquipoById(id: number): Promise<Equipo | null> {
    const { data, error } = await this.client.from('equipos').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return data as Equipo;
  }

  async createEquipo(equipo: Omit<Equipo, 'id'>): Promise<Equipo> {
    const { data, error } = await this.client.from('equipos').insert(equipo).select().single();
    if (error) throw error;
    return data as Equipo;
  }

  async updateEquipo(id: number, equipoData: Partial<Equipo>): Promise<Equipo | null> {
    const { id: _id, fecha_registro, ...updates } = equipoData;
    const { data, error } = await this.client.from('equipos').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return (data as Equipo) || null;
  }

  async deleteEquipo(id: number): Promise<boolean> {
    // ON DELETE CASCADE en Postgres se encarga de fallas y mantenimientos asociados.
    const { error, count } = await this.client.from('equipos').delete({ count: 'exact' }).eq('id', id);
    if (error) throw error;
    return (count || 0) > 0;
  }

  // --- Fallas ---
  async getFallas(): Promise<Falla[]> {
    const { data, error } = await this.client
      .from('fallas')
      .select('*, equipos(nombre, codigo_inventario)')
      .order('id', { ascending: false });
    if (error) throw error;
    return ((data || []) as unknown as FallaRow[]).map(mapFalla);
  }

  async getFallaById(id: number): Promise<Falla | null> {
    const { data, error } = await this.client
      .from('fallas')
      .select('*, equipos(nombre, codigo_inventario)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapFalla(data as unknown as FallaRow);
  }

  async createFalla(falla: Omit<Falla, 'id'>): Promise<Falla> {
    const { equipo_nombre, equipo_codigo, ...payload } = falla as Falla;
    const { data, error } = await this.client.from('fallas').insert(payload).select().single();
    if (error) throw error;

    await this.client.from('equipos').update({ estado: 'Falla' as EstadoEquipo }).eq('id', falla.equipo_id).neq('estado', 'Falla');

    const created = data as Falla;
    return { ...created, equipo_nombre, equipo_codigo };
  }

  async updateFalla(id: number, fallaData: Partial<Falla>): Promise<Falla | null> {
    const { id: _id, fecha_reporte, equipo_nombre, equipo_codigo, ...updates } = fallaData as Falla;
    const { data, error } = await this.client.from('fallas').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) return null;

    if (updates.estado_reparacion === 'Resuelto') {
      const eqId = (data as Falla).equipo_id;
      const { count } = await this.client
        .from('fallas')
        .select('id', { count: 'exact', head: true })
        .eq('equipo_id', eqId)
        .neq('id', id)
        .neq('estado_reparacion', 'Resuelto');

      if (!count) {
        await this.client.from('equipos').update({ estado: 'Bueno' as EstadoEquipo }).eq('id', eqId).eq('estado', 'Falla');
      }
    }

    return this.getFallaById(id);
  }

  // --- Mantenimientos ---
  async getMantenimientosByEquipo(equipoId: number): Promise<Mantenimiento[]> {
    const { data, error } = await this.client
      .from('mantenimientos')
      .select('*, equipos(nombre)')
      .eq('equipo_id', equipoId)
      .order('id', { ascending: false });
    if (error) throw error;
    return ((data || []) as unknown as MantenimientoRow[]).map(mapMantenimiento);
  }

  async getAllMantenimientos(): Promise<Mantenimiento[]> {
    const { data, error } = await this.client
      .from('mantenimientos')
      .select('*, equipos(nombre)')
      .order('id', { ascending: false });
    if (error) throw error;
    return ((data || []) as unknown as MantenimientoRow[]).map(mapMantenimiento);
  }

  async createMantenimiento(mantenimiento: Omit<Mantenimiento, 'id'>): Promise<Mantenimiento> {
    const { equipo_nombre, ...payload } = mantenimiento as Mantenimiento;
    const { data, error } = await this.client.from('mantenimientos').insert(payload).select().single();
    if (error) throw error;
    return { ...(data as Mantenimiento), costo: parseFloat(String((data as any).costo || 0)) };
  }

  // --- Estadísticas ---
  async getDashboardStats(): Promise<DashboardStats> {
    const [{ data: equipos, error: eqErr }, { data: fallas, error: faErr }] = await Promise.all([
      this.client.from('equipos').select('estado'),
      this.client.from('fallas').select('estado_reparacion'),
    ]);
    if (eqErr) throw eqErr;
    if (faErr) throw faErr;

    const eqList = (equipos || []) as { estado: EstadoEquipo }[];
    const faList = (fallas || []) as { estado_reparacion: EstadoReparacion }[];

    return {
      totalEquipos: eqList.length,
      equiposBuenEstado: eqList.filter((e) => e.estado === 'Excelente' || e.estado === 'Bueno').length,
      equiposConFallas: eqList.filter((e) => e.estado === 'Falla').length,
      equiposDeBaja: eqList.filter((e) => e.estado === 'De Baja').length,
      fallasReportadas: faList.filter((f) => f.estado_reparacion === 'Reportado').length,
      fallasEnProceso: faList.filter((f) => f.estado_reparacion === 'En Proceso').length,
      fallasResueltas: faList.filter((f) => f.estado_reparacion === 'Resuelto').length,
    };
  }
}
