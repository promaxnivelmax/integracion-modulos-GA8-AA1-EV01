/* Controlador principal: navegación entre módulos (mapa de navegación) y mensajes al usuario */
const App = {
  app: document.getElementById('app'),
  aviso(texto, error) {
    const a = document.getElementById('aviso'); a.textContent = texto; a.className = 'aviso' + (error ? ' error' : '');
    clearTimeout(App.t); App.t = setTimeout(() => a.classList.add('oculto'), 3000);
  },
  async ir(vista) {
    document.querySelectorAll('#menu [data-vista]').forEach(b => b.classList.toggle('activo', b.dataset.vista === vista));
    try {
      if (vista === 'datos') await Secciones.datos(App.app);
      else if (vista === 'vista') await Vista.pintar(App.app);
      else await Secciones.lista(App.app, vista);
    } catch (e) { App.aviso(e.message, true); }
  },
  iniciar() {
    const menu = document.getElementById('menu');
    if (!Api.conToken()) { menu.classList.add('oculto'); return Auth.pintar(App.app); }
    menu.classList.remove('oculto');
    menu.querySelectorAll('[data-vista]').forEach(b => b.onclick = () => App.ir(b.dataset.vista));
    document.getElementById('salir').onclick = () => { Api.cerrar(); App.iniciar(); };
    App.ir('datos');
  }
};
App.iniciar();
