# CV Builder – aplicación web integrada
Evidencia **GA8-220501096-AA1-EV01** · Iván Gerardo Rodríguez Bustamante · ADSO ficha 3186596 · SENA Barrancabermeja

Aplicación web para crear la hoja de vida en línea. Integra tres capas en un solo servidor:

| Capa | Carpeta | Tecnología |
|---|---|---|
| Presentación | `public/` (index.html, css/, js/) | HTML5, CSS3, JavaScript |
| Servicios | `src/server.js`, `src/auth.js`, `src/crud.js` | Node.js 22, Express 5, JWT |
| Datos | `src/db.js` | SQLite (node:sqlite) |

## Módulos
- **Autenticación** (`public/js/auth.js`, `src/auth.js`): registro, inicio de sesión, token JWT, contraseñas con bcrypt.
- **Datos personales** (`public/js/secciones.js` → `/api/perfil`).
- **Secciones** (`public/js/secciones.js`, `src/crud.js`): formación, experiencia, habilidades y referencias con un CRUD reutilizable.
- **Hoja de vida** (`public/js/vista.js` → `/api/hoja-vida`): vista previa y descarga en PDF.
- **Cuenta**: eliminación de la cuenta y sus datos (Ley 1581 de 2012).
- **Componentes comunes**: `public/js/api.js` (fachada de servicios) y `public/js/validaciones.js`.

## Ejecutar
```bash
npm install
npm start        # http://localhost:4000
npm test         # pruebas unitarias (node:test)
```
Documentación de la API: http://localhost:4000/api/docs
