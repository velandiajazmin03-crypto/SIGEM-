import fs from 'fs/promises';
import path from 'path';
import { IRepository } from './repository';
import { Equipo, Falla, Mantenimiento, Usuario, DashboardStats } from './types';

interface Schema {
  usuarios: Usuario[];
  equipos: Equipo[];
  fallas: Falla[];
  mantenimientos: Mantenimiento[];
}

export class JsonRepository implements IRepository {
  private filePath: string;
  private initialized = false;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'db.json');
  }

  private async init() {
    if (this.initialized) return;

    const dir = path.dirname(this.filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (e) {}

    try {
      await fs.access(this.filePath);
    } catch (e) {
      // Create with default seed data
      const defaultData: Schema = {
        usuarios: [
          {
            id: 1,
            username: 'admin',
            password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // SHA-256 of admin123
            nombre: 'Administrador General',
            rol: 'admin',
          },
        ],
        equipos: [
          {
            id: 1,
            codigo_inventario: 'EQ-001',
            nombre: 'PC All-in-One HP',
            marca: 'HP',
            modelo: 'ProOne 440 G6',
            serial: 'MXL12345AB',
            procesador: 'Intel Core i5-10500T',
            ram: '8 GB DDR4',
            disco_duro: '256 GB SSD',
            sistema_operativo: 'Windows 11 Pro',
            estado: 'Excelente',
            ubicacion: 'Laboratorio 1',
            observaciones: 'Equipo de uso estudiantil para desarrollo de software.',
            fecha_registro: new Date().toISOString(),
          },
          {
            id: 2,
            codigo_inventario: 'EQ-002',
            nombre: 'Computador de Torre Dell',
            marca: 'Dell',
            modelo: 'OptiPlex 3080',
            serial: 'DELL8877XX',
            procesador: 'Intel Core i3-10100',
            ram: '16 GB DDR4',
            disco_duro: '1 TB HDD',
            sistema_operativo: 'Windows 10 Pro',
            estado: 'Bueno',
            ubicacion: 'Biblioteca',
            observaciones: 'Equipo asignado para consultas generales en biblioteca.',
            fecha_registro: new Date().toISOString(),
          },
          {
            id: 3,
            codigo_inventario: 'EQ-003',
            nombre: 'Portatil Lenovo ThinkPad',
            marca: 'Lenovo',
            modelo: 'L14 Gen 2',
            serial: 'LNV443322Z',
            procesador: 'AMD Ryzen 5 5650U',
            ram: '16 GB DDR4',
            disco_duro: '512 GB SSD',
            sistema_operativo: 'Ubuntu Linux 22.04',
            estado: 'Falla',
            ubicacion: 'Sala de Profesores',
            observaciones: 'El equipo no enciende la pantalla, se sospecha de falla en flex de video.',
            fecha_registro: new Date().toISOString(),
          },
        ],
        fallas: [
          {
            id: 1,
            equipo_id: 3,
            descripcion: 'El computador no enciende la pantalla al presionar el botón de encendido. El led de energía parpadea.',
            fecha_reporte: new Date().toISOString(),
            estado_reparacion: 'Reportado',
            responsable: 'Ing. Carlos Mendoza',
          },
        ],
        mantenimientos: [
          {
            id: 1,
            equipo_id: 1,
            tipo: 'Preventivo',
            descripcion: 'Limpieza general de polvo interno, cambio de pasta térmica del procesador y soplado de ventiladores.',
            fecha_mantenimiento: new Date().toISOString(),
            responsable: 'Téc. Laura Gómez',
            costo: 15.0,
          },
          {
            id: 2,
            equipo_id: 2,
            tipo: 'Correctivo',
            descripcion: 'Cambio de fuente de poder dañada por picos de energía. Se instaló fuente genérica de 400W.',
            fecha_mantenimiento: new Date().toISOString(),
            responsable: 'Ing. Carlos Mendoza',
            costo: 45.0,
          },
        ],
      };
      await fs.writeFile(this.filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    }

    this.initialized = true;
  }

  private async read(): Promise<Schema> {
    await this.init();
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async write(data: Schema): Promise<void> {
    await this.init();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Usuarios ---
  async getUsuarioByUsername(username: string): Promise<Usuario | null> {
    const data = await this.read();
    const user = data.usuarios.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  async createUsuario(usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
    const data = await this.read();
    const id = data.usuarios.length > 0 ? Math.max(...data.usuarios.map((u) => u.id)) + 1 : 1;
    const nuevoUsuario: Usuario = { ...usuario, id };
    data.usuarios.push(nuevoUsuario);
    await this.write(data);
    return nuevoUsuario;
  }

  // --- Equipos ---
  async getEquipos(): Promise<Equipo[]> {
    const data = await this.read();
    return data.equipos;
  }

  async getEquipoById(id: number): Promise<Equipo | null> {
    const data = await this.read();
    const equipo = data.equipos.find((e) => e.id === id);
    return equipo || null;
  }

  async createEquipo(equipo: Omit<Equipo, 'id'>): Promise<Equipo> {
    const data = await this.read();
    const id = data.equipos.length > 0 ? Math.max(...data.equipos.map((e) => e.id)) + 1 : 1;
    const nuevoEquipo: Equipo = {
      ...equipo,
      id,
      foto_url: equipo.foto_url || null,
      fecha_registro: equipo.fecha_registro || new Date().toISOString(),
    };
    data.equipos.push(nuevoEquipo);
    await this.write(data);
    return nuevoEquipo;
  }

  async updateEquipo(id: number, equipoData: Partial<Equipo>): Promise<Equipo | null> {
    const data = await this.read();
    const idx = data.equipos.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const original = data.equipos[idx];
    const actualizado: Equipo = { ...original, ...equipoData, id };
    data.equipos[idx] = actualizado;

    // Si el estado del equipo cambió, podríamos sincronizarlo si es necesario, 
    // pero aquí lo hacemos explícito de acuerdo a la solicitud
    await this.write(data);
    return actualizado;
  }

  async deleteEquipo(id: number): Promise<boolean> {
    const data = await this.read();
    const initialLen = data.equipos.length;
    data.equipos = data.equipos.filter((e) => e.id !== id);
    if (data.equipos.length === initialLen) return false;

    // Cascade delete fallas y mantenimientos
    data.fallas = data.fallas.filter((f) => f.equipo_id !== id);
    data.mantenimientos = data.mantenimientos.filter((m) => m.equipo_id !== id);

    await this.write(data);
    return true;
  }

  // --- Fallas ---
  async getFallas(): Promise<Falla[]> {
    const data = await this.read();
    return data.fallas.map((falla) => {
      const eq = data.equipos.find((e) => e.id === falla.equipo_id);
      return {
        ...falla,
        equipo_nombre: eq ? eq.nombre : 'Equipo Desconocido',
        equipo_codigo: eq ? eq.codigo_inventario : 'N/A',
      };
    });
  }

  async getFallaById(id: number): Promise<Falla | null> {
    const data = await this.read();
    const falla = data.fallas.find((f) => f.id === id);
    if (!falla) return null;
    const eq = data.equipos.find((e) => e.id === falla.equipo_id);
    return {
      ...falla,
      equipo_nombre: eq ? eq.nombre : 'Equipo Desconocido',
      equipo_codigo: eq ? eq.codigo_inventario : 'N/A',
    };
  }

  async createFalla(falla: Omit<Falla, 'id'>): Promise<Falla> {
    const data = await this.read();
    const id = data.fallas.length > 0 ? Math.max(...data.fallas.map((f) => f.id)) + 1 : 1;
    const nuevaFalla: Falla = {
      ...falla,
      id,
      fecha_reporte: falla.fecha_reporte || new Date().toISOString(),
    };
    data.fallas.push(nuevaFalla);

    // Si se reporta una falla, actualizamos automáticamente el estado del equipo a 'Falla'
    const eqIdx = data.equipos.findIndex((e) => e.id === falla.equipo_id);
    if (eqIdx !== -1 && data.equipos[eqIdx].estado !== 'Falla') {
      data.equipos[eqIdx].estado = 'Falla';
    }

    await this.write(data);
    return nuevaFalla;
  }

  async updateFalla(id: number, fallaData: Partial<Falla>): Promise<Falla | null> {
    const data = await this.read();
    const idx = data.fallas.findIndex((f) => f.id === id);
    if (idx === -1) return null;

    const original = data.fallas[idx];
    const actualizada: Falla = { ...original, ...fallaData, id };
    data.fallas[idx] = actualizada;

    // Si la falla cambió a Resuelto, podríamos cambiar el estado del equipo a Bueno o Excelente si no tiene más fallas activas
    if (fallaData.estado_reparacion === 'Resuelto') {
      const eqId = original.equipo_id;
      // Verificar si hay otras fallas activas para este equipo
      const tieneFallasActivas = data.fallas.some(
        (f) => f.equipo_id === eqId && f.id !== id && f.estado_reparacion !== 'Resuelto'
      );
      if (!tieneFallasActivas) {
        const eqIdx = data.equipos.findIndex((e) => e.id === eqId);
        if (eqIdx !== -1 && data.equipos[eqIdx].estado === 'Falla') {
          data.equipos[eqIdx].estado = 'Bueno'; // Restablecemos a bueno
        }
      }
    }

    await this.write(data);
    return actualizada;
  }

  // --- Mantenimientos ---
  async getMantenimientosByEquipo(equipoId: number): Promise<Mantenimiento[]> {
    const data = await this.read();
    return data.mantenimientos
      .filter((m) => m.equipo_id === equipoId)
      .map((m) => {
        const eq = data.equipos.find((e) => e.id === m.equipo_id);
        return {
          ...m,
          equipo_nombre: eq ? eq.nombre : 'Equipo Desconocido',
        };
      });
  }

  async getAllMantenimientos(): Promise<Mantenimiento[]> {
    const data = await this.read();
    return data.mantenimientos.map((m) => {
      const eq = data.equipos.find((e) => e.id === m.equipo_id);
      return {
        ...m,
        equipo_nombre: eq ? eq.nombre : 'Equipo Desconocido',
      };
    });
  }

  async createMantenimiento(mantenimiento: Omit<Mantenimiento, 'id'>): Promise<Mantenimiento> {
    const data = await this.read();
    const id = data.mantenimientos.length > 0 ? Math.max(...data.mantenimientos.map((m) => m.id)) + 1 : 1;
    const nuevoMantenimiento: Mantenimiento = {
      ...mantenimiento,
      id,
      fecha_mantenimiento: mantenimiento.fecha_mantenimiento || new Date().toISOString(),
    };
    data.mantenimientos.push(nuevoMantenimiento);
    await this.write(data);
    return nuevoMantenimiento;
  }

  // --- Estadísticas ---
  async getDashboardStats(): Promise<DashboardStats> {
    const data = await this.read();
    const totalEquipos = data.equipos.length;
    const equiposBuenEstado = data.equipos.filter((e) => e.estado === 'Excelente' || e.estado === 'Bueno').length;
    const equiposConFallas = data.equipos.filter((e) => e.estado === 'Falla').length;
    const equiposDeBaja = data.equipos.filter((e) => e.estado === 'De Baja').length;

    const fallasReportadas = data.fallas.filter((f) => f.estado_reparacion === 'Reportado').length;
    const fallasEnProceso = data.fallas.filter((f) => f.estado_reparacion === 'En Proceso').length;
    const fallasResueltas = data.fallas.filter((f) => f.estado_reparacion === 'Resuelto').length;

    return {
      totalEquipos,
      equiposBuenEstado,
      equiposConFallas,
      equiposDeBaja,
      fallasReportadas,
      fallasEnProceso,
      fallasResueltas,
    };
  }
}
