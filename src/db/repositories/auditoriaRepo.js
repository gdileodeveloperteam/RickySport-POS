const { getPool, sql } = require('../pool');
const { newGuid } = require('../../utils/guidHelper');

// Inserta una fila en AuditoriaAcciones.
// Diseñado como fire-and-await con try/catch interno: si la insercion falla,
// loggea el error pero NO interrumpe la request del usuario.
//
// Parametros:
//   req            — request de Express (para extraer guidUsuario, ip, contexto)
//   codigoPermiso  — string codigo del permiso especial (ej. 'VENTA.ANULAR')
//   resultado      — 'OK' | 'DENIED'
//   ctx            — opcional { entidad, guidEntidad, detalle }
async function RegistrarAccion(req, codigoPermiso, resultado, ctx = {}) {
  try {
    const pool = await getPool();
    const guid = newGuid();
    const nowTs = Date.now() / 1000;

    const guidUsuario = (req.user && req.user.guid) || '';
    const ip = (req.ip || req.headers['x-forwarded-for'] || '').toString().slice(0, 64);

    const detalleObj = {
      method: req.method,
      url: req.originalUrl,
    };
    if (req.params && Object.keys(req.params).length > 0) detalleObj.params = req.params;
    if (ctx && ctx.detalle) Object.assign(detalleObj, ctx.detalle);
    const detalleJson = JSON.stringify(detalleObj);

    await pool.request()
      .input('guid', sql.Char(16), guid)
      .input('guidUsuarios', sql.Char(16), guidUsuario)
      .input('codigoPermiso', sql.NVarChar(64), codigoPermiso)
      .input('entidad', sql.NVarChar(30), (ctx && ctx.entidad) || null)
      .input('guidEntidad', sql.Char(16), (ctx && ctx.guidEntidad) || null)
      .input('resultado', sql.NVarChar(20), resultado)
      .input('detalleJson', sql.NVarChar(sql.MAX), detalleJson)
      .input('ip', sql.NVarChar(64), ip || null)
      .input('ts', sql.Float, nowTs)
      .input('sts', sql.Float, nowTs)
      .query(`
        INSERT INTO AuditoriaAcciones
          (GUID, GUIDUSUARIOS, CODIGOPERMISO, ENTIDAD, GUIDENTIDAD, RESULTADO, DETALLE_JSON, IP, ts, sts)
        VALUES
          (@guid, @guidUsuarios, @codigoPermiso, @entidad, @guidEntidad, @resultado, @detalleJson, @ip, @ts, @sts)
      `);
  } catch (err) {
    console.error('[auditoria] fallo al registrar accion:', codigoPermiso, resultado, err.message);
  }
}

module.exports = { RegistrarAccion };
