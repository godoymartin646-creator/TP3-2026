const router = require('express').Router();
const { body, param } = require('express-validator');
const validar = require('../middlewares/validar');
const { requireAuth } = require('../config/passport');
const ctrl = require('../controllers/conductores.controller');

const idParam = param('id').isInt({ min: 1 }).withMessage('ID inválido');
const reglas = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('numero_documento').trim().notEmpty().withMessage('El número de documento es obligatorio'),
  body('numero_licencia').trim().notEmpty().withMessage('El número de licencia es obligatorio'),
  body('fecha_alta_licencia').isISO8601().withMessage('Fecha de alta de licencia inválida'),
  body('fecha_vencimiento_licencia').isISO8601().withMessage('Fecha de vencimiento inválida')
    .custom((v, { req }) => new Date(v) > new Date(req.body.fecha_alta_licencia))
    .withMessage('El vencimiento debe ser posterior al alta'),
];

router.use(requireAuth);
router.get('/', ctrl.listar);
router.get('/:id', [idParam, validar], ctrl.obtener);
router.post('/', [...reglas, validar], ctrl.crear);
router.put('/:id', [idParam, ...reglas, validar], ctrl.actualizar);
router.delete('/:id', [idParam, validar], ctrl.eliminar);

module.exports = router;
