const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'El archivo excede el tamaño máximo permitido (4MB)' 
      });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
