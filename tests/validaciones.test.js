// Pruebas unitarias del componente de validaciones del front-end
const { test } = require('node:test');
const assert = require('node:assert');
const V = require('../public/js/validaciones.js');
test('correo válido e inválido', () => { assert.ok(V.correo('ivan@correo.com')); assert.ok(!V.correo('ivan@correo')); assert.ok(!V.correo('')); });
test('contraseña de mínimo 8 caracteres', () => { assert.ok(V.clave('Sena2026*')); assert.ok(!V.clave('123')); });
test('celular colombiano de 10 dígitos', () => { assert.ok(V.telefono('3105550000')); assert.ok(!V.telefono('6075550000')); assert.ok(!V.telefono('31055')); });
test('campos obligatorios faltantes', () => { assert.deepStrictEqual(V.requeridos({ titulo: 'ADSO', institucion: ' ' }, ['titulo', 'institucion']), ['institucion']); });
