const { validationResult } = require('express-validator');

// Convierte los errores de express-validator en una respuesta 400
const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (errores.isEmpty()) return next();
  res.status(400).json({
    errores: errores.array().map(e => ({ campo: e.path, mensaje: e.msg })),
  });
};

module.exports = validar;
