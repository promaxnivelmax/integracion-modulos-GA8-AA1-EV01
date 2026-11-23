/* Módulo de secciones: datos personales y listas reutilizables (formación, experiencia, habilidades, referencias) */
const CAMPOS = {
  formacion: { titulo: 'Formación académica', campos: [['titulo', 'Título obtenido'], ['institucion', 'Institución'], ['inicio', 'Año de inicio'], ['fin', 'Año de finalización']], req: ['titulo', 'institucion'], resumen: x => `${x.titulo} · ${x.institucion}` },
  experiencia: { titulo: 'Experiencia laboral', campos: [['cargo', 'Cargo'], ['empresa', 'Empresa'], ['inicio', 'Inicio'], ['fin', 'Fin'], ['funciones', 'Funciones', 'area']], req: ['cargo', 'empresa'], resumen: x => `${x.cargo} · ${x.empresa}` },
  habilidades: { titulo: 'Habilidades', campos: [['nombre', 'Habilidad'], ['nivel', 'Nivel', ['Básico', 'Intermedio', 'Avanzado']]], req: ['nombre'], resumen: x => `${x.nombre} · ${x.nivel || ''}` },
  referencias: { titulo: 'Referencias', campos: [['nombre', 'Nombre'], ['tipo', 'Tipo', ['Laboral', 'Personal']], ['telefono', 'Teléfono']], req: ['nombre', 'telefono'], resumen: x => `${x.nombre} · ${x.tipo || ''} · ${x.telefono}` }
};
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Fábrica de campos de formulario (componente reutilizable)
function campo([n, l, tipo]) {
  if (Array.isArray(tipo)) return `<label>${l}</label><select name="${n}">${tipo.map(o => `<option>${o}</option>`).join('')}</select>`;
  if (tipo === 'area') return `<label>${l}</label><textarea name="${n}" rows="3"></textarea>`;
  return `<label>${l}</label><input name="${n}">`;
}
const Secciones = {
  async datos(app) {
    const { datos: d } = await Api.perfil();
    app.innerHTML = `<section class="tarjeta"><h2>Datos personales</h2><p>Hola, <b>${esc(d.nombre)}</b>.</p>
      <form id="fDatos"><div class="fila">
        <div><label>Cargo o profesión</label><input name="cargo" value="${esc(d.cargo)}"></div>
        <div><label>Documento</label><input name="documento" value="${esc(d.documento)}"></div>
        <div><label>Celular</label><input name="telefono" value="${esc(d.telefono)}"></div>
        <div><label>Ciudad</label><input name="ciudad" value="${esc(d.ciudad || 'Barrancabermeja')}"></div></div>
        <label>Perfil profesional</label><textarea name="perfil" rows="4">${esc(d.perfil)}</textarea>
        <button class="prim">Guardar</button></form></section>`;
    app.querySelector('#fDatos').onsubmit = async e => {
      e.preventDefault(); const v = Object.fromEntries(new FormData(e.target));
      if (!Validaciones.telefono(v.telefono)) return App.aviso('El celular debe tener 10 dígitos y empezar por 3.', true);
      try { await Api.guardarPerfil(v); App.aviso('Datos guardados.'); } catch (err) { App.aviso(err.message, true); }
    };
  },
  async lista(app, s) {
    const cfg = CAMPOS[s], { datos } = await Api.listar(s);
    app.innerHTML = `<section class="tarjeta"><h2>${cfg.titulo}</h2>
      <div id="lista">${datos.map(x => `<div class="item"><span>${esc(cfg.resumen(x))}</span><button class="sec" data-id="${x.id}">Eliminar</button></div>`).join('') || '<p>Aún no has agregado nada.</p>'}</div>
      <form id="fItem">${cfg.campos.map(campo).join('')}<button class="prim">Agregar</button></form></section>`;
    app.querySelectorAll('[data-id]').forEach(b => b.onclick = async () => { await Api.borrar(s, b.dataset.id); App.aviso('Eliminado.'); Secciones.lista(app, s); });
    app.querySelector('#fItem').onsubmit = async e => {
      e.preventDefault(); const v = Object.fromEntries(new FormData(e.target));
      const f = Validaciones.requeridos(v, cfg.req); if (f.length) return App.aviso('Completa: ' + f.join(', '), true);
      try { await Api.crear(s, v); App.aviso('Agregado.'); Secciones.lista(app, s); } catch (err) { App.aviso(err.message, true); }
    };
  }
};
