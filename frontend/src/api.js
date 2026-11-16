//Cliente fetch hacia la API REST; agrega el token JWT si existe
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mensaje = data.errores?.map(e => e.mensaje).join(' · ') || data.error || `Error ${res.status}`;
    throw new Error(mensaje);
  }
  return data;
}
