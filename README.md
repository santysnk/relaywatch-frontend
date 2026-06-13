# RelayWatch — Frontend

Cliente web para el monitoreo de **registradores eléctricos** (relés de protección y analizadores de red): un panel con tarjetas por equipo que muestran sus mediciones en vivo, y la administración completa de equipos y catálogos.

Trabajo Práctico final de **Desarrollo Web Full Stack** — desarrollado por **Santiago Casal** y **Vanina Labrunee**.

## 🌐 App en vivo

**▶ App:** [https://relaywatch-app.vercel.app](https://relaywatch-app.vercel.app) — usuario de prueba: `admin@relaywatch.com` / `12345678`

**🖥️ Landing:** [https://santysnk.github.io/relaywatch-frontend/](https://santysnk.github.io/relaywatch-frontend/) — página de presentación del proyecto (estática, independiente de la app; su código está en [`docs/`](docs/)).

> ⏳ El backend está en el plan gratuito de Render: si estuvo inactivo, la primera carga (login) puede tardar ~50 s en "despertar". Después responde normal.

| | |
|---|---|
| Frontend (este repo) | desplegado en **Vercel** |
| Backend / API | [relaywatch-backend](https://github.com/santysnk/relaywatch-backend) en **Render** |
| Base de datos | MySQL en **filess.io** |
| Landing (presentación) | carpeta `docs/`, servida por **GitHub Pages** |

---

## Stack

- **React 19 + TypeScript + Vite**
- **React Router 7** (rutas protegidas por sesión)
- **Axios** con interceptores: adjunta el JWT en cada request y redirige al login si la sesión expira (401)
- Estado global con **Context API** (sesión y lista de registradores)
- CSS propio, tema oscuro

## Funcionalidades

- **Login / Registro** con validación por campo y manejo de errores del servidor.
- **Roles**: el `admin` administra todo; el `invitado` solo visualiza el panel.
- **Panel de registradores**: una tarjeta por equipo con sus mediciones agrupadas en dos paneles (ej. corrientes y tensiones). Color de cabecera configurable por equipo y color de fondo de la grilla a gusto del usuario (se recuerda por navegador).
- **Mediciones en vivo**: un botón global inicia/detiene el monitoreo — cada tarjeta consulta las últimas lecturas según su período y muestra una barra de progreso animada entre muestras.
- **Gestión de registradores** (admin): alta/edición con test de conexión, **mapeo** de qué parámetros mide cada equipo (panel, orden y relación de transformación TT/TC, máximo 3 por panel), eliminación con confirmación y **papelera para restaurar** (las lecturas históricas nunca se pierden).
- **Catálogos** (admin): CRUD de parámetros, relaciones de transformación y títulos de panel, en un modal con pestañas.

## Puesta en marcha

```bash
# 0. Tener el backend corriendo (ver su README): API en http://localhost:3000

# 1. Clonar e instalar
git clone https://github.com/santysnk/relaywatch-frontend.git
cd relaywatch-frontend
npm install

# 2. Variables de entorno
#    copiar .env.example a .env (la URL por defecto ya apunta al backend local)

# 3. Levantar en modo desarrollo
npm run dev
```

La app queda en `http://localhost:5173`. Para entrar la primera vez está el usuario semilla del backend: `admin@relaywatch.com` / `12345678`.

## Estructura del código

```
src/
├── api/            instancia de axios + interceptores (token, 401)
├── components/     compartidos: Modal, ModalConfirmacion, Spinner, ProtectedRoute
├── context/        AuthContext (sesión)
├── tipos/          interfaces TypeScript (espejo de lo que devuelve la API)
└── paginas/
    ├── PaginaLogin / PaginaRegistro
    └── PaginaRegistradores/
        ├── contexto/      lista de registradores (fetch + recarga)
        ├── hooks/         usarLecturas (polling de mediciones)
        └── componentes/
            ├── layout/        VistaRegistradores (coordina todo)
            ├── navegacion/    barra superior + selector de color
            ├── tarjetas/      grilla y tarjeta de cada equipo
            └── modales/       registrador, catálogos, mapeo, papelera
```

Convención de carpetas: cada componente vive junto a quien lo **renderiza** (los modales los renderiza el layout, que coordina sus estados); lo compartido por varios módulos se asciende a `src/components/`.

## Detalles de implementación que valen la pena

- **La etiqueta de cada box de medición** (R, S, T, R-S...) se deriva de la última palabra del nombre del parámetro en el catálogo ("Corriente R" → "R").
- **El orden y panel de cada medición** se persisten en el backend (`config_registrador`), no en el cliente: la tarjeta se ve igual desde cualquier sesión.
- El contenido del botón de mediciones se recrea con `key` en cada cambio de estado, lo que lo hace inmune a extensiones del navegador que reescriben el DOM (React #11538).
- `vite.config.ts` usa `usePolling` para que el watcher funcione de forma confiable en carpetas sincronizadas (OneDrive).
