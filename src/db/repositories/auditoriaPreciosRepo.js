const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToInt, timeToInt, dateToClarion } = require('../../utils/guidHelper');

// Registra un cambio manual de precio dentro de una transacción de venta
async function RegistrarCambioPrecio(tx, { guidRemito, guidArticulo, guidUsuario, codigoArticulo, descripcion, precioBase, precioMedioPago, precioModificado, nombreUsuario }) {
  const guid = newGuid();
  const ts = tsNow();
  const fecha = dateToInt();
  const hora = timeToInt();
  // Diferencia calculada sobre precio s/medio de pago (referencia real)
  const ref = precioMedioPago || precioBase;
  const diferencia = Math.round((precioModificado - ref) * 100) / 100;
  let diferenciaPorcentaje = ref !== 0 ? Math.round(((precioModificado - ref) / ref) * 10000) / 100 : 0;
  // Limitar a rango DECIMAL(5,2): -999.99 a 999.99
  diferenciaPorcentaje = Math.max(-999.99, Math.min(999.99, diferenciaPorcentaje));

  await tx.request()
    .input('guid', sql.Char(16), guid)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .input('guidRemito', sql.Char(16), guidRemito)
    .input('guidArticulo', sql.Char(16), guidArticulo || '')
    .input('guidUsuario', sql.Char(16), guidUsuario || '')
    .input('codigoArticulo', sql.VarChar(255), codigoArticulo || '')
    .input('descripcion', sql.VarChar(1024), descripcion || '')
    .input('precioBase', sql.Float, precioBase)
    .input('precioMedioPago', sql.Float, precioMedioPago || precioBase)
    .input('precioModificado', sql.Float, precioModificado)
    .input('diferencia', sql.Float, diferencia)
    .input('diferenciaPorcentaje', sql.Float, diferenciaPorcentaje)
    .input('nombreUsuario', sql.VarChar(255), nombreUsuario || '')
    .input('fecha', sql.Int, fecha)
    .input('hora', sql.Int, hora)
    .query(`
      INSERT INTO AuditoriaPreciosVenta
        (GUID, ts, sts, GuidRemito, GuidArticulo, GuidUsuario,
         CodigoArticulo, Descripcion, PrecioBase, PrecioMedioPago, PrecioModificado,
         Diferencia, DiferenciaPorcentaje, NombreUsuario, Fecha, Hora)
      VALUES
        (@guid, @ts, @sts, @guidRemito, @guidArticulo, @guidUsuario,
         @codigoArticulo, @descripcion,
         CAST(@precioBase AS DECIMAL(13,2)), CAST(@precioMedioPago AS DECIMAL(13,2)), CAST(@precioModificado AS DECIMAL(13,2)),
         CAST(@diferencia AS DECIMAL(13,2)), CAST(@diferenciaPorcentaje AS DECIMAL(5,2)),
         @nombreUsuario, @fecha, @hora)
    `);

  return { guid };
}

// Consultar historial de cambios de precio
async function GetCambiosPrecios({ desde, hasta, guidSucursal } = {}) {
  const pool = await getPool();
  const request = pool.request();
  let query = `
    SELECT a.GUID, a.GuidRemito, a.GuidArticulo, a.GuidUsuario,
           a.CodigoArticulo, a.Descripcion, a.PrecioBase, a.PrecioMedioPago, a.PrecioModificado,
           a.Diferencia, a.DiferenciaPorcentaje, a.NombreUsuario, a.Fecha, a.Hora
    FROM AuditoriaPreciosVenta a
    WHERE (a.dts IS NULL OR a.dts = 0)
  `;
  if (desde) {
    request.input('desde', sql.Int, parseInt(desde));
    query += ` AND a.Fecha >= @desde`;
  }
  if (hasta) {
    request.input('hasta', sql.Int, parseInt(hasta));
    query += ` AND a.Fecha <= @hasta`;
  }
  query += ` ORDER BY a.Fecha DESC, a.Hora DESC`;
  const result = await request.query(query);
  return result.recordset;
}

module.exports = { RegistrarCambioPrecio, GetCambiosPrecios };
