# Clínica Virtual — Frontend

Frontend del Trabajo Práctico N°2 de Programación 2, construido con Angular 21 y
Angular Material. Consume la API del repositorio de backend
([Trabajo-Practico-N-2-Prog2](https://github.com/feliprono01/Trabajo-Practico-N-2-Prog2)).

## Versiones utilizadas

- Node.js: v24.14.0
- npm: 11.9.0
- Angular CLI: 21.2.26
- Angular / Angular Material: ^21.2.0

## Requisitos previos

- Node.js `^20.19.0`, `^22.12.0` o `^24.0.0` (se usó Node 24 LTS).
- El [backend](https://github.com/feliprono01/Trabajo-Practico-N-2-Prog2) corriendo en
  `http://localhost:3000` con CORS habilitado para `http://localhost:4200`.

## Instalación

```bash
npm install
```

## Configuración

La URL base de la API se define en un único lugar: `src/environments/environment.ts`
(y su equivalente de producción `environment.production.ts`).

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Si el backend corre en otro puerto u host, modificar `apiUrl` ahí.

## Levantar el proyecto

Con el backend ya corriendo:

```bash
ng serve
```

Luego abrir `http://localhost:4200/` en el navegador.

## Build de producción

```bash
ng build
```

Los artefactos de build quedan en `dist/clinica-virtual-frontend`.

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/         # authGuard (sesión) y roleGuard (rol)
│   ├── interceptors/   # authInterceptor (agrega el token a los requests)
│   ├── models/         # interfaces TypeScript (usuario, cobertura, auth, api-response)
│   └── services/       # AuthService y CoberturaService (llamadas HTTP)
├── layout/
│   ├── header/         # barra superior con sesión, rol y cerrar sesión
│   ├── menu/            # menú de navegación según rol
│   ├── footer/          # datos de contacto de la clínica
│   └── main-layout/      # layout general que envuelve el router-outlet
└── features/
    ├── home/             # pantalla principal con y sin sesión
    ├── auth/login/        # login
    ├── auth/registro/    # registro de paciente
    ├── perfil/            # "Mi perfil"
    ├── en-construccion/  # placeholder para secciones de semanas futuras
    ├── access-denied/    # acceso denegado por rol
    └── not-found/        # ruta inexistente
```

Cada rol (`admin`, `medico`, `operador`, `paciente`) tiene su propio prefijo de
rutas (`/admin`, `/medico`, `/operador`, `/paciente`), protegido por `roleGuard`.
La ruta `/perfil` está protegida solo por `authGuard` (cualquier usuario logueado).
