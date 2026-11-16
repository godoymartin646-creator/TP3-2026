const db = require('../config/db');

// Operaciones CRUD básicas para una tabla.
// `tabla` y `campos` son constantes internas, nunca datos del usuario.
const crearCrud = (tabla, campos) => {
  const datosDe = body => Object.fromEntries(campos.map(c => [c, body[c]]));

  return {
    listar: async (req, res, next) => {
      try {
        const [rows] = await db.query(`SELECT * FROM ${tabla} ORDER BY id`);
        res.json(rows);
      } catch (e) { next(e); }
    },

    obtener: async (req, res, next) => {
      try {
        const [rows] = await db.query(`SELECT * FROM ${tabla} WHERE id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json(rows[0]);
      } catch (e) { next(e); }
    },

    crear: async (req, res, next) => {
      try {
        const datos = datosDe(req.body);
        const [r] = await db.query(
          `INSERT INTO ${tabla} (${campos.join(', ')}) VALUES (${campos.map(() => '?').join(', ')})`,
          Object.values(datos)
        );
        res.status(201).json({ id: r.insertId, ...datos });
      } catch (e) { next(e); }
    },

    actualizar: async (req, res, next) => {
      try {
        const datos = datosDe(req.body);
        const [r] = await db.query(
          `UPDATE ${tabla} SET ${campos.map(c => `${c} = ?`).join(', ')} WHERE id = ?`,
          [...Object.values(datos), req.params.id]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json({ id: Number(req.params.id), ...datos });
      } catch (e) { next(e); }
    },

    eliminar: async (req, res, next) => {
      try {
        const [r] = await db.query(`DELETE FROM ${tabla} WHERE id = ?`, [req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ error: 'Registro no encontrado' });
        res.status(204).end();
      } catch (e) { next(e); }
    },
  };
};

module.exports = crearCrud;
