const crearCrud = require('./crud.factory');

module.exports = crearCrud('vehiculos', ['marca', 'modelo', 'patente', 'anio', 'capacidad_carga']);
