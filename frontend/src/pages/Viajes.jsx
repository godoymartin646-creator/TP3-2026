import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Campo } from './Login.jsx';

const VACIO = { vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '', origen: '', destino: '', kilometros: '', observaciones: '' };

export default function Viajes() {
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [filtro, setFiltro] = useState({ tipo: '', id: '' });
  const [total, setTotal] = useState(null);
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');

  const cargarViajes = () => {
    const q = filtro.tipo ? `?${filtro.tipo}_id=${filtro.id}` : '';
    api(`/viajes${q}`).then(setViajes).catch(e => setError(e.message));
  };

  useEffect(() => {
    api('/vehiculos').then(setVehiculos).catch(e => setError(e.message));
    api('/conductores').then(setConductores).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (filtro.tipo && !filtro.id) return;
    cargarViajes();
  }, [filtro]);

  const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

  const validarFormulario = () => {
    const nuevos = {};
    Object.entries(datos).forEach(([k, v]) => {
      if (k !== 'observaciones' && !String(v).trim()) nuevos[k] = 'Campo obligatorio';
    });
    if (datos.fecha_salida && datos.fecha_llegada && datos.fecha_llegada < datos.fecha_salida) {
      nuevos.fecha_llegada = 'La llegada no puede ser anterior a la salida';
    }
    if (datos.kilometros !== '' && Number(datos.kilometros) < 0) nuevos.kilometros = 'Debe ser positivo';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const registrar = async e => {
    e.preventDefault();
    setError('');
    if (!validarFormulario()) return;
    try {
      await api('/viajes', { method: 'POST', body: { ...datos, kilometros: Number(datos.kilometros) } });
      setDatos(VACIO);
      setErrores({});
      cargarViajes();
    } catch (err) {
      setError(err.message);
    }
  };

  const calcularTotal = async () => {
    setError('');
    if (!filtro.tipo || !filtro.id) return setError('Seleccioná un vehículo o conductor para calcular');
    try {
      const r = await api(`/viajes/total-km?${filtro.tipo}_id=${filtro.id}`);
      setTotal(r.total_km);
    } catch (err) {
      setError(err.message);
    }
  };

  const opcionesVehiculo = vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente} – {v.marca} {v.modelo}</option>);
  const opcionesConductor = conductores.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>);

  return (
    <>
      <section className="tarjeta">
        <h2>Historial de viajes</h2>
        <div className="grilla">
          <label className="campo">
            <span>Filtrar por</span>
            <select value={filtro.tipo} onChange={e => { setFiltro({ tipo: e.target.value, id: '' }); setTotal(null); }}>
              <option value="">Todos</option>
              <option value="vehiculo">Vehículo</option>
              <option value="conductor">Conductor</option>
            </select>
          </label>
          {filtro.tipo && (
            <label className="campo">
              <span>{filtro.tipo === 'vehiculo' ? 'Vehículo' : 'Conductor'}</span>
              <select value={filtro.id} onChange={e => { setFiltro({ ...filtro, id: e.target.value }); setTotal(null); }}>
                <option value="">Seleccionar...</option>
                {filtro.tipo === 'vehiculo' ? opcionesVehiculo : opcionesConductor}
              </select>
            </label>
          )}
        </div>
        {filtro.tipo && <button onClick={calcularTotal}>Calcular total de km</button>}
        {total !== null && <p className="total">Total recorrido: <strong>{total} km</strong></p>}
        {error && <p className="error">{error}</p>}

        <table>
          <thead>
            <tr><th>Salida</th><th>Patente</th><th>Conductor</th><th>Origen → Destino</th><th>Km</th></tr>
          </thead>
          <tbody>
            {viajes.map(v => (
              <tr key={v.id}>
                <td>{new Date(v.fecha_salida).toLocaleString('es-AR')}</td>
                <td>{v.patente}</td>
                <td>{v.conductor}</td>
                <td>{v.origen} → {v.destino}</td>
                <td>{v.kilometros}</td>
              </tr>
            ))}
            {!viajes.length && <tr><td colSpan={5}>Sin viajes</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="tarjeta">
        <h3>Registrar viaje</h3>
        <form onSubmit={registrar} noValidate className="grilla">
          <label className="campo">
            <span>Vehículo</span>
            <select name="vehiculo_id" value={datos.vehiculo_id} onChange={cambiar}>
              <option value="">Seleccionar...</option>{opcionesVehiculo}
            </select>
            {errores.vehiculo_id && <small className="error">{errores.vehiculo_id}</small>}
          </label>
          <label className="campo">
            <span>Conductor</span>
            <select name="conductor_id" value={datos.conductor_id} onChange={cambiar}>
              <option value="">Seleccionar...</option>{opcionesConductor}
            </select>
            {errores.conductor_id && <small className="error">{errores.conductor_id}</small>}
          </label>
          <Campo label="Fecha de salida" name="fecha_salida" type="datetime-local" value={datos.fecha_salida} onChange={cambiar} error={errores.fecha_salida} />
          <Campo label="Fecha de llegada" name="fecha_llegada" type="datetime-local" value={datos.fecha_llegada} onChange={cambiar} error={errores.fecha_llegada} />
          <Campo label="Origen" name="origen" value={datos.origen} onChange={cambiar} error={errores.origen} />
          <Campo label="Destino" name="destino" value={datos.destino} onChange={cambiar} error={errores.destino} />
          <Campo label="Kilómetros" name="kilometros" type="number" min="0" value={datos.kilometros} onChange={cambiar} error={errores.kilometros} />
          <Campo label="Observaciones" name="observaciones" value={datos.observaciones} onChange={cambiar} />
          <div className="acciones"><button className="primario">Registrar viaje</button></div>
        </form>
      </section>
    </>
  );
}
