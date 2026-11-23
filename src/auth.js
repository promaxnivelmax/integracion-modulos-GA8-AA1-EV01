/** Registro, inicio de sesión y middleware de autenticación con JWT */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const SECRETO = process.env.JWT_SECRET || 'cambiar-en-produccion';
const router = express.Router();
const correoValido = c => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c || '');

// POST /api/auth/registro
router.post('/registro', (req, res) => {
  const { nombre, correo, contrasena } = req.body || {};
  if (!nombre || !correo || !contrasena) return res.status(400).json({ ok: false, mensaje: 'Nombre, correo y contraseña son obligatorios.' });
  if (!correoValido(correo)) return res.status(400).json({ ok: false, mensaje: 'El correo no tiene un formato válido.' });
  if (contrasena.length < 8) return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener mínimo 8 caracteres.' });
  if (db.prepare('SELECT 1 FROM usuarios WHERE correo = ?').get(correo.toLowerCase()))
    return res.status(409).json({ ok: false, mensaje: 'Ya existe una cuenta con este correo.' });
  const r = db.prepare('INSERT INTO usuarios (nombre, correo, clave_hash) VALUES (?,?,?)').run(nombre, correo.toLowerCase(), bcrypt.hashSync(contrasena, 10));
  res.status(201).json({ ok: true, mensaje: 'Cuenta creada.', id: Number(r.lastInsertRowid) });
});

// POST /api/auth/login -> devuelve un token válido por 2 horas
router.post('/login', (req, res) => {
  const { correo, contrasena } = req.body || {};
  const u = db.prepare('SELECT * FROM usuarios WHERE correo = ?').get((correo || '').toLowerCase());
  if (!u || !bcrypt.compareSync(contrasena || '', u.clave_hash)) return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
  const token = jwt.sign({ id: u.id, nombre: u.nombre }, SECRETO, { expiresIn: '2h' });
  res.json({ ok: true, mensaje: 'Sesión iniciada.', token });
});

// Middleware: exige el encabezado Authorization: Bearer <token>
function requiereToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return res.status(401).json({ ok: false, mensaje: 'Falta el token de acceso.' });
  try { req.usuario = jwt.verify(token, SECRETO); next(); }
  catch { res.status(401).json({ ok: false, mensaje: 'Token inválido o vencido.' }); }
}
module.exports = { router, requiereToken };
