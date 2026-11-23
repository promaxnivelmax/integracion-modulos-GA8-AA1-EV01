// Pruebas unitarias de los módulos del back-end: autenticación, datos personales, secciones (CRUD), hoja de vida y cuenta
process.env.DB = ':memory:';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/server.js');
let srv, base, token;
const pedir = async (m, r, b, t = token) => { const x = await fetch(base + r, { method: m, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: b && JSON.stringify(b) }); return { s: x.status, j: await x.json() }; };
before(() => new Promise(ok => { srv = app.listen(0, () => { base = 'http://localhost:' + srv.address().port; ok(); }); }));
after(() => srv.close());
test('módulo de autenticación: registro, duplicado y login', async () => {
  assert.equal((await pedir('POST', '/api/auth/registro', { nombre: 'Prueba', correo: 'p@demo.com', contrasena: 'Sena2026*' })).s, 201);
  assert.equal((await pedir('POST', '/api/auth/registro', { nombre: 'Prueba', correo: 'p@demo.com', contrasena: 'Sena2026*' })).s, 409);
  assert.equal((await pedir('POST', '/api/auth/login', { correo: 'p@demo.com', contrasena: 'mala12345' })).s, 401);
  const r = await pedir('POST', '/api/auth/login', { correo: 'p@demo.com', contrasena: 'Sena2026*' }); assert.equal(r.s, 200); token = r.j.token;
});
test('seguridad: sin token no hay acceso', async () => { assert.equal((await pedir('GET', '/api/perfil', null, '')).s, 401); });
test('módulo de datos personales', async () => {
  assert.equal((await pedir('PUT', '/api/perfil', { telefono: '3105550000', ciudad: 'Barrancabermeja' })).s, 200);
  assert.equal((await pedir('GET', '/api/perfil')).j.datos.ciudad, 'Barrancabermeja');
});
test('módulo de secciones (CRUD reutilizable)', async () => {
  const c = await pedir('POST', '/api/formacion', { titulo: 'Tecnólogo ADSO', institucion: 'SENA' }); assert.equal(c.s, 201);
  assert.equal((await pedir('POST', '/api/formacion', { titulo: 'Sin institución' })).s, 400);
  assert.equal((await pedir('GET', '/api/formacion')).j.datos.length, 1);
  assert.equal((await pedir('DELETE', '/api/formacion/' + c.j.id)).s, 200);
  assert.equal((await pedir('POST', '/api/habilidades', { nombre: 'Excel', nivel: 'Experto' })).s, 400);
});
test('integración: hoja de vida completa', async () => {
  const r = await pedir('GET', '/api/hoja-vida'); assert.equal(r.s, 200);
  for (const k of ['personales', 'formacion', 'experiencia', 'habilidades', 'referencias']) assert.ok(k in r.j.datos);
});
test('front-end servido por el mismo servidor', async () => { const x = await fetch(base + '/'); assert.equal(x.status, 200); assert.match(await x.text(), /CV Builder/); });
test('módulo de cuenta: eliminar', async () => { assert.equal((await pedir('DELETE', '/api/cuenta')).s, 200); assert.equal((await pedir('POST', '/api/auth/login', { correo: 'p@demo.com', contrasena: 'Sena2026*' })).s, 401); });
