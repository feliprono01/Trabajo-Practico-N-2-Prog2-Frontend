# Clínica Virtual — Frontend

Frontend del Trabajo Práctico N°2 de Programación 2 (Sistema de Gestión de Turnos
Médicos), construido con Angular 21 y Angular Material. Entrega "Semanas 2 a 4":
la aplicación queda completa para los cuatro roles (`admin`, `medico`, `operador`,
`paciente`). Consume la API del repositorio de backend
([Trabajo-Practico-N-2-Prog2](https://github.com/feliprono01/Trabajo-Practico-N-2-Prog2)).

## Versiones utilizadas

- Node.js: v24.14.0
- npm: 11.9.0
- Angular CLI: 21.2.26
- Angular / Angular Material: ^21.2.0
- Librería de gráficos: [`ng2-charts`](https://valor-software.com/ng2-charts/) v10 +
  [`chart.js`](https://www.chartjs.org/) v4 (usada en el dashboard de Reportes).

## Puesta en marcha desde cero

1. **Base de datos**: seguir el README del repositorio backend para crear la base
   `clinica` e importar `backend/clinica.sql`. Importante: esta entrega migró las
   columnas de ID de `tinyint` a `int` y amplió los datos de prueba, así que si
   venís de la semana 1 hay que **reimportar la base desde cero**
   (`DROP DATABASE clinica;` y volver a importar).
2. **Backend**: `cd backend && npm install && npm run dev` (ver su propio README
   para variables de entorno). Debe quedar escuchando en `http://localhost:3000`,
   con `FRONTEND_URL=http://localhost:4200` en su `.env` para que CORS lo permita.
3. **Frontend** (este repo):
   ```bash
   npm install
   ng serve
   ```
   Abrir `http://localhost:4200/`.
4. Verificar que todo esté conectado: `GET http://localhost:3000/health` debe
   responder `200`, y la pantalla de login del frontend debe poder autenticar
   con los usuarios de prueba de abajo.

## Configuración

La URL base de la API se define en un único lugar: `src/environments/environment.ts`
(y su equivalente de producción `environment.production.ts`).

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Si el backend corre en otro puerto u host, modificar `apiUrl` ahí. Ningún service
ni componente hardcodea URLs de la API fuera de este archivo.

## Build de producción

```bash
ng build
```

Los artefactos de build quedan en `dist/clinica-virtual-frontend`.

## Usuarios de prueba (los cuatro roles)

**Contraseña de todos: `Test1234!`**

| Rol | Nombre | DNI | Sede | Especialidad |
|---|---|---|---|---|
| `admin` | Marcos Gomez | `18222333` | — | — |
| `medico` | Ana Lopez | `20111222` | Sede Centro | Traumatologia |
| `medico` | Pedro Garcia | `21333444` | Sede Centro | Clinica Medica |
| `medico` | Sofia Martinez | `22444555` | Sede Centro (también atiende en Sede Norte) | Pediatria |
| `operador` | Juan Perez | `15200548` | Sede Centro | — |
| `operador` | Diego Rodriguez | `28666777` | Sede Norte | — |
| `paciente` | Franco Friggeri | `36000960` | — | — |
| `paciente` | Laura Diaz | `30555666` | — | — |
| `paciente` | Carla Fernandez | `40777888` | — | — |

La base de prueba trae agenda y turnos en los tres estados (`confirmado`,
`cancelado`, `atendido`) para el día actual, para poder probar cada pantalla sin
cargar datos a mano.

## Pantallas por rol

- **Administrador**: Sedes, Especialidades, Coberturas (CRUD con tabla, filtro de
  texto, alta/edición en diálogo, baja con confirmación), Usuarios (listado
  paginado con filtros, alta de operador/médico/admin, edición de cualquier
  usuario incluidos pacientes), Auditoría (solo lectura, paginada, filtros por
  usuario/entidad/fecha), Reportes (dashboard con gráficos de barras y torta,
  ranking de médicos y tasa de cancelación, filtro de rango de fechas).
- **Médico**: Mi agenda (alta/edición/baja de rangos horarios, selector de
  fecha), Turnos programados (selector de fecha y sede, marcar como atendido con
  carga de historial clínico, cancelar), Historial clínico (buscar paciente por
  DNI/apellido y ver solo lo que él mismo atendió).
- **Operador**: Agenda y turnos (filtro fecha/sede, alta de agenda a cualquier
  médico en su sede, edición/baja y ver turnos confirmados — todo restringido a
  su propia sede), Pacientes (alta, mismo formulario que el registro público),
  Asignar turno (buscar paciente + mismo wizard que usa el paciente, con la sede
  fija del operador).
- **Paciente**: Solicitar turno (wizard especialidad → sede → médico → fecha →
  horario → nota → confirmación, con disponibilidad real consultada a la API),
  Mis turnos (ordenados por proximidad, detalle desplegable, cancelar, ver
  historial clínico si el turno fue atendido), Mis datos (edición de email,
  contraseña, teléfono y cobertura; el resto es de solo lectura).
- **Todos los roles**: notificaciones en la campana del header (contador de no
  leídas, listado desplegable, marcar como leída), con actualización inmediata
  del contador tras confirmar/cancelar/atender un turno.

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/         # authGuard (sesión) y roleGuard (rol)
│   ├── interceptors/   # authInterceptor (agrega token) y errorInterceptor (401 -> logout)
│   ├── models/         # interfaces TypeScript de cada entidad
│   └── services/       # un service por recurso de la API (HttpClient + ApiResponse<T>)
├── shared/
│   ├── confirm-dialog/          # diálogo de confirmación genérico (bajas)
│   ├── empty-state/             # mensaje reutilizable para listados vacíos
│   ├── paciente-form/           # formulario de alta de paciente (registro público y operador)
│   ├── rango-agenda-form-dialog/ # alta/edición de un rango horario de agenda
│   └── turno-wizard/            # wizard de solicitud de turno (paciente y operador)
├── layout/
│   ├── header/          # barra superior con sesión, rol, notificaciones y cerrar sesión
│   ├── menu/             # menú de navegación según rol
│   ├── footer/           # datos de contacto de la clínica
│   └── main-layout/       # layout general que envuelve el router-outlet
└── features/
    ├── home/, auth/login/, auth/registro/, perfil/, access-denied/, not-found/
    ├── admin/      # sedes, especialidades, coberturas, usuarios, auditoria, reportes
    ├── medico/     # agenda, turnos, historial
    ├── operador/   # agenda-turnos, pacientes, asignar-turno
    └── paciente/   # nuevo-turno, mis-turnos, mis-datos
```

Cada rol (`admin`, `medico`, `operador`, `paciente`) tiene su propio prefijo de
rutas (`/admin`, `/medico`, `/operador`, `/paciente`), protegido por `roleGuard`
tanto desde el menú como por URL directa. La ruta `/perfil` está protegida solo
por `authGuard` (cualquier usuario logueado, de solo lectura).
