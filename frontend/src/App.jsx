import { useState } from 'react';
import Login from './pages/Login.jsx';
import Crud from './pages/Crud.jsx';
import Viajes from './pages/Viajes.jsx';

const PAGINAS_PRIVADAS = {
  vehiculos: 'Vehículos',
  conductores: 'Conductores',
  viajes: 'Viajes',
};

export default function App() {
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario') || 'null'));
  const [pagina, setPagina] = useState('inicio');

  const salir = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setPagina('inicio');
  };

  const irA = destino => setPagina(destino);

  return (
    <>
      <nav className="nav">
        <strong className="marca" onClick={() => irA('inicio')}>Transporte</strong>
        {usuario && Object.entries(PAGINAS_PRIVADAS).map(([clave, texto]) => (
          <button key={clave} className={pagina === clave ? 'activo' : ''} onClick={() => irA(clave)}>
            {texto}
          </button>
        ))}
        <span className="espacio" />
        {usuario
          ? <button onClick={salir}>Salir ({usuario.nombre})</button>
          : <button onClick={() => irA('login')}>Iniciar sesión</button>}
      </nav>

      <main className="contenedor">
        {pagina === 'inicio' && (
          <section className="tarjeta">
            <h1>Gestión de vehículos, conductores y viajes</h1>
            <p>Registrá los vehículos de la empresa, sus conductores y los viajes realizados.</p>
            {!usuario && <button className="primario" onClick={() => irA('login')}>Ingresar al sistema</button>}
          </section>
        )}

        {pagina === 'login' && (
          <Login onLogin={u => { setUsuario(u); irA('vehiculos'); }} />
        )}

        {!usuario && PAGINAS_PRIVADAS[pagina] && (
          <Login onLogin={u => { setUsuario(u); irA(pagina); }} />
        )}

        {usuario && pagina === 'vehiculos' && (
          <Crud
            titulo="Vehículos"
            ruta="/vehiculos"
            columnas={['marca', 'modelo', 'patente', 'anio', 'capacidad_carga']}
            campos={[
              { name: 'marca', label: 'Marca', required: true },
              { name: 'modelo', label: 'Modelo', required: true },
              { name: 'patente', label: 'Patente', required: true },
              { name: 'anio', label: 'Año', type: 'number', required: true, min: 1900, max: 2100 },
              { name: 'capacidad_carga', label: 'Capacidad de carga (kg)', type: 'number', required: true, min: 0 },
            ]}
          />
        )}

        {usuario && pagina === 'conductores' && (
          <Crud
            titulo="Conductores"
            ruta="/conductores"
            columnas={['nombre', 'apellido', 'numero_documento', 'numero_licencia', 'fecha_vencimiento_licencia']}
            campos={[
              { name: 'nombre', label: 'Nombre', required: true },
              { name: 'apellido', label: 'Apellido', required: true },
              { name: 'numero_documento', label: 'Número de documento', required: true },
              { name: 'numero_licencia', label: 'Número de licencia', required: true },
              { name: 'fecha_alta_licencia', label: 'Fecha de alta de licencia', type: 'date', required: true },
              { name: 'fecha_vencimiento_licencia', label: 'Vencimiento de licencia', type: 'date', required: true },
            ]}
          />
        )}

        {usuario && pagina === 'viajes' && <Viajes />}
      </main>
    </>
  );
}
