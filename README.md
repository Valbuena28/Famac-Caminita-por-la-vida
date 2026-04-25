# SGP-FAMAC: Sistema de Gestión de Pacientes

Un sistema médico integral construido con los estándares profesionales más altos de **Next.js 15 (Frontend)** y **NestJS (Backend)**, diseñado para escalabilidad y mantenimiento a largo plazo.

## 🚀 Tecnologías Core
* **Frontend**: Next.js App Router, React 19, Tailwind CSS v4, Framer Motion, Lucide-React.
* **Backend**: NestJS, TypeScript, Bcrypt, Passport-JWT, Swagger OpenAPI.
* **Base de Datos**: PostgreSQL alojado localmente y manejado a través de Prisma ORM.

## 📦 Estructura del Monorepo

El proyecto está dividido en dos carpetas independientes para garantizar una separación de responsabilidades limpia:

### 1. El Backend (`/backend`)
El motor lógico. Contiene módulos independientes para `Auth`, `Users`, `Patients`, `Medical-Records` y `Appointments`.
*   **Iniciar el Servidor**: 
    1. `cd backend`
    2. Asegúrate de tener tu `.env` con la URL de Postgres (ej. `postgresql://usuario:clave@localhost:5432/sgp_famac`).
    3. Para generar o actualizar la DB: `npx prisma migrate dev`
    4. Para iniciar: `npm run start:dev`
*   **Documentación API Interactiva**: NestJS generará y servirá la documentación en `http://localhost:3000/api/docs` gracias a `@nestjs/swagger`. Podrás probar las rutas allí mismo.

### 2. El Frontend (`/frontend`)
La interfaz visual de uso médico. Construida con un diseño premium (Glassmorphism, animaciones suaves).
*   **Iniciar la App**:
    1. `cd frontend`
    2. `npm run dev`
    3. Abre `http://localhost:3001` en tu navegador para ver la pantalla de inicio de sesión.
*   **Rutas Base**: Explora `/dashboard`, `/dashboard/patients` y `/dashboard/appointments`.

## 🛡️ Reglas de Seguridad y Autenticación
El sistema exige Tokens Bearer (JWT) creados al inicio de sesión. Adicionalmente, cuenta con control de acceso basado en roles (`@Roles(Role.ADMIN)`) que bloquea a empleados sin los permisos adecuados en tiempo de ejecución.


---

## VPS - Despliegue en Produccion

### Datos del Servidor
| Parametro | Valor |
|---|---|
| IP | 69.6.242.161 |
| Puerto SSH | 22022 |
| Usuario | root |
| OS | AlmaLinux 9.7 (RHEL-based) |
| RAM | 3.6 GB |
| Disco | 98 GB |

### Procesos en Produccion (PM2)
| Servicio | URL | Puerto | Nombre PM2 |
|---|---|---|---|
| Frontend | http://69.6.242.161:3000 | 3000 | famac-frontend |
| Backend | http://69.6.242.161:3005 | 3005 | famac-backend |
| PostgreSQL | solo localhost | 5432 | systemd |

### Recursos del Servidor al momento del despliegue
- CPU: 3.3% en uso / 96.7% idle
- RAM: 1.2 GB usados de 3.6 GB (33%)
- Disco: 9 GB usados de 98 GB (10%)
- PM2 Restarts: 0 (proceso estable)

### Credenciales Admin
- Email: admin@famac.com
- Password: admin123
- IMPORTANTE: cambiar en produccion

---

### Paso a Paso

#### 1. Instalar el entorno en AlmaLinux 9

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs tar gzip
npm install -g pm2
dnf install -y postgresql-server
postgresql-setup --initdb --unit postgresql
systemctl enable --now postgresql
```

#### 2. Configurar PostgreSQL
```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'TU_CLAVE';"
sudo -u postgres psql -c "CREATE DATABASE sgp_famac;"

# CRITICO: AlmaLinux usa peer/ident por defecto. Prisma necesita md5.
sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sed -i 's/peer/md5/g'  /var/lib/pgsql/data/pg_hba.conf
systemctl restart postgresql
```

#### 3. Transferir el Proyecto
```bash
# Empaquetar sin node_modules, .next, dist, .git
tar -czvf SGP-FAMAC.tar.gz --exclude=node_modules --exclude=.next --exclude=dist --exclude=.git .

# Subir via SCP (notar el puerto SSH no estandar 22022)
scp -P 22022 SGP-FAMAC.tar.gz root@69.6.242.161:/root/SGP-FAMAC/
cd /root/SGP-FAMAC && tar -xzf SGP-FAMAC.tar.gz && rm SGP-FAMAC.tar.gz
```

#### 4. Setup del Backend
```bash
cd /root/SGP-FAMAC/backend
npm install

