-- ============================================================================
-- SIGEM · Esquema de base de datos para Supabase (Postgres)
-- Pega este script completo en: Supabase Dashboard > SQL Editor > New query
-- y presiona "Run". Es seguro volver a ejecutarlo (usa IF NOT EXISTS / ON CONFLICT).
-- ============================================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- hash SHA-256
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'tecnico' CHECK (rol IN ('admin', 'tecnico')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo_inventario TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  serial TEXT NOT NULL UNIQUE,
  procesador TEXT NOT NULL,
  ram TEXT NOT NULL,
  disco_duro TEXT NOT NULL,
  sistema_operativo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Excelente' CHECK (estado IN ('Excelente', 'Bueno', 'Falla', 'De Baja')),
  ubicacion TEXT NOT NULL,
  observaciones TEXT DEFAULT '',
  foto_url TEXT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de Fallas
CREATE TABLE IF NOT EXISTS fallas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  fecha_reporte TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado_reparacion TEXT NOT NULL DEFAULT 'Reportado' CHECK (estado_reparacion IN ('Reportado', 'En Proceso', 'Resuelto')),
  responsable TEXT NOT NULL,
  solucion TEXT,
  fecha_solucion TIMESTAMPTZ,
  evidencia_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_fallas_equipo_id ON fallas(equipo_id);

-- 4. Tabla de Mantenimientos (Historial para la Hoja de Vida)
CREATE TABLE IF NOT EXISTS mantenimientos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('Preventivo', 'Correctivo')),
  descripcion TEXT NOT NULL,
  fecha_mantenimiento TIMESTAMPTZ NOT NULL DEFAULT now(),
  responsable TEXT NOT NULL,
  costo NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  documento_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_equipo_id ON mantenimientos(equipo_id);

-- ----------------------------------------------------------------------------
-- Seguridad: se activa Row Level Security sin políticas. Esto bloquea por
-- completo el acceso vía la clave "anon" (por si algún día se expone al
-- navegador); el servidor de SIGEM siempre usa la service_role key, que
-- ignora RLS, así que la app sigue funcionando con normalidad.
-- ----------------------------------------------------------------------------
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Datos iniciales
-- ----------------------------------------------------------------------------

-- Usuario administrador por defecto (contraseña: admin123)
INSERT INTO usuarios (username, password, nombre, rol)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador General', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Equipos de prueba
INSERT INTO equipos (codigo_inventario, nombre, marca, modelo, serial, procesador, ram, disco_duro, sistema_operativo, estado, ubicacion, observaciones)
VALUES
  ('EQ-001', 'PC All-in-One HP', 'HP', 'ProOne 440 G6', 'MXL12345AB', 'Intel Core i5-10500T', '8 GB DDR4', '256 GB SSD', 'Windows 11 Pro', 'Excelente', 'Laboratorio 1', 'Equipo de uso estudiantil para desarrollo de software.'),
  ('EQ-002', 'Computador de Torre Dell', 'Dell', 'OptiPlex 3080', 'DELL8877XX', 'Intel Core i3-10100', '16 GB DDR4', '1 TB HDD', 'Windows 10 Pro', 'Bueno', 'Biblioteca', 'Equipo asignado para consultas generales en biblioteca.'),
  ('EQ-003', 'Portátil Lenovo ThinkPad', 'Lenovo', 'L14 Gen 2', 'LNV443322Z', 'AMD Ryzen 5 5650U', '16 GB DDR4', '512 GB SSD', 'Ubuntu Linux 22.04', 'Falla', 'Sala de Profesores', 'El equipo no enciende la pantalla, se sospecha de falla en flex de video.')
ON CONFLICT (codigo_inventario) DO NOTHING;

-- Falla de prueba (usa el id de EQ-003)
INSERT INTO fallas (equipo_id, descripcion, estado_reparacion, responsable)
SELECT id, 'El computador no enciende la pantalla al presionar el botón de encendido. El led de energía parpadea.', 'Reportado', 'Ing. Carlos Mendoza'
FROM equipos WHERE codigo_inventario = 'EQ-003'
AND NOT EXISTS (SELECT 1 FROM fallas WHERE descripcion LIKE 'El computador no enciende la pantalla%');

-- Mantenimientos de prueba
INSERT INTO mantenimientos (equipo_id, tipo, descripcion, responsable, costo)
SELECT id, 'Preventivo', 'Limpieza general de polvo interno, cambio de pasta térmica del procesador y soplado de ventiladores.', 'Téc. Laura Gómez', 15.00
FROM equipos WHERE codigo_inventario = 'EQ-001'
AND NOT EXISTS (SELECT 1 FROM mantenimientos WHERE descripcion LIKE 'Limpieza general de polvo interno%');

INSERT INTO mantenimientos (equipo_id, tipo, descripcion, responsable, costo)
SELECT id, 'Correctivo', 'Cambio de fuente de poder dañada por picos de energía. Se instaló fuente genérica de 400W.', 'Ing. Carlos Mendoza', 45.00
FROM equipos WHERE codigo_inventario = 'EQ-002'
AND NOT EXISTS (SELECT 1 FROM mantenimientos WHERE descripcion LIKE 'Cambio de fuente de poder%');
