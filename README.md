# SIGEM — Sistema de Gestión de Equipos de Cómputo

Sistema web para el control de inventario, fallas técnicas y mantenimiento de
equipos de cómputo en instituciones educativas. Incluye landing pública,
autenticación con roles, panel administrativo con tablero analítico, gestión
de inventario, mesa de ayuda tipo Kanban, generación de reportes/hojas de
vida imprimibles, subida de archivos (fotos/documentos) y temas claro/oscuro/
daltónico.

---

## Tabla de contenido

1. [¿Qué hay en esta carpeta?](#qué-hay-en-esta-carpeta)
2. [Requisitos previos](#requisitos-previos)
3. [Instalación desde cero](#instalación-desde-cero)
4. [Configurar la base de datos](#configurar-la-base-de-datos)
5. [Ejecutar el proyecto](#ejecutar-el-proyecto)
6. [Credenciales de acceso](#credenciales-de-acceso)
7. [Funcionalidades](#funcionalidades)
8. [Roles de usuario](#roles-de-usuario)
9. [Estructura del proyecto](#estructura-del-proyecto)
10. [Variables de entorno](#variables-de-entorno)
11. [Problemas comunes](#problemas-comunes)
12. [Scripts disponibles](#scripts-disponibles)

---

## ¿Qué hay en esta carpeta?

| Carpeta / archivo | Contenido |
|---|---|
| `src/app/page.tsx` | Landing pública (marketing) de SIGEM. |
| `src/app/login/` | Pantalla de inicio de sesión. |
| `src/app/admin/` | Panel administrativo (requiere sesión): Dashboard, Equipos, Fallas, Reportes, Hoja de Vida. |
| `src/app/api/` | Endpoints del backend (Next.js Route Handlers): auth, equipos, fallas, mantenimientos, dashboard, subida de archivos. |
| `src/components/` | Componentes compartidos: layout del admin, selector de tema, campo de subida de archivos. |
| `src/lib/db/` | Capa de acceso a datos: interfaz común (`repository.ts`) + 3 implementaciones intercambiables (Supabase, MySQL, JSON local). |
| `src/lib/auth.ts` | Firma/verificación de sesión (JWT casero) y utilidades de rol. |
| `src/lib/supabaseClient.ts` | Cliente de Supabase (solo servidor) + helper de Storage. |
| `src/middleware.ts` | Protege las rutas `/admin/*` y redirige `/login` si ya hay sesión. |
| `supabase_schema.sql` | Script SQL para crear las tablas en un proyecto de Supabase (Postgres). |
| `schema.sql` | Script SQL equivalente para MySQL/phpMyAdmin (alternativa opcional a Supabase). |
| `data/db.json` | Base de datos local en JSON — se crea sola si no configuras Supabase ni MySQL. **No se debe versionar en git** (ya está en `.gitignore`). |
| `.env` | Variables de entorno (credenciales). **Nunca se sube a git.** |

---

## Requisitos previos

- **Node.js 18.18 o superior** (recomendado 20.x). Verifica con:
  ```bash
  node --version
  ```
- **npm** (viene con Node).
- Una cuenta gratuita en **[supabase.com](https://supabase.com)** (recomendado) *o* un servidor MySQL/phpMyAdmin (opcional) — si no configuras ninguno, el sistema funciona igual guardando los datos en un archivo JSON local, sin necesidad de nada más.

---

## Instalación desde cero

1. **Descarga o clona el proyecto** y entra a la carpeta:
   ```bash
   cd va2
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Crea el archivo `.env`** en la raíz del proyecto (si no existe) con al menos esto:
   ```bash
   JWT_SECRET=escribe_aqui_una_frase_secreta_larga_y_unica
   ```
   El resto de variables (Supabase o MySQL) son opcionales — ver la sección
   [Variables de entorno](#variables-de-entorno).

4. **(Opcional pero recomendado) Conecta Supabase** — ver el siguiente paso.

5. **Arranca el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000).

> Si el proyecto vive dentro de una carpeta sincronizada por OneDrive/Google
> Drive/Dropbox, la primera compilación puede tardar varios minutos (el
> sincronizador bloquea archivos mientras Next.js escribe su caché). No es un
> error: espera a que la terminal muestre `✓ Ready`. Ver
> [Problemas comunes](#problemas-comunes).

---

## Configurar la base de datos

SIGEM elige automáticamente dónde guardar los datos, en este orden de
prioridad:

```
1. Supabase   (si SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY están en .env)
2. MySQL      (si DB_HOST, DB_USER y DB_NAME están en .env)
3. JSON local (data/db.json) — modo automático, cero configuración
```

### Opción recomendada: Supabase (base de datos + fotos/documentos)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com/dashboard).
2. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **service_role key** (la clave secreta, no la `anon`/pública)
3. Pégalas en tu `.env`:
   ```bash
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
   ```
4. Ve a **SQL Editor → New query** en el dashboard de Supabase, pega **todo**
   el contenido de [`supabase_schema.sql`](./supabase_schema.sql) y presiona
   **Run**. Esto crea las tablas (`usuarios`, `equipos`, `fallas`,
   `mantenimientos`), activa seguridad a nivel de fila y siembra datos de
   ejemplo (incluye el usuario `admin`).
5. Reinicia `npm run dev`. El bucket de Storage para fotos/documentos
   (`sigem-uploads`) se crea automáticamente la primera vez que alguien sube
   un archivo — no requiere pasos manuales.

### Opción alternativa: MySQL / phpMyAdmin

1. Crea la base de datos ejecutando [`schema.sql`](./schema.sql) en tu
   servidor MySQL (phpMyAdmin → Importar, o `mysql -u root -p < schema.sql`).
2. Completa en `.env`:
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=control_equipos
   ```
   > Nota: con MySQL no está disponible la subida de fotos/documentos (esa
   > función usa Supabase Storage). El resto del sistema funciona igual.

### Opción cero-configuración: JSON local

No hagas nada. Si no defines ni Supabase ni MySQL, el sistema crea
automáticamente `data/db.json` con datos de ejemplo la primera vez que
arranca. Ideal para probar el sistema rápidamente sin crear ninguna cuenta.

---

## Ejecutar el proyecto

```bash
npm run dev        # modo desarrollo, con recarga en caliente
npm run build       # compila para producción
npm run start        # sirve la build de producción (ejecutar build antes)
npm run lint          # revisa el código con ESLint
```

---

## Credenciales de acceso

Todas las opciones de base de datos (Supabase, MySQL o JSON) siembran el
mismo usuario administrador de prueba:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |

**Cámbiala** antes de usar el sistema con datos reales (no hay pantalla de
gestión de usuarios todavía — se actualiza directamente en la tabla
`usuarios`, con la contraseña en hash SHA-256).

---

## Funcionalidades

### Landing pública (`/`)
Presentación institucional del sistema: características, beneficios,
formulario de contacto y llamado a iniciar sesión.

### Inicio de sesión (`/login`)
Autenticación por usuario/contraseña. La sesión se guarda en una cookie
firmada (HMAC-SHA256) válida por 7 días.

### Dashboard (`/admin/dashboard`)
Centro de control con estadísticas en tiempo real: total de equipos, estado
del inventario, gráfico de composición (dona) y de fallas por estado
(barras), más los últimos incidentes reportados.

### Gestión de Equipos (`/admin/equipos`)
Inventario completo con vista de **galería** o **tabla**, búsqueda, filtro
por estado, orden por columna y paginación. Permite registrar, editar y
eliminar equipos, subir una **foto del equipo**, y enlaza a su Hoja de Vida.

### Registro de Fallas (`/admin/fallas`)
Mesa de ayuda técnica en formato **tablero Kanban** (arrastra las tarjetas
entre *Reportado → En Proceso → Resuelto*) o en vista de lista. Permite
adjuntar una **foto de evidencia** al reportar una falla y documentar la
solución al resolverla.

### Reportes (`/admin/reportes`)
Genera un listado filtrable del inventario (por estado, ubicación, marca),
con resumen numérico, **exportación a CSV** (compatible con Excel) e
impresión en formato de documento oficial.

### Hoja de Vida (`/admin/equipos/[id]/hoja-de-vida`)
Ficha técnica completa de cada equipo: especificaciones, historial de
mantenimientos (con costo y **documento/factura adjunta**), código **QR**
para acceso rápido desde un celular, e impresión en formato certificado.

### Temas: claro / oscuro / daltónico
Selector visible en la landing, login y panel admin (ícono de sol/luna +
ícono de ojo). El modo claro/oscuro se recuerda entre sesiones. El modo
daltónico ajusta la paleta de verdes/rojos (más distinguibles para
daltonismo rojo-verde) en gráficos y badges de estado, y puede combinarse
con cualquiera de los dos temas.

---

## Roles de usuario

| Acción | Admin | Técnico |
|---|:---:|:---:|
| Ver equipos, fallas, reportes | ✅ | ✅ |
| Registrar/editar equipos y fallas | ✅ | ✅ |
| Eliminar equipos | ✅ | ❌ (bloqueado también en el servidor) |
| Ver costos de mantenimiento | ✅ | ❌ (oculto en la Hoja de Vida) |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                 # Landing pública
│   ├── login/                   # Login
│   ├── admin/                   # Panel administrativo (protegido)
│   │   ├── dashboard/
│   │   ├── equipos/
│   │   │   └── [id]/hoja-de-vida/
│   │   ├── fallas/
│   │   └── reportes/
│   └── api/                     # Backend (Route Handlers)
│       ├── auth/                # login, logout, sesión actual
│       ├── equipos/             # CRUD de equipos + mantenimientos
│       ├── fallas/               # CRUD de fallas
│       ├── dashboard/            # estadísticas
│       └── upload/               # subida de archivos a Supabase Storage
├── components/                   # UI compartida (layout admin, tema, subida de archivos)
├── lib/
│   ├── db/                       # Capa de datos: Supabase / MySQL / JSON, intercambiables
│   ├── auth.ts                   # Sesión y verificación de rol
│   └── supabaseClient.ts         # Cliente de Supabase (servidor)
└── middleware.ts                 # Protección de rutas /admin
```

---

## Variables de entorno

Archivo `.env` en la raíz del proyecto (nunca se sube a git):

```bash
# Obligatoria: secreto para firmar la sesión de usuario
JWT_SECRET=una_frase_larga_y_secreta

# Opcional — Supabase (recomendado: base de datos + fotos/documentos)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role

# Opcional — MySQL (alternativa a Supabase; sin subida de archivos)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=control_equipos
```

Si ninguna variable de base de datos está configurada, el sistema usa
automáticamente `data/db.json`.

---

## Problemas comunes

**`npm run dev` se queda pegado en "✓ Starting..." y nunca dice "Ready".**
Casi siempre es porque el proyecto está dentro de una carpeta sincronizada
por OneDrive/Drive/Dropbox, que bloquea archivos mientras Next.js escribe su
caché (`.next/`). Soluciones:
- Espera unos minutos sin cancelar — normalmente sí termina.
- Si sigue sin arrancar, borra la carpeta `.next` y vuelve a intentar:
  ```bash
  rm -rf .next
  npm run dev
  ```
- Para una solución permanente, excluye la carpeta del proyecto de la
  sincronización en tiempo real de OneDrive, o trabaja fuera de esa carpeta.

**Los equipos/fallas no aparecen o da error 500 en las peticiones a `/api/...`.**
Revisa que hayas ejecutado `supabase_schema.sql` en el SQL Editor de Supabase
(si configuraste `SUPABASE_URL`), o que las credenciales de MySQL en `.env`
sean correctas. Si Supabase falla al conectar, el sistema cae
automáticamente a MySQL y luego a JSON local — revisa la consola del
servidor para ver cuál se está usando.

**La subida de fotos/documentos da error "requiere Supabase configurado".**
La subida de archivos solo funciona con Supabase Storage. Si usas MySQL o
JSON local para la base de datos, esa función queda deshabilitada hasta que
configures `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Genera la build de producción. |
| `npm run start` | Sirve la build de producción (requiere `npm run build` antes). |
| `npm run lint` | Corre ESLint sobre todo el proyecto. |

---

## Stack técnico

- **[Next.js 14](https://nextjs.org/)** (App Router) + React 18 + TypeScript
- **Tailwind CSS** (con tema claro/oscuro/daltónico vía variables CSS)
- **Framer Motion** para animaciones
- **Supabase** (Postgres + Storage) como backend de datos y archivos
- **mysql2** como alternativa de base de datos
- **qrcode.react** para el código QR de la Hoja de Vida
- Autenticación propia con cookies firmadas (HMAC-SHA256), sin dependencias externas de auth
