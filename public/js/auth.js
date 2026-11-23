/* Módulo de autenticación: registro e inicio de sesión */
const Auth = {
  pintar(app) {
    app.innerHTML = `
    <section class="tarjeta">
      <h1>Crea tu hoja de vida en línea</h1>
      <p>Llena tus datos una sola vez y descarga tu hoja de vida cuando la necesites.</p>
      <div class="tabs"><button class="sec" id="tIn">Iniciar sesión</button><button class="sec" id="tReg">Crear cuenta</button></div>
      <form id="fAuth">
        <div id="cNombre" class="oculto"><label>Nombre completo</label><input name="nombre" autocomplete="name"></div>
        <label>Correo</label><input name="correo" type="email" autocomplete="email">
        <label>Contraseña (mínimo 8 caracteres)</label><input name="contrasena" type="password" autocomplete="current-password">
        <button class="prim" id="bAuth">Entrar</button>
      </form>
    </section>`;
    let modo = 'login';
    const cambiar = m => { modo = m; app.querySelector('#cNombre').classList.toggle('oculto', m === 'login'); app.querySelector('#bAuth').textContent = m === 'login' ? 'Entrar' : 'Crear cuenta'; };
    app.querySelector('#tIn').onclick = () => cambiar('login');
    app.querySelector('#tReg').onclick = () => cambiar('registro');
    app.querySelector('#fAuth').onsubmit = async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (!Validaciones.correo(d.correo)) return App.aviso('Escribe un correo válido.', true);
      if (!Validaciones.clave(d.contrasena)) return App.aviso('La contraseña debe tener mínimo 8 caracteres.', true);
      try {
        if (modo === 'registro') { await Api.registro(d); App.aviso('Cuenta creada.'); }
        const r = await Api.login({ correo: d.correo, contrasena: d.contrasena });
        Api.guardarToken(r.token); App.iniciar();
      } catch (err) { App.aviso(err.message, true); }
    };
  }
};
