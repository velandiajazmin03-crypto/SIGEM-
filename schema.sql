-- Script SQL para la creación de la base de datos en phpMyAdmin (MySQL)
-- Base de datos: `control_equipos`

CREATE DATABASE IF NOT EXISTS `control_equipos` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `control_equipos`;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- SHA-256 hash
  `nombre` VARCHAR(100) NOT NULL,
  `rol` VARCHAR(20) NOT NULL DEFAULT 'tecnico',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Equipos
CREATE TABLE IF NOT EXISTS `equipos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_inventario` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `marca` VARCHAR(50) NOT NULL,
  `modelo` VARCHAR(50) NOT NULL,
  `serial` VARCHAR(100) NOT NULL UNIQUE,
  `procesador` VARCHAR(100) NOT NULL,
  `ram` VARCHAR(50) NOT NULL,
  `disco_duro` VARCHAR(50) NOT NULL,
  `sistema_operativo` VARCHAR(50) NOT NULL,
  `estado` ENUM('Excelente', 'Bueno', 'Falla', 'De Baja') NOT NULL DEFAULT 'Excelente',
  `ubicacion` VARCHAR(100) NOT NULL,
  `observaciones` TEXT,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Fallas
CREATE TABLE IF NOT EXISTS `fallas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `equipo_id` INT NOT NULL,
  `descripcion` TEXT NOT NULL,
  `fecha_reporte` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `estado_reparacion` ENUM('Reportado', 'En Proceso', 'Resuelto') NOT NULL DEFAULT 'Reportado',
  `responsable` VARCHAR(100) NOT NULL,
  `solucion` TEXT,
  `fecha_solucion` DATETIME,
  FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Mantenimientos (Historial para la Hoja de Vida)
CREATE TABLE IF NOT EXISTS `mantenimientos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `equipo_id` INT NOT NULL,
  `tipo` ENUM('Preventivo', 'Correctivo') NOT NULL,
  `descripcion` TEXT NOT NULL,
  `fecha_mantenimiento` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `responsable` VARCHAR(100) NOT NULL,
  `costo` DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar Usuario Administrador por defecto (Contraseña: admin123)
-- Hash SHA-256 de "admin123" es "24078914630b9f1a3fb0502a91a2211e0f03fa374828b8a531e240212ff96b86"
INSERT INTO `usuarios` (`username`, `password`, `nombre`, `rol`)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador General', 'admin')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Insertar Equipos de Prueba
INSERT INTO `equipos` (`codigo_inventario`, `nombre`, `marca`, `modelo`, `serial`, `procesador`, `ram`, `disco_duro`, `sistema_operativo`, `estado`, `ubicacion`, `observaciones`)
VALUES 
('EQ-001', 'PC All-in-One HP', 'HP', 'ProOne 440 G6', 'MXL12345AB', 'Intel Core i5-10500T', '8 GB DDR4', '256 GB SSD', 'Windows 11 Pro', 'Excelente', 'Laboratorio 1', 'Equipo de uso estudiantil para desarrollo de software.'),
('EQ-002', 'Computador de Torre Dell', 'Dell', 'OptiPlex 3080', 'DELL8877XX', 'Intel Core i3-10100', '16 GB DDR4', '1 TB HDD', 'Windows 10 Pro', 'Bueno', 'Biblioteca', 'Equipo asignado para consultas generales en biblioteca.'),
('EQ-003', 'Portátil Lenovo ThinkPad', 'Lenovo', 'L14 Gen 2', 'LNV443322Z', 'AMD Ryzen 5 5650U', '16 GB DDR4', '512 GB SSD', 'Ubuntu Linux 22.04', 'Falla', 'Sala de Profesores', 'El equipo no enciende la pantalla, se sospecha de falla en flex de video.')
ON DUPLICATE KEY UPDATE `codigo_inventario`=`codigo_inventario`;

-- Insertar Fallas de Prueba
INSERT INTO `fallas` (`equipo_id`, `descripcion`, `fecha_reporte`, `estado_reparacion`, `responsable`)
VALUES 
(3, 'El computador no enciende la pantalla al presionar el botón de encendido. El led de energía parpadea.', '2026-08-05 09:30:00', 'Reportado', 'Ing. Carlos Mendoza')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Insertar Mantenimientos de Prueba (Historial)
INSERT INTO `mantenimientos` (`equipo_id`, `tipo`, `descripcion`, `fecha_mantenimiento`, `responsable`, `costo`)
VALUES 
(1, 'Preventivo', 'Limpieza general de polvo interno, cambio de pasta térmica del procesador y soplado de ventiladores.', '2026-07-20 10:00:00', 'Téc. Laura Gómez', 15.00),
(2, 'Correctivo', 'Cambio de fuente de poder dañada por picos de energía. Se instaló fuente genérica de 400W.', '2026-08-01 14:30:00', 'Ing. Carlos Mendoza', 45.00)
ON DUPLICATE KEY UPDATE `id`=`id`;
