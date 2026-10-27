import mysql from 'mysql2/promise';
import { IRepository } from './repository';
import { Equipo, Falla, Mantenimiento, Usuario, DashboardStats, EstadoEquipo, EstadoReparacion, TipoMantenimiento } from './types';

export class MySqlRepository implements IRepository {
  private pool: mysql.Pool | null = null;

  private getPool() {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return this.pool;
  }

  async testConnection(): Promise<boolean> {
    try {
      const pool = this.getPool();
      const conn = await pool.getConnection();
      conn.release();
      return true;
    } catch (e) {
      console.warn('Fallo al conectar a MySQL:', e);
      return false;
    }
  }

  // --- Usuarios ---
  async getUsuarioByUsername(username: string): Promise<Usuario | null> {
    const pool = this.getPool();
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    const users = rows as any[];
    if (users.length === 0) return null;
    return {
      id: users[0].id,
      username: users[0].username,
      password: users[0].password,
      nombre: users[0].nombre,
      rol: users[0].rol as 'admin' | 'tecnico',
      created_at: users[0].created_at ? new Date(users[0].created_at).toISOString() : undefined,
    };
  }

  async createUsuario(usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
    const pool = this.getPool();
    const [result] = await pool.query(
      'INSERT INTO usuarios (username, password, nombre, rol) VALUES (?, ?, ?, ?)',
      [usuario.username, usuario.password || '', usuario.nombre, usuario.rol]
    );
    const insertId = (result as any).insertId;
    return { ...usuario, id: insertId };
  }

  // --- Equipos ---
  async getEquipos(): Promise<Equipo[]> {
    const pool = this.getPool();
    const [rows] = await pool.query('SELECT * FROM equipos ORDER BY id DESC');
    const items = rows as any[];
    return items.map((r) => ({
      id: r.id,
      codigo_inventario: r.codigo_inventario,
      nombre: r.nombre,
      marca: r.marca,
      modelo: r.modelo,
      serial: r.serial,
      procesador: r.procesador,
      ram: r.ram,
      disco_duro: r.disco_duro,
      sistema_operativo: r.sistema_operativo,
      estado: r.estado as EstadoEquipo,
      ubicacion: r.ubicacion,
      observaciones: r.observaciones || '',
      fecha_registro: r.fecha_registro ? new Date(r.fecha_registro).toISOString() : undefined,
    }));
  }

  async getEquipoById(id: number): Promise<Equipo | null> {
    const pool = this.getPool();
    const [rows] = await pool.query('SELECT * FROM equipos WHERE id = ?', [id]);
    const items = rows as any[];
    if (items.length === 0) return null;
    const r = items[0];
    return {
      id: r.id,
      codigo_inventario: r.codigo_inventario,
      nombre: r.nombre,
      marca: r.marca,
      modelo: r.modelo,
      serial: r.serial,
      procesador: r.procesador,
      ram: r.ram,
      disco_duro: r.disco_duro,
      sistema_operativo: r.sistema_operativo,
      estado: r.estado as EstadoEquipo,
      ubicacion: r.ubicacion,
      observaciones: r.observaciones || '',
      fecha_registro: r.fecha_registro ? new Date(r.fecha_registro).toISOString() : undefined,
    };
  }

