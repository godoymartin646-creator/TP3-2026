const notFound = (req, res) => res.status(404).json({ error: 'Ruta no encontrada' });

const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'Ya existe un registro con esos datos únicos' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'El vehículo o conductor indicado no existe' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ error: 'No se puede eliminar: el registro tiene viajes asociados' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };
