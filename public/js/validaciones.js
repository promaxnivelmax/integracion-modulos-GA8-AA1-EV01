/* Componente de validaciones: funciones puras reutilizables (se prueban con pruebas unitarias) */
const Validaciones = {
  correo: c => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((c || '').trim()),
  clave: c => (c || '').length >= 8,
  telefono: t => /^3\d{9}$/.test((t || '').replace(/\s/g, '')),
  requeridos: (obj, campos) => campos.filter(c => !String(obj[c] ?? '').trim())
};
if (typeof module !== 'undefined') module.exports = Validaciones;
