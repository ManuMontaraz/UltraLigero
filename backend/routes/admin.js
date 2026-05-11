const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const mochilasController = require('../controllers/mochilasController');
const objetosController = require('../controllers/objetosController');
const upload = require('../middleware/upload');

// Verificar si es admin
router.post('/verify', adminAuth, (req, res) => {
  res.json({ isAdmin: true });
});

// Gestión de mochilas (versión completa con todas las contraseñas)
router.get('/mochilas', adminAuth, mochilasController.getAllAdmin);
router.put('/mochilas/:id', adminAuth, mochilasController.update);
router.delete('/mochilas/:id', adminAuth, mochilasController.delete);

// Gestión de objetos (admin bypass)
// Crear sin imagen (JSON)
router.post('/objetos', adminAuth, objetosController.create);

// Crear con imagen (FormData) - para uso desde MochilaView
router.post('/objetos/with-image', adminAuth, upload.single('imagen'), objetosController.create);

// Actualizar datos (sin imagen) - JSON
router.put('/objetos/:id', adminAuth, objetosController.update);

// Subir/actualizar imagen separadamente
router.post('/objetos/:id/imagen', adminAuth, upload.single('imagen'), objetosController.update);

router.delete('/objetos/:id', adminAuth, objetosController.delete);

module.exports = router;
