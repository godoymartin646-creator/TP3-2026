import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Campo } from './Login.jsx';

const VACIO = {};

// Listado + formulario de alta, modificación y eliminación para una entidad
export default function Crud({ titulo, ruta, campos, columnas }) {
  const [filas, setFilas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');

  const cargar = () => api(ruta).then(setFilas).catch(e => setError(e.message));
  useEffect(() => { cargar(); }, [ruta]);

  const limpiar = () => { setEditandoId(null); setDatos(VACIO); setErrores({}); };

  const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

  const validarFormulario = () => {
    const nuevos = {};
    campos.forEach(c => {
      const valor = String(datos[c.name] ?? '').trim();
      if (c.required && !valor) nuevos[c.name] = 'Campo obligatorio';
      if (c.type === 'number' && valor && (Number(valor) < (c.min ?? -Infinity) || Number(valor) > (c.max ?? Infinity))) {
        nuevos[c.name] = `Valor fuera de rango${c.min !== undefined ? ` (mín. ${c.min})` : ''}`;
      }
    });
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async e => {
    e.preventDefault();
    setError('');
    if (!validarFormulario()) return;
    try {
      if (editandoId) await api(`${ruta}/${editandoId}`, { method: 'PUT', body: datos });
      else await api(ruta, { method: 'POST', body: datos });
      limpiar();
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const editar = fila => {
    setEditandoId(fila.id);
    setDatos(Object.fromEntries(campos.map(c => [c.name, c.type === 'date' ? String(fila[c.name]).slice(0, 10) : fila[c.name]])));
    setErrores({});
  };

  const eliminar = async id => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api(`${ruta}/${id}`, { method: 'DELETE' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <section className="tarjeta">
        <h2>{titulo}</h2>
        {error && <p className="error">{error}</p>}
        <table>
          <thead>
            <tr>{columnas.map(c => <th key={c}>{c.replaceAll('_', ' ')}</th>)}<th /></tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.id}>
                {columnas.map(c => <td key={c}>{String(f[c]).slice(0, 10)}</td>)}
                <td className="acciones">
                  <button onClick={() => editar(f)}>Editar</button>
                  <button className="peligro" onClick={() => eliminar(f.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!filas.length && <tr><td colSpan={columnas.length + 1}>Sin registros</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="tarjeta">
        <h3>{editandoId ? `Modificar registro #${editandoId}` : `Alta de ${titulo.toLowerCase()}`}</h3>
        <form onSubmit={guardar} noValidate className="grilla">
          {campos.map(c => (
            <Campo
              key={c.name}
              label={c.label}
              name={c.name}
              type={c.type || 'text'}
              min={c.min}
              max={c.max}
              value={datos[c.name] ?? ''}
              onChange={cambiar}
              error={errores[c.name]}
            />
          ))}
          <div className="acciones">
            <button className="primario">{editandoId ? 'Guardar cambios' : 'Dar de alta'}</button>
            {editandoId && <button type="button" onClick={limpiar}>Cancelar</button>}
          </div>
        </form>
      </section>
    </>
  );
}
