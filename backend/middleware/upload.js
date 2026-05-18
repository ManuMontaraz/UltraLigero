const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de uploads exista (ruta absoluta desde raíz del proyecto)
const rootDir = path.join(__dirname, '..', '..');
const uploadDir = path.join(rootDir, 'uploads', 'objetos');

console.log('Upload middleware - Directorio raíz:', rootDir);
console.log('Upload middleware - Directorio de uploads:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creando directorio:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Guardando en:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Nombre archivo:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 4 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = upload;
