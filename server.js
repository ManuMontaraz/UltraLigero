require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const initDatabase = require('./backend/utils/initDb');
const errorHandler = require('./backend/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - Orígenes permitidos desde .env
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Sirviendo uploads desde:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Rutas API
app.use('/api/mochilas', require('./backend/routes/mochilas'));
app.use('/api/objetos', require('./backend/routes/objetos'));
app.use('/api/grupos', require('./backend/routes/grupos'));
app.use('/api/admin', require('./backend/routes/admin'));

// Sitemap
app.use('/sitemap.xml', require('./backend/routes/sitemap'));

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: process.env.APP_NAME || 'UltraLigero',
    timestamp: new Date().toISOString()
  });
});

// Servir frontend estático en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// SPA fallback - todas las rutas no-API van al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🎒 ${process.env.APP_NAME || 'UltraLigero'} corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error iniciando servidor:', err);
    process.exit(1);
  }
};

startServer();
