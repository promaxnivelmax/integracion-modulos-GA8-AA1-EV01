/* Componente Api (patrón Fachada): única puerta de comunicación entre el front-end y los servicios REST */
const Api = (() => {
  let token = sessionStorage.getItem('token') || '';
  async function llamar(metodo, ruta, cuerpo) {
    const r = await fetch('/api' + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const datos = await r.json().catch(() => ({}));
    if (r.status === 401 && token) { Api.cerrar(); location.reload(); }
    if (!r.ok) throw new Error(datos.mensaje || 'Error ' + r.status);
    return datos;
  }
  return {
    conToken: () => !!token,
    guardarToken(t) { token = t; sessionStorage.setItem('token', t); },
    cerrar() { token = ''; sessionStorage.removeItem('token'); },
    registro: d => llamar('POST', '/auth/registro', d),
    login: d => llamar('POST', '/auth/login', d),
    perfil: () => llamar('GET', '/perfil'),
    guardarPerfil: d => llamar('PUT', '/perfil', d),
    listar: s => llamar('GET', '/' + s),
    crear: (s, d) => llamar('POST', '/' + s, d),
    borrar: (s, id) => llamar('DELETE', `/${s}/${id}`),
    hojaVida: () => llamar('GET', '/hoja-vida'),
    eliminarCuenta: () => llamar('DELETE', '/cuenta')
  };
})();
