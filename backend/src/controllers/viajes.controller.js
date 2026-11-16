const db = require('../config/db');
const crearCrud = require('./crud.factory');

const base = crearCrud('viajes', [
  'vehiculo_id', 'conductor_id', 'fecha_salida', 'fecha_llegada',
  'origen', 'destino', 'kilometros', 'observaciones',
]);

// Historial: se puede filtrar por vehículo y/o por conductor
const listar = async (req, res, next) => {
  try {
    const { vehiculo_id, conductor_id } = req.query;
    let sql = `SELECT v.*, ve.patente, CONCAT(c.nombre, ' ', c.apellido) AS conductor
               FROM viajes v
               JOIN vehiculos ve ON ve.id = v.vehiculo_id
               JOIN conductores c ON c.id = v.conductor_id
               WHERE 1 = 1`;
    const params = [];
    if (vehiculo_id) { sql += ' AND v.vehiculo_id = ?'; params.push(vehiculo_id); }
    if (conductor_id) { sql += ' AND v.conductor_id = ?'; params.push(conductor_id); }
    sql += ' ORDER BY v.fecha_salida DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
};

// Total de kilómetros recorridos por un vehículo o por un conductor
const totalKm = async (req, res, next) => {
  try {
    const { vehiculo_id, conductor_id } = req.query;
    const columna = vehiculo_id ? 'vehiculo_id' : 'conductor_id';
    const valor = vehiculo_id || conductor_id;
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(kilometros), 0) AS total_km FROM viajes WHERE ${columna} = ?`,
      [valor]
    );
    res.json({ [columna]: Number(valor), total_km: Number(rows[0].total_km) });
  } catch (e) { next(e); }
};

module.exports = { ...base, listar, totalKm };
