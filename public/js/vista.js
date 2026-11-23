/* Módulo de vista previa: arma la hoja de vida con los datos del servicio /api/hoja-vida y permite descargarla */
const Vista = {
  async pintar(app) {
    const { datos: d } = await Api.hojaVida(), p = d.personales || {};
    const bloque = (t, arr, f) => arr.length ? `<h3>${t}</h3>${arr.map(f).join('')}` : '';
    app.innerHTML = `<div class="no-imprimir" style="margin-bottom:12px"><button class="prim" onclick="print()">Descargar en PDF</button>
      <button class="sec" id="bBorrar">Eliminar mi cuenta</button></div>
      <article class="cv tarjeta"><h1>${esc(d.nombre)}</h1><b>${esc(p.cargo)}</b>
      <p>${esc(p.ciudad)} · ${esc(p.telefono)} · ${esc(d.correo)}${p.documento ? ' · C.C. ' + esc(p.documento) : ''}</p>
      ${p.perfil ? `<h3>Perfil</h3><p>${esc(p.perfil)}</p>` : ''}
      ${bloque('Formación académica', d.formacion, x => `<p><b>${esc(x.titulo)}</b> – ${esc(x.institucion)} ${esc(x.inicio)}${x.fin ? '–' + esc(x.fin) : ''}</p>`)}
      ${bloque('Experiencia laboral', d.experiencia, x => `<p><b>${esc(x.cargo)}</b> – ${esc(x.empresa)} ${esc(x.inicio)}${x.fin ? '–' + esc(x.fin) : ''}<br>${esc(x.funciones)}</p>`)}
      ${bloque('Habilidades', d.habilidades, x => `<span>${esc(x.nombre)} (${esc(x.nivel)}) · </span>`)}
      ${bloque('Referencias', d.referencias, x => `<p>${esc(x.nombre)} – ${esc(x.tipo)} – ${esc(x.telefono)}</p>`)}
      </article>`;
    app.querySelector('#bBorrar').onclick = async () => {
      if (!confirm('¿Seguro? Se borrarán tu cuenta y todos tus datos.')) return;
      await Api.eliminarCuenta(); Api.cerrar(); location.reload();
    };
  }
};
