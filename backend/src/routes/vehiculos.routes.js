const router = require('express').Router();
const { body, param } = require('express-validator');
const validar = require('../middlewares/validar');
const { requireAuth } = require('../config/passport');
const ctrl = require('../controllers/vehiculos.controller');

const idParam = param('id').isInt({ min: 1 }).withMessage('ID inválido');
const reglas = [
  body('marca').trim().notEmpty().withMessage('La marca es obligatoria'),
  body('modelo').trim().notEmpty().withMessage('El modelo es obligatorio'),
  body('patente').trim().notEmpty().withMessage('La patente es obligatoria'),
  body('anio').isInt({ min: 1900, max: 2100 }).withMessage('El año debe estar entre 1900 y 2100'),
  body('capacidad_carga').isFloat({ min: 0 }).withMessage('La capacidad de carga debe ser un número positivo'),
];

router.use(requireAuth);
router.get('/', ctrl.listar);
router.get('/:id', [idParam, validar], ctrl.obtener);
router.post('/', [...reglas, validar], ctrl.crear);
router.put('/:id', [idParam, ...reglas, validar], ctrl.actualizar);
router.delete('/:id', [idParam, validar], ctrl.eliminar);

module.exports = router;
