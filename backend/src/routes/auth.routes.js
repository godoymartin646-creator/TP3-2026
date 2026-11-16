const router = require('express').Router();
const { body } = require('express-validator');
const validar = require('../middlewares/validar');
const ctrl = require('../controllers/auth.controller');

router.post('/registro', [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validar,
], ctrl.registrar);

router.post('/login', [
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),
  validar,
], ctrl.login);

module.exports = router;
