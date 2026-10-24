# GuitarLA — Backend (Strapi)

Backend **headless CMS** de **GuitarLA**, una tienda de guitarras con blog, construido con **Strapi 4**. Define tres tipos de contenido —**Guitarras**, **Posts** del blog y un **Curso** destacado— que se administran desde el panel de Strapi y se exponen como **API REST** para el frontend en Next.js (repositorio `GuitarLa-Nextjs`). Las imágenes se suben a **Cloudinary** y los datos se guardan en **PostgreSQL**.

![Tech](https://img.shields.io/badge/Strapi-4.5.0-4945FF)
![Tech](https://img.shields.io/badge/Node.js-14--18-339933)
![Tech](https://img.shields.io/badge/PostgreSQL-pg_8.6-336791)
![Tech](https://img.shields.io/badge/Cloudinary-upload-3448C5)
![Tech](https://img.shields.io/badge/License-MIT-green)

---

## Tabla de contenidos

- [GuitarLA — Backend (Strapi)](#guitarla--backend-strapi)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Qué hace el proyecto](#qué-hace-el-proyecto)
  - [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
    - [Requisitos previos](#requisitos-previos)
    - [Instalación](#instalación)
    - [Variables de entorno](#variables-de-entorno)
    - [Base de datos](#base-de-datos)
    - [Ejecutar en desarrollo](#ejecutar-en-desarrollo)
    - [Permisos públicos de la API](#permisos-públicos-de-la-api)
    - [Scripts disponibles](#scripts-disponibles)
  - [Tipos de contenido](#tipos-de-contenido)
    - [Guitarras (`api::guitarra.guitarra`)](#guitarras-apiguitarraguitarra)
    - [Post (`api::post.post`)](#post-apipostpost)
    - [Cursos (`api::curso.curso`)](#cursos-apicursocurso)
  - [Endpoints](#endpoints)
  - [Cómo funciona](#cómo-funciona)
    - [1. `src/api/`](#1-srcapi)
    - [2. `config/`](#2-config)
    - [Flujo](#flujo)
  - [Tecnologías](#tecnologías)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Configuración](#configuración)
  - [Licencia](#licencia)

---

## Qué hace el proyecto

- **3 tipos de contenido** con borrador/publicación (`draftAndPublish`):
  - `guitarra` (colección): nombre, descripción, precio, imagen y `url` generada desde el nombre.
  - `post` (colección): título, contenido, imagen y `url` generada desde el título.
  - `curso` (single type): título, contenido e imagen del curso destacado.
- **API REST** generada con las factorías de Strapi (`createCoreRouter`, `createCoreController`, `createCoreService`).
- **Subida de imágenes a Cloudinary** con `@strapi/provider-upload-cloudinary`.
- **Content Security Policy** que permite cargar imágenes y media desde `res.cloudinary.com` en el panel.
- **Paginación REST** por defecto de 25 elementos (máximo 100) e incluyendo el total (`withCount`).
- Plugins **Users & Permissions** (roles y permisos de la API) e **i18n**.

---

## Cómo ejecutar el proyecto

### Requisitos previos

- **Node.js** `>=14.19.1 <=18.x.x` y **npm** `>=6` (definidos en `engines` de `package.json`).
- Una base de datos **PostgreSQL** (el proyecto instala el driver `pg`).
- Una cuenta de **Cloudinary** para el almacenamiento de imágenes.

### Instalación

```bash
git clone <url-del-repositorio>
cd GuitarLa-Strapi
npm install
```

### Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS="clave1,clave2"
API_TOKEN_SALT=valor_aleatorio
ADMIN_JWT_SECRET=valor_aleatorio
JWT_SECRET=valor_aleatorio

# PostgreSQL (config/database.js)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=guitarla
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu_password
DATABASE_SSL=false

# Cloudinary (config/plugins.js)
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_KEY=tu_api_key
CLOUDINARY_SECRET=tu_api_secret
```

| Variable            | Usada en               | Descripción                                    |
| ------------------- | ---------------------- | ---------------------------------------------- |
| `HOST`              | `config/server.js`     | Host del servidor (por defecto `0.0.0.0`)      |
| `PORT`              | `config/server.js`     | Puerto (por defecto `1337`)                    |
| `APP_KEYS`          | `config/server.js`     | Claves de sesión, separadas por comas          |
| `API_TOKEN_SALT`    | `config/admin.js`      | Salt para los API tokens                       |
| `ADMIN_JWT_SECRET`  | `config/admin.js`      | Secreto JWT del panel de administración        |
| `JWT_SECRET`        | Users & Permissions    | Secreto JWT de los usuarios de la API          |
| `DATABASE_HOST`     | `config/database.js`   | Host de PostgreSQL                             |
| `DATABASE_PORT`     | `config/database.js`   | Puerto (por defecto `5432`)                    |
| `DATABASE_NAME`     | `config/database.js`   | Nombre de la base de datos                     |
| `DATABASE_USERNAME` | `config/database.js`   | Usuario de PostgreSQL                          |
| `DATABASE_PASSWORD` | `config/database.js`   | Contraseña de PostgreSQL (sin valor por defecto) |
| `DATABASE_SSL`      | `config/database.js`   | Conexión con SSL (por defecto `false`)         |
| `CLOUDINARY_NAME`   | `config/plugins.js`    | Cloud name de Cloudinary                       |
| `CLOUDINARY_KEY`    | `config/plugins.js`    | API key de Cloudinary                          |
| `CLOUDINARY_SECRET` | `config/plugins.js`    | API secret de Cloudinary                       |

El archivo `.env` está en `.gitignore`: nunca lo subas al repositorio. Para generar valores aleatorios para `APP_KEYS` y los secretos puedes usar `node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"`.

### Base de datos

`config/database.js` configura el cliente `postgres` y lee toda la conexión de las variables `DATABASE_*` del `.env` (no hay credenciales en el código). Crea una base de datos vacía en PostgreSQL con el nombre de `DATABASE_NAME`; Strapi crea las tablas automáticamente al arrancar.

Si la base de datos está en un servicio en la nube que exige SSL (por ejemplo, Render), usa `DATABASE_SSL=true`.

### Ejecutar en desarrollo

```bash
npm run develop
```

El panel de administración queda en `http://localhost:1337/admin` (la primera vez pide crear el usuario administrador) y la API en `http://localhost:1337/api`.

### Permisos públicos de la API

Para que el frontend pueda leer el contenido sin autenticación, en el panel ve a **Settings → Users & Permissions → Roles → Public** y habilita `find` y `findOne` en **Guitarra** y **Post**, y `find` en **Curso**.

### Scripts disponibles

| Script            | Comando          | Descripción                                   |
| ----------------- | ---------------- | --------------------------------------------- |
| `npm run develop` | `strapi develop` | Desarrollo con recarga automática             |
| `npm start`       | `strapi start`   | Producción, sin recarga automática            |
| `npm run build`   | `strapi build`   | Compila el panel de administración            |
| `npm run strapi`  | `strapi`         | Acceso directo al CLI de Strapi               |

---

## Tipos de contenido

### Guitarras (`api::guitarra.guitarra`)

Collection type — tabla `guitarras`.

| Campo         | Tipo                 | Notas                            |
| ------------- | -------------------- | -------------------------------- |
| `nombre`      | `string`             | Obligatorio                      |
| `descripcion` | `richtext`           |                                  |
| `precio`      | `integer`            |                                  |
| `imagen`      | `media` (una imagen) | Obligatorio, solo `images`       |
| `url`         | `uid`                | Generado a partir de `nombre`    |

### Post (`api::post.post`)

Collection type — tabla `posts`.

| Campo       | Tipo               | Notas                                      |
| ----------- | ------------------ | ------------------------------------------ |
| `titulo`    | `string`           | Obligatorio                                |
| `contenido` | `richtext`         |                                            |
| `imagen`    | `media` (un archivo) | Opcional: imágenes, archivos, video o audio |
| `url`       | `uid`              | Generado a partir de `titulo`              |

### Cursos (`api::curso.curso`)

Single type — tabla `cursos`.

| Campo       | Tipo               | Notas                                      |
| ----------- | ------------------ | ------------------------------------------ |
| `titulo`    | `string`           | Obligatorio                                |
| `contenido` | `richtext`         |                                            |
| `imagen`    | `media` (un archivo) | Imágenes, archivos, video o audio        |

---

## Endpoints

Rutas REST creadas por `createCoreRouter` (prefijo `/api`):

| Método   | Ruta                  | Descripción                     |
| -------- | --------------------- | ------------------------------- |
| `GET`    | `/api/guitarras`      | Lista de guitarras              |
| `GET`    | `/api/guitarras/:id`  | Una guitarra                    |
| `POST`   | `/api/guitarras`      | Crear guitarra                  |
| `PUT`    | `/api/guitarras/:id`  | Actualizar guitarra             |
| `DELETE` | `/api/guitarras/:id`  | Eliminar guitarra               |
| `GET`    | `/api/posts`          | Lista de posts                  |
| `GET`    | `/api/posts/:id`      | Un post                         |
| `POST`   | `/api/posts`          | Crear post                      |
| `PUT`    | `/api/posts/:id`      | Actualizar post                 |
| `DELETE` | `/api/posts/:id`      | Eliminar post                   |
| `GET`    | `/api/curso`          | Curso destacado (single type)   |
| `PUT`    | `/api/curso`          | Actualizar curso                |
| `DELETE` | `/api/curso`          | Eliminar curso                  |

Las relaciones y media no se incluyen por defecto; el frontend las pide con `populate` y filtra por `url`:

```
GET /api/guitarras?populate=imagen
GET /api/guitarras?filters[url]=<url>&populate=imagen
GET /api/posts?populate=imagen
GET /api/posts?filters[url]=<url>&populate=imagen
GET /api/curso?populate=imagen
```

---

## Cómo funciona

### 1. `src/api/`

Cada tipo de contenido (`guitarra`, `post`, `curso`) sigue la estructura estándar de Strapi 4:

- `content-types/<nombre>/schema.json` — definición de campos (lo que muestra el Content-Type Builder).
- `routes/<nombre>.js` — `createCoreRouter('api::<nombre>.<nombre>')`.
- `controllers/<nombre>.js` — `createCoreController(...)`, sin lógica personalizada.
- `services/<nombre>.js` — `createCoreService(...)`.

`src/index.js` deja vacíos los hooks `register` y `bootstrap`.

### 2. `config/`

- `server.js` — host, puerto y `APP_KEYS`.
- `database.js` — conexión a PostgreSQL con `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` y `DATABASE_SSL`.
- `admin.js` — secreto JWT del panel y salt de los API tokens.
- `api.js` — `defaultLimit: 25`, `maxLimit: 100`, `withCount: true`.
- `plugins.js` — proveedor de subida `cloudinary` con `CLOUDINARY_NAME`, `CLOUDINARY_KEY` y `CLOUDINARY_SECRET`.
- `middlewares.js` — middlewares por defecto con una CSP que añade `res.cloudinary.com` y `dl.airtable.com` a `img-src` y `media-src`.

### Flujo

```
Panel de administración (/admin)
  ├─ crear / editar Guitarras, Posts y Curso
  └─ subir imagen → provider-upload-cloudinary → res.cloudinary.com
        ↓
   PostgreSQL (tablas guitarras, posts, cursos)
        ↓
   API REST /api/*  (createCoreRouter → Controller → Service)
        ↓  rol Public con permisos find / findOne
   Frontend GuitarLa-Nextjs
     fetch(`${API_URL}/api/guitarras?populate=imagen`) ...
```

---

## Tecnologías

- **Strapi 4.5.0** — headless CMS, panel de administración y API REST.
- **@strapi/plugin-users-permissions** — roles y permisos de la API.
- **@strapi/plugin-i18n** — internacionalización del contenido.
- **@strapi/provider-upload-cloudinary** — almacenamiento de imágenes en Cloudinary.
- **PostgreSQL** mediante el driver **pg 8.6.0**.
- **Node.js** 14–18.

---

## Estructura del proyecto

```
GuitarLa-Strapi/
├── config/
│   ├── admin.js                 # JWT del panel y salt de API tokens
│   ├── api.js                   # Límites de paginación REST
│   ├── database.js              # Conexión a PostgreSQL (DATABASE_*)
│   ├── middlewares.js           # CSP con Cloudinary
│   ├── plugins.js               # Proveedor de subida Cloudinary
│   └── server.js                # Host, puerto, APP_KEYS
├── database/
│   └── migrations/              # Migraciones (vacío)
├── public/
│   └── robots.txt
├── src/
│   ├── admin/
│   │   ├── app.example.js       # Ejemplo de personalización del panel
│   │   └── webpack.config.example.js
│   ├── api/
│   │   ├── curso/               # content-types, controllers, routes, services
│   │   ├── guitarra/
│   │   └── post/
│   ├── extensions/
│   └── index.js                 # register / bootstrap
├── .env.example                 # Plantilla de variables de entorno
├── favicon.png
└── package.json
```

---

## Configuración

| Dónde                          | Qué                                   | Valor actual                           |
| ------------------------------ | ------------------------------------- | -------------------------------------- |
| `config/server.js`             | Host y puerto                         | `HOST` (`0.0.0.0`), `PORT` (`1337`)    |
| `config/database.js`           | Conexión a la base de datos           | `postgres` con variables `DATABASE_*`  |
| `config/api.js` → `rest`       | Paginación de la API                  | `defaultLimit: 25`, `maxLimit: 100`, `withCount: true` |
| `config/plugins.js` → `upload` | Proveedor de archivos                 | `cloudinary`                           |
| `config/middlewares.js`        | Orígenes permitidos para imágenes/media | `'self'`, `data:`, `blob:`, `dl.airtable.com`, `res.cloudinary.com` |
| `schema.json` → `options`      | Borradores y publicación              | `draftAndPublish: true` en los 3 tipos |

---

## Licencia

Distribuido bajo licencia **MIT**, según el campo `license` de `package.json`.