# CRITICO: Siempre 'generate' ANTES de 'db push' y del seed.
# Sin esto ts-node no encuentra PrismaClient y falla con error TS2305.
npx prisma generate
npx prisma db push --accept-data-loss
npx ts-node prisma/seed.ts
npm run build
```

#### 5. Setup del Frontend
```bash
cd /root/SGP-FAMAC/frontend
echo "NEXT_PUBLIC_API_URL=http://69.6.242.161:3005" > .env.local
npm install --legacy-peer-deps
npm run build
```

#### 6. Iniciar con PM2
```bash
# CRITICO: NestJS con sourceRoot:src en nest-cli.json
# genera en dist/src/main.js, NO en dist/main.js como se esperaria.
pm2 start /root/SGP-FAMAC/backend/dist/src/main.js --name famac-backend

cd /root/SGP-FAMAC/frontend
PORT=3000 pm2 start npm --name famac-frontend -- run start

# Persistencia en reboot
pm2 save
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root
```

---

### Piedras en el Camino (no volver a tropezar)

| # | Problema | Causa | Solucion |
|---|---|---|---|
| 1 | PrismaClient no exportado en seed | prisma generate no se ejecuto antes | Ejecutar npx prisma generate primero |
| 2 | Error TS req implicitly has any type | TypeScript strict en NestJS bloquea build | Anotar @Request() req: any en el controller |
| 3 | PM2: Script not found dist/main.js | nest-cli sourceRoot:src genera en dist/src/main.js | Apuntar PM2 a dist/src/main.js |
| 4 | Prisma no conecta a PostgreSQL | pg_hba.conf usa peer/ident por defecto en AlmaLinux | Cambiar a md5 y reiniciar PostgreSQL |
| 5 | SSH sin TTY interactivo en Windows | PowerShell no aloca pseudo-TTY | Usar node-ssh para automatizar todos los comandos |
| 6 | App muestra "No se pudo conectar al servidor" en produccion | CORS del backend solo permitia localhost:3000 como origin | Cambiar app.enableCors({ origin: true }) en main.ts para aceptar cualquier origen |
| 7 | El frontend sigue llamando a localhost:3005 aunque se cambio axios.ts | La pagina de login importaba axios directamente con URL hardcodeada, no usaba el archivo axios.ts | Revisar TODOS los archivos del frontend con grep para buscar localhost hardcodeado, no solo el archivo centralizado |
| 8 | La variable NEXT_PUBLIC_API_URL no surte efecto aunque este en .env.local | En Next.js las variables NEXT_PUBLIC son embebidas en BUILD TIME, no en runtime | Siempre reconstruir (npm run build) despues de cambiar .env.local en produccion |
| 9 | Proceso PM2 "online" pero app sin funcionar | PM2 dice que el proceso esta online pero el codigo aun tiene bugs de configuracion | Verificar el build real buscando la URL correcta en .next/static: grep -r "IP:PUERTO" .next/static/ |

### Comandos Utiles en Produccion
```bash
pm2 list
pm2 logs famac-backend --lines 50
pm2 logs famac-frontend --lines 50
pm2 monit
pm2 restart famac-backend
pm2 restart famac-frontend
ss -tlnp | grep -E '3000|3005|5432'
free -h && df -h /
```

---

## 🚶 Módulo Caminata FAMAC — Progreso de Implementación

### Estado General
| Fase | Descripción | Estado | Fecha |
|------|-------------|--------|-------|
| 1 | Modelo de Datos (Prisma Schema) | ✅ Completada | 2026-04-22 |
| 2 | Backend API (NestJS - 6 módulos) | ✅ Completada | 2026-04-22 |
| 3 | Frontend - Páginas Principales | ✅ Completada | 2026-04-22 |
| 4 | Dashboard Estadístico + Gráficos | ✅ Completada | 2026-04-22 |
| 5 | Integración con Módulo Pacientes | ✅ Completada (Schema) | 2026-04-22 |

### Fase 1 — Modelo de Datos (✅ Completada)
Se agregaron al `schema.prisma`:
- **3 enums**: `WalkEventStatus`, `SponsorTier`, `ProductType`
- **9 modelos nuevos**: `WalkEvent`, `PointOfSale`, `InventoryItem`, `Stock`, `Sale`, `SaleItem`, `Sponsor`, `WalkExpense`, `FundAllocation`
- **Relación inversa** `fundAllocations` agregada al modelo `Patient` existente para trazabilidad

### Fase 2 — Backend API (✅ Completada)
Se crearon 6 módulos NestJS con controllers, services y DTOs:

| Módulo | Ruta Base | Endpoints |
|--------|-----------|-----------|
| `walk` | `/walk-events` | CRUD de eventos de caminata |
| `point-of-sale` | `/point-of-sale` | CRUD de puntos rosa + asignación de stock |
| `inventory` | `/inventory` | CRUD items + resumen de stock por evento |
| `sales` | `/sales` | Registro de ventas (actualiza stock automáticamente) |
| `sponsors` | `/sponsors` | CRUD patrocinantes con niveles |
| `walk-dashboard` | `/walk-dashboard` | Stats, heatmap, gastos, trazabilidad, histórico |

### Fase 3 + 4 — Frontend + Dashboard (✅ Completadas)
Se crearon 6 páginas nuevas y 2 componentes reutilizables:

| Ruta | Página | Funcionalidad |
|------|--------|---------------|
| `/dashboard/walk` | Dashboard Caminata | Termómetro, stats, links rápidos, tabla de eventos |
| `/dashboard/walk/pos` | Puntos de Venta | CRUD de Puntos Rosas con cards |
| `/dashboard/walk/inventory` | Inventario | CRUD productos con tabla |
| `/dashboard/walk/sales` | Ventas | Registro multi-producto con feed de ventas |
| `/dashboard/walk/sponsors` | Patrocinantes | CRUD con badges de nivel (Diamante/Platino/Oro/Plata) |
| `/dashboard/walk/traceability` | Trazabilidad | Gráficos Recharts (BarChart, PieChart), gastos, asignación de fondos |

**Componentes**: `ThermometerChart` (SVG animado con Framer Motion), `SponsorBadge` (badge de nivel con icono)

**Dependencia instalada**: `recharts` para gráficos

### Fase 5 — Integración Pacientes (✅ Schema listo)
- Relación `fundAllocations` ya conecta `FundAllocation` → `Patient`
- Endpoint `POST /walk-dashboard/:eventId/allocations` acepta `patientId` opcional
- En la ficha del paciente se puede consultar si fue beneficiado por fondos de caminata

### Piedras Encontradas (Módulo Caminata)

| # | Problema | Causa | Solución |
|---|----------|-------|----------|
| 10 | `Decimal` no exportado de `@prisma/client` | Prisma v7+ movió el tipo al namespace `Prisma` | Usar `import { Prisma } from '@prisma/client'` y `new Prisma.Decimal(0)` |
| 11 | Métodos `.add()`, `.gt()` no reconocidos en tipo `Decimal | null` | TypeScript no infiere el tipo correcto tras `|| new Prisma.Decimal(0)` | Castear explícitamente: `(value as Prisma.Decimal).add(...)` |
| 12 | `percent` possibly undefined en Recharts `Pie label` | El tipo de Recharts marca `percent` como opcional | Usar `(percent ?? 0)` con fallback |
| 13 | Turbopack FATAL: "Next.js package not found" al arrancar `npm run dev` | Cache `.next` corrupto por compilaciones previas | Borrar `.next` y `node_modules`, reinstalar con `npm install`. El `dev-local.bat` ya limpia `.next` automáticamente |

### 🖥️ Desarrollo Local Rápido
Para levantar todo el entorno local con un solo clic, ejecuta:
```
dev-local.bat
```
Esto abrirá **2 terminales** automáticamente:
- **Backend** (NestJS): `http://localhost:3005` + Swagger en `/api/docs`
- **Frontend** (Next.js): `http://localhost:3000`

