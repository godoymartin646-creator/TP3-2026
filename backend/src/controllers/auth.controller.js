const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.registrar = async (req, res, next) => {
  try {
    const { nombre, email, contrasena } = req.body;
    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length) return res.status(400).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    const [r] = await db.query(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );
    res.status(201).json({ id: r.insertId, nombre, email });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = rows[0];
    const ok = usuario && await bcrypt.compare(contrasena, usuario.contrasena);
    if (!ok) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    const payload = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, usuario: payload });
  } catch (e) { next(e); }
};