  async createEquipo(equipo: Omit<Equipo, 'id'>): Promise<Equipo> {
    const pool = this.getPool();
    const [result] = await pool.query(
      `INSERT INTO equipos (codigo_inventario, nombre, marca, modelo, serial, procesador, ram, disco_duro, sistema_operativo, estado, ubicacion, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipo.codigo_inventario,
        equipo.nombre,
        equipo.marca,
        equipo.modelo,
        equipo.serial,
        equipo.procesador,
        equipo.ram,
        equipo.disco_duro,
        equipo.sistema_operativo,
        equipo.estado,
        equipo.ubicacion,
        equipo.observaciones || '',
      ]
    );
    const insertId = (result as any).insertId;
    return {
      ...equipo,
      id: insertId,
      fecha_registro: new Date().toISOString(),
    };
  }

  async updateEquipo(id: number, equipoData: Partial<Equipo>): Promise<Equipo | null> {
    const pool = this.getPool();
    const fields: string[] = [];
    const values: any[] = [];

    const keys = Object.keys(equipoData) as Array<keyof typeof equipoData>;
    for (const key of keys) {
      if (key !== 'id' && key !== 'fecha_registro' && equipoData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(equipoData[key]);
      }
    }

    if (fields.length === 0) {
      return this.getEquipoById(id);
    }

    values.push(id);
    await pool.query(`UPDATE equipos SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getEquipoById(id);
  }

  async deleteEquipo(id: number): Promise<boolean> {
    const pool = this.getPool();
    const [result] = await pool.query('DELETE FROM equipos WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // --- Fallas ---
  async getFallas(): Promise<Falla[]> {
    const pool = this.getPool();
    const [rows] = await pool.query(
      `SELECT f.*, e.nombre as equipo_nombre, e.codigo_inventario as equipo_codigo 
       FROM fallas f 
       JOIN equipos e ON f.equipo_id = e.id 
       ORDER BY f.id DESC`
    );
    const items = rows as any[];
    return items.map((r) => ({
      id: r.id,
      equipo_id: r.equipo_id,
      equipo_nombre: r.equipo_nombre,
      equipo_codigo: r.equipo_codigo,
      descripcion: r.descripcion,
      fecha_reporte: r.fecha_reporte ? new Date(r.fecha_reporte).toISOString() : '',
      estado_reparacion: r.estado_reparacion as EstadoReparacion,
      responsable: r.responsable,
      solucion: r.solucion || undefined,
      fecha_solucion: r.fecha_solucion ? new Date(r.fecha_solucion).toISOString() : undefined,
    }));
  }

  async getFallaById(id: number): Promise<Falla | null> {
    const pool = this.getPool();
    const [rows] = await pool.query(
      `SELECT f.*, e.nombre as equipo_nombre, e.codigo_inventario as equipo_codigo 
       FROM fallas f 
       JOIN equipos e ON f.equipo_id = e.id 
       WHERE f.id = ?`,
      [id]
    );
    const items = rows as any[];
    if (items.length === 0) return null;
    const r = items[0];
    return {
      id: r.id,
      equipo_id: r.equipo_id,
      equipo_nombre: r.equipo_nombre,
      equipo_codigo: r.equipo_codigo,
      descripcion: r.descripcion,
      fecha_reporte: r.fecha_reporte ? new Date(r.fecha_reporte).toISOString() : '',
      estado_reparacion: r.estado_reparacion as EstadoReparacion,
      responsable: r.responsable,
      solucion: r.solucion || undefined,
      fecha_solucion: r.fecha_solucion ? new Date(r.fecha_solucion).toISOString() : undefined,
    };
  }

  async createFalla(falla: Omit<Falla, 'id'>): Promise<Falla> {
    const pool = this.getPool();
    
    // Iniciar transacción
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO fallas (equipo_id, descripcion, responsable, estado_reparacion) VALUES (?, ?, ?, ?)',
        [falla.equipo_id, falla.descripcion, falla.responsable, falla.estado_reparacion || 'Reportado']
      );
      const insertId = (result as any).insertId;

      // Actualizar automáticamente el estado del equipo
      await conn.query("UPDATE equipos SET estado = 'Falla' WHERE id = ?", [falla.equipo_id]);

      await conn.commit();

      return {
        ...falla,
        id: insertId,
        fecha_reporte: new Date().toISOString(),
      };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async updateFalla(id: number, fallaData: Partial<Falla>): Promise<Falla | null> {
    const pool = this.getPool();
    const conn = await pool.getConnection();
    
    try {
      await conn.beginTransaction();

      const fields: string[] = [];
      const values: any[] = [];
      const keys = Object.keys(fallaData) as Array<keyof typeof fallaData>;
      
      for (const key of keys) {
        if (key !== 'id' && key !== 'fecha_reporte' && fallaData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(fallaData[key]);
        }
      }

      if (fields.length > 0) {
        values.push(id);
        await conn.query(`UPDATE fallas SET ${fields.join(', ')} WHERE id = ?`, values);
      }

      // Obtener los datos actuales de la falla para actualizar el equipo si se resolvió
      const [fallaRows] = await conn.query('SELECT equipo_id, estado_reparacion FROM fallas WHERE id = ?', [id]);
      const fallas = fallaRows as any[];

      if (fallas.length > 0) {
        const eqId = fallas[0].equipo_id;
        const estadoRep = fallas[0].estado_reparacion;

        if (estadoRep === 'Resuelto') {
          // Verificar si hay otras fallas activas
          const [activasRows] = await conn.query(
            "SELECT COUNT(*) as count FROM fallas WHERE equipo_id = ? AND estado_reparacion != 'Resuelto' AND id != ?",
            [eqId, id]
          );
          const activeCount = (activasRows as any)[0].count;

          if (activeCount === 0) {
            // Obtener el estado actual del equipo, si es 'Falla', cambiar a 'Bueno'
            const [eqRows] = await conn.query('SELECT estado FROM equipos WHERE id = ?', [eqId]);
            const eqs = eqRows as any[];
            if (eqs.length > 0 && eqs[0].estado === 'Falla') {
              await conn.query("UPDATE equipos SET estado = 'Bueno' WHERE id = ?", [eqId]);
            }
          }
        }
      }

      await conn.commit();
      return this.getFallaById(id);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  // --- Mantenimientos ---
  async getMantenimientosByEquipo(equipoId: number): Promise<Mantenimiento[]> {
    const pool = this.getPool();
    const [rows] = await pool.query(
      `SELECT m.*, e.nombre as equipo_nombre 
       FROM mantenimientos m 
       JOIN equipos e ON m.equipo_id = e.id 
       WHERE m.equipo_id = ? 
       ORDER BY m.id DESC`,
      [equipoId]
    );
    const items = rows as any[];
    return items.map((r) => ({
      id: r.id,
      equipo_id: r.equipo_id,
      equipo_nombre: r.equipo_nombre,
      tipo: r.tipo as TipoMantenimiento,
      descripcion: r.descripcion,
      fecha_mantenimiento: r.fecha_mantenimiento ? new Date(r.fecha_mantenimiento).toISOString() : '',
      responsable: r.responsable,
      costo: parseFloat(r.costo || '0'),
    }));
  }

  async getAllMantenimientos(): Promise<Mantenimiento[]> {
    const pool = this.getPool();
    const [rows] = await pool.query(
      `SELECT m.*, e.nombre as equipo_nombre 
       FROM mantenimientos m 
       JOIN equipos e ON m.equipo_id = e.id 
       ORDER BY m.id DESC`
    );
    const items = rows as any[];
    return items.map((r) => ({
      id: r.id,
      equipo_id: r.equipo_id,
      equipo_nombre: r.equipo_nombre,
      tipo: r.tipo as TipoMantenimiento,
      descripcion: r.descripcion,
      fecha_mantenimiento: r.fecha_mantenimiento ? new Date(r.fecha_mantenimiento).toISOString() : '',
      responsable: r.responsable,
      costo: parseFloat(r.costo || '0'),
    }));
  }

  async createMantenimiento(mantenimiento: Omit<Mantenimiento, 'id'>): Promise<Mantenimiento> {
    const pool = this.getPool();
    const [result] = await pool.query(
      'INSERT INTO mantenimientos (equipo_id, tipo, descripcion, responsable, costo) VALUES (?, ?, ?, ?, ?)',
      [
        mantenimiento.equipo_id,
        mantenimiento.tipo,
        mantenimiento.descripcion,
        mantenimiento.responsable,
        mantenimiento.costo || 0.0,
      ]
    );
    const insertId = (result as any).insertId;
    return {
      ...mantenimiento,
      id: insertId,
      fecha_mantenimiento: new Date().toISOString(),
    };
  }

  // --- Estadísticas ---
  async getDashboardStats(): Promise<DashboardStats> {
    const pool = this.getPool();
    
    const [eqStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado IN ('Excelente', 'Bueno') THEN 1 ELSE 0 END) as buen_estado,
        SUM(CASE WHEN estado = 'Falla' THEN 1 ELSE 0 END) as con_fallas,
        SUM(CASE WHEN estado = 'De Baja' THEN 1 ELSE 0 END) as de_baja
      FROM equipos
    `);
    
    const [fallaStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN estado_reparacion = 'Reportado' THEN 1 ELSE 0 END) as reportadas,
        SUM(CASE WHEN estado_reparacion = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado_reparacion = 'Resuelto' THEN 1 ELSE 0 END) as resueltas
      FROM fallas
    `);

    const eq = (eqStats as any)[0] || { total: 0, buen_estado: 0, con_fallas: 0, de_baja: 0 };
    const fa = (fallaStats as any)[0] || { reportadas: 0, en_proceso: 0, resueltas: 0 };

    return {
      totalEquipos: eq.total || 0,
      equiposBuenEstado: eq.buen_estado || 0,
      equiposConFallas: eq.con_fallas || 0,
      equiposDeBaja: eq.de_baja || 0,
      fallasReportadas: fa.reportadas || 0,
      fallasEnProceso: fa.en_proceso || 0,
      fallasResueltas: fa.resueltas || 0,
    };
  }
}
