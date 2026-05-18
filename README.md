# 🍃 UltraLigero (LeafPack)

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE.md)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg)](https://nodejs.org/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.5%2B-003545.svg)](https://mariadb.org/)

**Organizador de equipaje ultraligero para viajeros minimalistas.**

Gestiona tu mochila, calcula pesos y precios automáticamente, y comparte tus configuraciones con el mundo usando códigos cortos memorables. Sin cuentas, sin rastreo, sin complicaciones.

🔗 **Demo en vivo:** [https://leafpack.mntr.es](https://leafpack.mntr.es)

---

## ✨ Características Principales

- 🔑 **Códigos cortos memorables** — Comparte mochilas con códigos de 6 caracteres (ej: `ABC123`)
- 👤 **Sin cuentas de usuario** — Completamente anónimo, sin registros
- 🌙 **Modo oscuro** — Interfaz moderna, minimalista y responsive
- 💾 **Cambios locales persistentes** — Modifica peso, precio y cantidad por mochila, guardados en base de datos
- 🧬 **Clonar mochilas** — Crea versiones derivadas con trazabilidad (`parent_id`) y breadcrumbs que indican "clon de"
- 🔒 **Contraseña única** — Sistema `edit_password` + opción `is_private` para controlar visibilidad
- 🖼️ **Optimización de imágenes** — Todas las subidas se convierten automáticamente a WebP, altura máxima 1080px, calidad 85%, y el original se elimina
- 📁 **Grupos organizativos** — Cocina, Higiene, Ropa, Electrónica, Comida, Documentación, Descanso, Otros
- ⚖️ **Peso real** — Cálculo basado en el peso real de los objetos, no en capacidad
- 🌐 **SEO automático** — Meta tags dinámicos, Open Graph, Schema.org y generación automática de imágenes OG
- 🛡️ **Panel de administración** — Accesible en `/admin` para gestión completa
- 📄 **Página de privacidad** — Disponible en `/privacidad`
- 🔧 **Footer configurable** — Personalizable vía variables de entorno (autor, email, web, GitHub)
- 🚫 **Sin rastreo** — No se guardan IPs, no hay cookies, no hay tracking de ningún tipo

---

## 🚀 Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Node.js 18+, Express, MariaDB 10.5+ |
| **Frontend** | Vue 3, Vite, Vue Router, TailwindCSS |
| **Seguridad** | bcryptjs, cors |
| **Imágenes** | sharp, node-html-to-image, multer |
| **Utilidades** | nanoid, dotenv, @vueuse/head |
| **Desarrollo** | concurrently, nodemon |
| **Producción** | PM2 (con `ecosystem.config.js`) |

---

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **MariaDB** 10.5 o superior (o MySQL 8.0+)
- **npm**

---

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ManuMontaraz/ultraligero.git
cd ultraligero
```

### 2. Configurar variables de entorno

Copia el archivo de plantilla y edítalo:

```bash
cp .env_template .env
```

Edita `.env` con tus datos:

```env
# Branding
APP_NAME=UltraLigero
APP_URL=http://localhost:3000

# Frontend (VITE_ prefix required for frontend access)
VITE_APP_NAME=UltraLigero
VITE_AUTHOR_NAME="Manuel Arjona Blanco"
VITE_AUTHOR_EMAIL="contacto@manumontaraz.es"
VITE_AUTHOR_WEB="https://manumontaraz.es"
VITE_GITHUB_URL="https://github.com/ManuMontaraz/ultraligero"

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ultraligero
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development

# Admin
ADMIN_PASSWORD=your_secure_password

# Referidos (optional)
AFFILIATE_TAG=ref=your_code

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=4194304
```

### 3. Instalar dependencias

```bash
# Backend
npm install

# Frontend
cd frontend && npm install
```

### 4. Inicializar la base de datos

```bash
npm run init-db
```

### 5. Iniciar la aplicación

**Modo desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📖 Uso

### Crear una mochila

1. Ve a la página principal y haz clic en **"Nueva Mochila"**
2. Completa los datos: nombre y descripción
3. Opcional: marca **"Privada"** y establece una contraseña de edición
4. Copia el código generado (ej: `ABC123`)

### Añadir objetos

1. Accede a tu mochila usando el código
2. Haz clic en **"Añadir Objeto"**
3. Crea un objeto nuevo o selecciona uno existente del catálogo global
4. Completa peso, precio, grupo y, opcionalmente, URL de compra e imagen

### Modificar valores locales

Cuando modificas el peso, precio o cantidad de un objeto dentro de una mochila, los cambios se guardan automáticamente de forma persistente. Esto permite que el mismo objeto tenga valores diferentes en cada mochila.

### Compartir mochilas

Simplemente comparte la URL con el código:
```
https://leafpack.mntr.es/m/ABC123
```

Las redes sociales mostrarán automáticamente una imagen de previsualización generada con los datos de tu mochila.

### Panel de Administración

Accede a `/admin` e introduce la contraseña de administrador configurada en `.env` para gestionar todas las mochilas y objetos.

---

## 🏗️ Arquitectura

```
UltraLigero/
├── backend/
│   ├── config/          # Configuración de base de datos
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Autenticación, upload, manejo de errores
│   ├── routes/          # Rutas de la API
│   ├── services/        # Generador de imágenes OG
│   └── utils/           # Inicialización de DB, procesado de imágenes
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables (Footer, etc.)
│   │   ├── composables/ # useApi, useSEO, useLocalChanges
│   │   ├── views/       # Páginas (Home, MochilaView, CrearMochila, AdminPanel, Privacidad)
│   │   └── utils/       # Schemas y utilidades
│   └── public/          # Assets estáticos
├── uploads/             # Archivos subidos
│   ├── objetos/         # Imágenes de objetos
│   └── og/              # Imágenes OG generadas
├── .env                 # Configuración de entorno (gitignored)
├── .env_template        # Plantilla para .env
├── server.js            # Punto de entrada
└── ecosystem.config.js  # Configuración de PM2
```

---

## 🔌 API Endpoints

### Mochilas
- `GET /api/mochilas` — Listar mochilas públicas
- `POST /api/mochilas` — Crear mochila
- `POST /api/mochilas/:codigo` — Ver mochila (con contraseña opcional)
- `POST /api/mochilas/:id/clone` — Clonar una mochila
- `PUT /api/mochilas/:id` — Actualizar mochila
- `DELETE /api/mochilas/:id` — Eliminar mochila
- `POST /api/mochilas/:id/objetos` — Añadir objeto a mochila
- `DELETE /api/mochilas/:id/objetos/:objetoId` — Eliminar objeto de mochila
- `PUT /api/mochilas/:id/objetos/:objetoId/locales` — Guardar cambios locales

### Objetos
- `GET /api/objetos` — Listar objetos globales
- `POST /api/objetos` — Crear objeto (con imagen opcional)
- `PUT /api/objetos/:id` — Actualizar objeto
- `DELETE /api/objetos/:id` — Eliminar objeto de la base de datos

### Grupos
- `GET /api/grupos` — Listar grupos

### Administración
- `POST /api/admin/verify` — Verificar contraseña de administrador
- `GET /api/admin/mochilas` — Listar todas las mochilas (admin)

### SEO
- `GET /sitemap.xml` — Sitemap dinámico

---

## 🔒 Privacidad y Seguridad

- **Sin cuentas de usuario** — No necesitas registrarte ni iniciar sesión
- **Sin IPs** — No se almacenan direcciones IP
- **Sin cookies** — No utilizamos cookies de ningún tipo
- **Sin tracking** — No hay analíticas ni rastreadores
- Contraseñas hasheadas con **bcryptjs**
- Validación y sanitización de datos en el backend
- Límite de tamaño en subidas (4MB)

Consulta la página de privacidad en `/privacidad` para más detalles.

---

## 🎨 Personalización

### Cambiar branding

Edita las variables en `.env`:

```env
APP_NAME=MiApp
VITE_APP_NAME=MiApp
VITE_AUTHOR_NAME="Tu Nombre"
VITE_AUTHOR_EMAIL="tu@email.com"
VITE_AUTHOR_WEB="https://tuweb.com"
VITE_GITHUB_URL="https://github.com/tuusuario/turepo"
```

El footer se actualizará automáticamente con estos valores.

### Configurar referidos de Amazon

```env
AFFILIATE_TAG=ref=mi-codigo-afiliado
```

Se añadirá automáticamente a todas las URLs de compra de productos en Amazon.

### Modificar colores

Edita los colores en `frontend/tailwind.config.js`:

```javascript
colors: {
  accent: '#10B981',    // Verde principal
  danger: '#EF4444',    // Rojo errores
  warning: '#F59E0B',   // Naranja advertencias
}
```

---

## 🚢 Despliegue con PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añade nueva funcionalidad'`)
4. Sube la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está licenciado bajo la **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- ✅ Puedes usar, modificar y distribuir el código libremente
- ✅ Si modificas el código y lo usas en un servidor web, debes publicar esas modificaciones
- ✅ Debes mantener la misma licencia en cualquier trabajo derivado
- ✅ Debes dar crédito a los autores originales

Ver [LICENSE.md](LICENSE.md) para más detalles.

---

## 🙏 Agradecimientos

- [Vue.js](https://vuejs.org/) — Framework frontend
- [Vite](https://vitejs.dev/) — Build tool
- [TailwindCSS](https://tailwindcss.com/) — Utilidades CSS
- [Express](https://expressjs.com/) — Framework backend
- [MariaDB](https://mariadb.org/) — Base de datos

---

## 📧 Contacto

- **Autor:** Manuel Arjona Blanco
- **Email:** [contacto@manumontaraz.es](mailto:contacto@manumontaraz.es)
- **Web:** [https://manumontaraz.es](https://manumontaraz.es)
- **GitHub:** [https://github.com/ManuMontaraz/ultraligero](https://github.com/ManuMontaraz/ultraligero)
- **Demo:** [https://leafpack.mntr.es](https://leafpack.mntr.es)

---

Desarrollado con 💚 para viajeros minimalistas.

**¡Felices viajes! 🎒✈️**
