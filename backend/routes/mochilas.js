const express = require('express');
const router = express.Router();
const mochilasController = require('../controllers/mochilasController');

// Rutas públicas
router.get('/', mochilasController.getAll);
router.post('/:codigo', mochilasController.getByCodigo);
router.post('/', mochilasController.create);

// Gestión de objetos en mochila
router.post('/:id/objetos', mochilasController.addObjeto);
router.delete('/:id/objetos/:objetoId', mochilasController.removeObjeto);

// Cambios locales (valores personalizados por mochila)
router.put('/:id/objetos/:objetoId/locales', mochilasController.saveLocalChanges);
router.delete('/:id/locales', mochilasController.clearLocalChanges);

module.exports = router;