> **NOTA**: El `.bat` inyecta `NEXT_PUBLIC_API_URL=http://localhost:3005` como variable de entorno en runtime. El archivo `.env.local` del frontend siempre apunta a **producción** (`http://69.6.242.161:3005`), así que los builds de producción no se ven afectados.

> **PREREQUISITO**: PostgreSQL debe estar corriendo en `localhost:5432` con la DB `sgp_famac`.

### ⚠️ Despliegue en Producción — PENDIENTE
- **SSH cambió**: Las credenciales SSH del servidor cambiaron. Hasta que no se proporcionen las nuevas, no se puede desplegar.

**⛔ CRITICO — NO OLVIDAR ANTES DE HACER BUILD EN EL SERVIDOR:**
```bash
# El .env.local del frontend en LOCAL apunta a localhost:3005
# En PRODUCCION debe apuntar a la IP del VPS.
# Ya existe un archivo .env.production con la URL correcta.
# Copiar ANTES de hacer build:

cd /root/SGP-FAMAC/frontend
cp .env.production .env.local
cat .env.local   # Verificar que dice: NEXT_PUBLIC_API_URL=http://69.6.242.161:3005
npm run build    # AHORA sí hacer el build
```
> Si se olvida este paso, el frontend en producción intentará conectar a `localhost:3005` y mostrará "No se pudo conectar al servidor". Es el error #8 de esta tabla.

**Pasos completos para desplegar el módulo de caminata:**
1. Subir el código al servidor (scp o git pull)
2. Backend:
   ```bash
   cd /root/SGP-FAMAC/backend
   npm install
   npx prisma generate
   npx prisma db push --accept-data-loss
   npm run build
   pm2 restart famac-backend
   ```
3. Frontend:
   ```bash
   cd /root/SGP-FAMAC/frontend
   npm install
   cp .env.production .env.local    # ⛔ NO OLVIDAR
   npm run build
   pm2 restart famac-frontend
   ```
4. Verificar: `pm2 logs --lines 20`


