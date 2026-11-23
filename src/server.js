/**
 * CV Builder – aplicación web integrada (GA8-220501096-AA1-EV01)
 * Capa de presentación: /public (HTML, CSS y módulos JavaScript)
 * Capa de servicios: rutas /api (Express) · Capa de datos: src/db.js (SQLite)
 * Autor: Iván Gerardo Rodríguez Bustamante · ADSO ficha 3186596 · SENA
 * Documentación interactiva: http://localhost:4000/api/docs
 */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const db = require('./db');
const { router: auth, requiereToken } = require('./auth');
const crud = require('./crud');
const openapi = require('../docs/openapi.json');

const app = express();
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '..', 'public'))); // módulo de presentación
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  customSiteTitle: 'CV Builder API',
  // En Vercel los archivos de swagger-ui se cargan desde la CDN
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
  customJs: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js']
}));
app.get('/api/salud', (req, res) => res.json({ ok: true, servicio: 'cvbuilder-api', version: '1.0.0' }));
app.use('/api/auth', auth);

// Datos personales (uno por usuario)
app.get('/api/perfil', requiereToken, (req, res) => {
  const u = db.prepare('SELECT id, nombre, correo, creado FROM usuarios WHERE id = ?').get(req.usuario.id);
  const p = db.prepare('SELECT cargo, documento, telefono, ciudad, perfil FROM datos_personales WHERE usuario_id = ?').get(req.usuario.id) || {};
  res.json({ ok: true, datos: { ...u, ...p } });
});
app.put('/api/perfil', requiereToken, (req, res) => {
  const { cargo, documento, telefono, ciudad, perfil } = req.body || {};
  if (!telefono || !ciudad) return res.status(400).json({ ok: false, mensaje: 'Teléfono y ciudad son obligatorios.' });
  db.prepare(`INSERT INTO datos_personales (usuario_id, cargo, documento, telefono, ciudad, perfil) VALUES (?,?,?,?,?,?)
    ON CONFLICT(usuario_id) DO UPDATE SET cargo=excluded.cargo, documento=excluded.documento, telefono=excluded.telefono, ciudad=excluded.ciudad, perfil=excluded.perfil`)
    .run(req.usuario.id, cargo ?? null, documento ?? null, telefono, ciudad, perfil ?? null);
  res.json({ ok: true, mensaje: 'Datos personales guardados.' });
});

// Secciones de la hoja de vida
app.use('/api/formacion', requiereToken, crud('formacion', ['titulo', 'institucion', 'inicio', 'fin'], ['titulo', 'institucion']));
app.use('/api/experiencia', requiereToken, crud('experiencia', ['cargo', 'empresa', 'inicio', 'fin', 'funciones'], ['cargo', 'empresa']));
app.use('/api/habilidades', requiereToken, crud('habilidades', ['nombre', 'nivel'], ['nombre']));
app.use('/api/referencias', requiereToken, crud('referencias', ['nombre', 'tipo', 'telefono'], ['nombre', 'telefono']));

// Hoja de vida completa (para generar la vista previa y el PDF)
app.get('/api/hoja-vida', requiereToken, (req, res) => {
  const id = req.usuario.id, q = t => db.prepare(`SELECT * FROM ${t} WHERE usuario_id = ? ORDER BY id`).all(id);
  const u = db.prepare('SELECT nombre, correo FROM usuarios WHERE id = ?').get(id);
  const p = db.prepare('SELECT * FROM datos_personales WHERE usuario_id = ?').get(id) || {};
  res.json({ ok: true, datos: { ...u, personales: p, formacion: q('formacion'), experiencia: q('experiencia'), habilidades: q('habilidades'), referencias: q('referencias') } });
});

// Eliminar la cuenta y todos sus datos (Ley 1581 de 2012)
app.delete('/api/cuenta', requiereToken, (req, res) => { db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.usuario.id); res.json({ ok: true, mensaje: 'Cuenta eliminada.' }); });

app.use('/api', (req, res) => res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada.' }));
const PUERTO = process.env.PORT || 4000;
if (require.main === module) app.listen(PUERTO, () => console.log(`CV Builder API en http://localhost:${PUERTO} · docs en /api/docs`));
module.exports = app;
