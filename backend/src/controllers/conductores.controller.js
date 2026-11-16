const crearCrud = require('./crud.factory');

module.exports = crearCrud('conductores', [
  'nombre', 'apellido', 'numero_documento', 'numero_licencia',
  'fecha_alta_licencia', 'fecha_vencimiento_licencia',
]);
