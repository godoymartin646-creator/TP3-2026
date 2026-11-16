const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validar = require('../middlewares/validar');
const { requireAuth } = require('../config/passport');
const ctrl = require('../controllers/viajes.controller');

const idParam = param('id').isInt({ min: 1 }).withMessage('ID inválido');
const reglas = [
  body('vehiculo_id').isInt({ min: 1 }).withMessage('Debe indicar un vehículo'),
  body('conductor_id').isInt({ min: 1 }).withMessage('Debe indicar un conductor'),
  body('fecha_salida').isISO8601().withMessage('Fecha de salida inválida'),
  body('fecha_llegada').isISO8601().withMessage('Fecha de llegada inválida')
    .custom((v, { req }) => new Date(v) >= new Date(req.body.fecha_salida))
    .withMessage('La llegada no puede ser anterior a la salida'),
  body('origen').trim().notEmpty().withMessage('El origen es obligatorio'),
  body('destino').trim().notEmpty().withMessage('El destino es obligatorio'),
  body('kilometros').isFloat({ min: 0 }).withMessage('Los kilómetros deben ser un número positivo'),
  body('observaciones').optional({ nullable: true }).trim(),
];

router.use(requireAuth);
router.get('/', [
  query('vehiculo_id').optional().isInt({ min: 1 }).withMessage('vehiculo_id inválido'),
  query('conductor_id').optional().isInt({ min: 1 }).withMessage('conductor_id inválido'),
  validar,
], ctrl.listar);
router.get('/total-km', [
  query('vehiculo_id').optional().isInt({ min: 1 }).withMessage('vehiculo_id inválido'),
  query('conductor_id').optional().isInt({ min: 1 }).withMessage('conductor_id inválido'),
  query('vehiculo_id').custom((v, { req }) => !!(v || req.query.conductor_id))
    .withMessage('Indicar vehiculo_id o conductor_id'),
  validar,
], ctrl.totalKm);
router.get('/:id', [idParam, validar], ctrl.obtener);
router.post('/', [...reglas, validar], ctrl.crear);
router.put('/:id', [idParam, ...reglas, validar], ctrl.actualizar);
router.delete('/:id', [idParam, validar], ctrl.eliminar);

module.exports = router;
