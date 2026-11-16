import { useState } from 'react';
import { api } from '../api.js';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida los campos del formulario y devuelve un objeto de errores
const validar = (datos, esRegistro) => {
  const errores = {};
  if (esRegistro && !datos.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!EMAIL_VALIDO.test(datos.email)) errores.email = 'Email inválido';
  if (datos.contrasena.length < 6) errores.contrasena = 'Mínimo 6 caracteres';
  return errores;
};

export default function Login({ onLogin }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [datos, setDatos] = useState({ nombre: '', email: '', contrasena: '' });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async e => {
    e.preventDefault();
    setError('');
    const nuevosErrores = validar(datos, esRegistro);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setEnviando(true);
    try {
      if (esRegistro) {
        await api('/auth/registro', { method: 'POST', body: datos });
      }
      const { token, usuario } = await api('/auth/login', {
        method: 'POST',
        body: { email: datos.email, contrasena: datos.contrasena },
      });
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      onLogin(usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="tarjeta estrecha">
      <h2>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      <form onSubmit={enviar} noValidate>
        {esRegistro && (
          <Campo label="Nombre" name="nombre" value={datos.nombre} onChange={cambiar} error={errores.nombre} />
        )}
        <Campo label="Email" name="email" type="email" value={datos.email} onChange={cambiar} error={errores.email} />
        <Campo label="Contraseña" name="contrasena" type="password" value={datos.contrasena} onChange={cambiar} error={errores.contrasena} />
        {error && <p className="error">{error}</p>}
        <button className="primario" disabled={enviando}>
          {enviando ? 'Enviando...' : esRegistro ? 'Registrarme' : 'Ingresar'}
        </button>
      </form>
      <button className="enlace" onClick={() => { setEsRegistro(!esRegistro); setErrores({}); setError(''); }}>
        {esRegistro ? 'Ya tengo cuenta' : 'No tengo cuenta, registrarme'}
      </button>
    </section>
  );
}

export function Campo({ label, error, ...props }) {
  return (
    <label className="campo">
      <span>{label}</span>
      <input {...props} />
      {error && <small className="error">{error}</small>}
    </label>
  );
}
