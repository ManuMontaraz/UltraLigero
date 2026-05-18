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

// Editar/eliminar mochila (usuarios normales con contraseña)
router.put('/:id', mochilasController.update);
router.delete('/:id', mochilasController.delete);

// Clonar mochila
router.post('/:id/clone', mochilasController.clone);

module.exports = router;
