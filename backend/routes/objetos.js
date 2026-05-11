const express = require('express');
const router = express.Router();
const objetosController = require('../controllers/objetosController');
const upload = require('../middleware/upload');

router.get('/', objetosController.getAll);
router.get('/:id', objetosController.getById);
router.post('/:id/verify-password', objetosController.verificarPassword);
router.post('/', upload.single('imagen'), objetosController.create);
router.post('/:id/update', upload.single('imagen'), objetosController.update);
router.put('/:id', upload.single('imagen'), objetosController.update);
router.delete('/:id', objetosController.delete);

module.exports = router;
