/** Conexión y creación de tablas de CV Builder (SQLite nativo de Node.js) */
const { DatabaseSync } = require('node:sqlite');
// En Vercel (ambiente de demostración) solo se puede escribir en /tmp; en local se usa cvbuilder.db
const RUTA = process.env.DB || (process.env.VERCEL ? '/tmp/cvbuilder.db' : 'cvbuilder.db');
const db = new DatabaseSync(RUTA);
db.exec('PRAGMA foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, correo TEXT NOT NULL UNIQUE,
  clave_hash TEXT NOT NULL, creado TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS datos_personales (
  usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  cargo TEXT, documento TEXT, telefono TEXT, ciudad TEXT, perfil TEXT);
CREATE TABLE IF NOT EXISTS formacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL, institucion TEXT NOT NULL, inicio TEXT, fin TEXT);
CREATE TABLE IF NOT EXISTS experiencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cargo TEXT NOT NULL, empresa TEXT NOT NULL, inicio TEXT, fin TEXT, funciones TEXT);
CREATE TABLE IF NOT EXISTS habilidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL, nivel TEXT CHECK (nivel IN ('Básico','Intermedio','Avanzado')));
CREATE TABLE IF NOT EXISTS referencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL, tipo TEXT CHECK (tipo IN ('Laboral','Personal')), telefono TEXT NOT NULL);
`);
module.exports = db;
