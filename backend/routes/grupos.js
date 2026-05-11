const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');

// Solo lectura de grupos - gestión eliminada
router.get('/', gruposController.getAll);
router.get('/:id', gruposController.getById);

module.exports = router;
