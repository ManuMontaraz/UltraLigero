# 🍃 LeafPack

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE.md)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D.svg)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933.svg)](https://nodejs.org/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.5%2B-003545.svg)](https://mariadb.org/)

**Organizador de equipaje ultraligero para viajeros minimalistas.**

Gestiona tu mochila, calcula pesos y precios automáticamente, y comparte tus configuraciones con el mundo usando códigos cortos memorables.

![LeafPack Preview](https://leafpack.mntr.es/og-default.jpg)

## ✨ Características Principales

- 🎒 **Códigos cortos** - Comparte mochilas con códigos de 6 caracteres (ej: `ABC123`)
- 🌙 **Modo oscuro** - Interfaz moderna y minimalista
- 💾 **Cambios persistentes** - Modifica pesos y precios locales que se guardan en la base de datos
- 📁 **Grupos organizativos** - Cocina, Higiene, Ropa, Electrónica, Comida, Documentación, Otros
- 🧮 **Cálculos automáticos** - Peso y precio total en tiempo real
- 🔒 **Contraseñas opcionales** - Protege mochilas y objetos para edición/visualización
- 🖼️ **Imágenes** - Sube fotos de tus objetos (hasta 4MB)
- 🌐 **SEO optimizado** - Meta tags dinámicos, Open Graph, Schema.org
- 🎨 **Imágenes OG automáticas** - Genera imágenes de previsualización para redes sociales

## 🚀 Demo en Vivo

🔗 **https://leafpack.mntr.es**

## 📋 Requisitos

- **Node.js** 16+
- **MariaDB** 10.5+ (o MySQL 8.0+)
- **npm** o **yarn**

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/leafpack.git
cd leafpack
```

### 2. Configurar base de datos

Crea una base de datos en MariaDB:

```sql
CREATE DATABASE leafpack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```env
# Branding
APP_NAME=LeafPack
APP_URL=https://leafpack.mntr.es

# Database
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=leafpack
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=production

# Admin
ADMIN_PASSWORD=tu_password_segura

# Referidos (opcional)
AFFILIATE_TAG=ref=tu_codigo

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=4194304
```

### 4. Instalar dependencias

```bash
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend && npm install && cd ..
```

### 5. Iniciar el servidor

**Modo desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Uso

### Crear una mochila

1. Ve a la página principal y haz clic en "Nueva Mochila"
2. Completa los datos: nombre, descripción, capacidad opcional
3. Opcional: añade contraseñas de seguridad
4. Copia el código generado (ej: `ABC123`)

### Añadir objetos

1. Accede a tu mochila usando el código
2. Haz clic en "Añadir Objeto"
3. Puedes crear un objeto nuevo o seleccionar uno existente
4. Completa peso, precio, grupo y opcionalmente URL de compra e imagen

### Modificar valores locales

Cuando modificas el peso, precio o cantidad de un objeto, los cambios se guardan automáticamente en la base de datos asociados a tu mochila. Esto permite tener diferentes configuraciones del mismo objeto en diferentes mochilas.

### Compartir mochilas

Simplemente comparte la URL con el código:
```
https://leafpack.mntr.es/m/ABC123
```

Las redes sociales mostrarán automáticamente una imagen de previsualización con los datos de tu mochila.

### Panel de Administración

Accede a `/admin` para gestionar:
- Todas las mochilas
- Todos los objetos
- Contraseñas de seguridad

## 🏗️ Arquitectura

```
leafpack/
├── backend/                 # API REST con Node.js + Express
│   ├── config/             # Configuración de base de datos
│   ├── controllers/        # Lógica de negocio
│   ├── middleware/         # Autenticación, upload, errores
│   ├── routes/             # Definición de rutas API
│   ├── services/           # Servicios (generador de imágenes OG)
│   └── utils/              # Utilidades y helpers
├── frontend/               # SPA con Vue.js 3
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── composables/    # useApi, useSEO, useLocalChanges
│   │   ├── views/          # Páginas (Home, MochilaView, etc)
│   │   └── utils/          # Utilidades y schemas
│   └── public/             # Assets estáticos
├── uploads/                # Archivos subidos
│   ├── objetos/            # Imágenes de objetos
│   └── og/                 # Imágenes Open Graph generadas
└── server.js               # Punto de entrada del servidor
```

## 🔌 API Endpoints

### Mochilas
- `GET /api/mochilas` - Listar mochilas públicas
- `POST /api/mochilas/:codigo` - Ver mochila (con password si aplica)
- `POST /api/mochilas` - Crear mochila
- `POST /api/mochilas/:id/objetos` - Añadir objeto a mochila
- `DELETE /api/mochilas/:id/objetos/:objetoId` - Eliminar objeto de mochila
- `PUT /api/mochilas/:id/objetos/:objetoId/locales` - Guardar cambios locales
- `DELETE /api/mochilas/:id/locales` - Limpiar todos los cambios locales

### Objetos
- `GET /api/objetos` - Listar objetos globales
- `POST /api/objetos` - Crear objeto (con imagen opcional)
- `PUT /api/objetos/:id` - Actualizar objeto
- `DELETE /api/objetos/:id` - Eliminar objeto

### Grupos
- `GET /api/grupos` - Listar grupos (solo lectura)
- `GET /api/grupos/:id` - Ver grupo específico

### Admin
- `POST /api/admin/verify` - Verificar contraseña admin
- `GET /api/admin/mochilas` - Listar todas las mochilas
- `PUT /api/admin/mochilas/:id` - Actualizar mochila
- `DELETE /api/admin/mochilas/:id` - Eliminar mochila
- `POST /api/admin/objetos` - Crear objeto (admin)
- `PUT /api/admin/objetos/:id` - Actualizar objeto (admin)
- `DELETE /api/admin/objetos/:id` - Eliminar objeto (admin)

### SEO
- `GET /sitemap.xml` - Sitemap dinámico con todas las URLs públicas

## 🎨 Personalización

### Cambiar nombre de la app

Edita `APP_NAME` en el archivo `.env`.

### Configurar referidos de Amazon

Edita `AFFILIATE_TAG` en el archivo `.env`:
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
  // ...
}
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Protección CSRF mediante SameSite cookies
- Validación de datos en backend
- Sanitización de inputs
- Límites de tamaño en uploads (4MB)
- Protección de rutas admin

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm test
```

## 🚢 Deployment

### Requisitos de servidor

- Node.js 16+
- MariaDB 10.5+
- PM2 (recomendado para producción)
- Nginx (como reverse proxy)

### Con PM2

```bash
npm install -g pm2
pm2 start server.js --name leafpack
pm2 save
pm2 startup
```

### Con Docker (próximamente)

```bash
docker-compose up -d
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Esto significa que:
- ✅ Puedes usar, modificar y distribuir el código libremente
- ✅ Si modificas el código y lo usas en un servidor web, debes publicar esas modificaciones
- ✅ Debes mantener la misma licencia en cualquier trabajo derivado
- ✅ Debes dar crédito a los autores originales

Ver [LICENSE.md](LICENSE.md) para más detalles.

## 🙏 Agradecimientos

- [Vue.js](https://vuejs.org/) - Framework frontend increíble
- [TailwindCSS](https://tailwindcss.com/) - Utilidades CSS
- [Express](https://expressjs.com/) - Framework backend
- [MariaDB](https://mariadb.org/) - Base de datos

## 📧 Contacto

- Website: [leafpack.mntr.es](https://leafpack.mntr.es)
- Issues: [GitHub Issues](https://github.com/tuusuario/leafpack/issues)

---

Desarrollado con 💚 para viajeros minimalistas.

**¡Felices viajes! 🎒✈️**
