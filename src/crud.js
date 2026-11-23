/** Genera rutas CRUD para una sección de la hoja de vida (formación, experiencia, habilidades, referencias) */
const express = require('express');
const db = require('./db');
module.exports = function crud(tabla, campos, obligatorios) {
  const r = express.Router();
  const limpiar = b => campos.map(c => (b[c] ?? null));
  const faltan = b => obligatorios.filter(c => !b[c]);
  // Listar los registros del usuario autenticado
  r.get('/', (req, res) => res.json({ ok: true, datos: db.prepare(`SELECT * FROM ${tabla} WHERE usuario_id = ? ORDER BY id`).all(req.usuario.id) }));
  // Crear
  r.post('/', (req, res) => {
    const f = faltan(req.body || {}); if (f.length) return res.status(400).json({ ok: false, mensaje: `Campos obligatorios: ${f.join(', ')}.` });
    try {
      const x = db.prepare(`INSERT INTO ${tabla} (usuario_id, ${campos.join(',')}) VALUES (?${',?'.repeat(campos.length)})`).run(req.usuario.id, ...limpiar(req.body));
      res.status(201).json({ ok: true, mensaje: 'Registro creado.', id: Number(x.lastInsertRowid) });
    } catch (e) { res.status(400).json({ ok: false, mensaje: 'Datos no válidos: ' + e.message }); }
  });
  // Actualizar
  r.put('/:id', (req, res) => {
    const f = faltan(req.body || {}); if (f.length) return res.status(400).json({ ok: false, mensaje: `Campos obligatorios: ${f.join(', ')}.` });
    const x = db.prepare(`UPDATE ${tabla} SET ${campos.map(c => c + '=?').join(',')} WHERE id = ? AND usuario_id = ?`).run(...limpiar(req.body), req.params.id, req.usuario.id);
    if (!x.changes) return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado.' });
    res.json({ ok: true, mensaje: 'Registro actualizado.' });
  });
  // Eliminar
  r.delete('/:id', (req, res) => {
    const x = db.prepare(`DELETE FROM ${tabla} WHERE id = ? AND usuario_id = ?`).run(req.params.id, req.usuario.id);
    if (!x.changes) return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado.' });
    res.json({ ok: true, mensaje: 'Registro eliminado.' });
  });
  return r;
};
