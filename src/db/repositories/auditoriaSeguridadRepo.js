const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

// Inserta una fila en AuditoriaSeguridad. Fire-and-await con try/catch interno:
// si falla, loggea pero NO interrumpe la request. La vista Seguridad es de uso
// puntual y no queremos perder un cambio real por un error en la auditoria.
//
// Parametros:
//   req            - request de Express (guid del actor + ip)
//   entidad        - 'ROL' | 'ROL_MODULO' | 'ROL_PERMISO' | 'USUARIO_ROL'
//   guidEntidad    - guid afectado (rol, usuario, etc.) — opcional
//   accion         - 'CREAR' | 'EDITAR' | 'ELIMINAR' | 'ASIGNAR' | 'COPIAR'
//   antesJson      - objeto serializable o null
//   despuesJson    - objeto serializable o null
async function Registrar(req, { entidad, guidEntidad, accion, antesJson, despuesJson }) {
  try {
    const pool = await getPool();
    const now = tsNow();
    const guidUsuario = (req.user && req.user.guid) || '';
    const ip = (req.ip || req.headers['x-forwarded-for'] || '').toString().slice(0, 64) || null;

    await pool.request()
      .input('guid', sql.Char(16), newGuid())
      .input('guidUsuarios', sql.Char(16), guidUsuario)
      .input('entidad', sql.NVarChar(30), entidad)
      .input('guidEntidad', sql.Char(16), guidEntidad || null)
      .input('accion', sql.NVarChar(20), accion)
      .input('antesJson', sql.NVarChar(sql.MAX), antesJson != null ? JSON.stringify(antesJson) : null)
      .input('despuesJson', sql.NVarChar(sql.MAX), despuesJson != null ? JSON.stringify(despuesJson) : null)
      .input('ip', sql.NVarChar(64), ip)
      .input('ts', sql.Float, now)
      .input('sts', sql.Float, now)
      .query(`
        INSERT INTO AuditoriaSeguridad
          (GUID, GUIDUSUARIOS, ENTIDAD, GUIDENTIDAD, ACCION, ANTES_JSON, DESPUES_JSON, IP, ts, sts)
        VALUES
          (@guid, @guidUsuarios, @entidad, @guidEntidad, @accion, @antesJson, @despuesJson, @ip, @ts, @sts)
      `);
  } catch (err) {
    console.error('[auditoriaSeguridad] fallo al registrar:', entidad, accion, err.message);
  }
}

// Lista AuditoriaSeguridad con filtros.
// Params: { desde, hasta, guidUsuario, entidad, accion, limit }
async function GetCambios({ desde, hasta, guidUsuario, entidad, accion, limit = 500 } = {}) {
  const pool = await getPool();
  const request = pool.request();
  const where = [`1=1`];
  if (desde) { request.input('desde', sql.DateTime, new Date(desde));   where.push(`a.FECHA >= @desde`); }
  if (hasta) { request.input('hasta', sql.DateTime, new Date(hasta));   where.push(`a.FECHA <= @hasta`); }
  if (guidUsuario) { request.input('guidUsuario', sql.Char(16), guidUsuario); where.push(`a.GUIDUSUARIOS = @guidUsuario`); }
  if (entidad) { request.input('entidad', sql.NVarChar(30), entidad);   where.push(`a.ENTIDAD = @entidad`); }
  if (accion)  { request.input('accion',  sql.NVarChar(20), accion);    where.push(`a.ACCION = @accion`); }
  request.input('limit', sql.Int, Math.min(Math.max(1, parseInt(limit) || 500), 5000));

  const result = await request.query(`
    SELECT TOP (@limit)
      a.GUID, a.GUIDUSUARIOS, a.ENTIDAD, a.GUIDENTIDAD, a.ACCION,
      a.ANTES_JSON, a.DESPUES_JSON, a.FECHA, a.IP,
      u.ID AS UsuarioId, u.NOMBRE AS UsuarioNombre
    FROM AuditoriaSeguridad a
    LEFT JOIN Usuarios u ON u.GUID = a.GUIDUSUARIOS
    WHERE ${where.join(' AND ')}
    ORDER BY a.FECHA DESC
  `);

  return result.recordset.map(r => ({
    guid: (r.GUID || '').trim(),
    guidUsuario: (r.GUIDUSUARIOS || '').trim(),
    usuarioId: (r.UsuarioId || '').trim(),
    usuarioNombre: (r.UsuarioNombre || '').trim(),
    entidad: (r.ENTIDAD || '').trim(),
    guidEntidad: (r.GUIDENTIDAD || '').trim() || null,
    accion: (r.ACCION || '').trim(),
    antesJson: parseJson(r.ANTES_JSON),
    despuesJson: parseJson(r.DESPUES_JSON),
    fecha: r.FECHA,
    ip: r.IP,
  }));
}

// Lista AuditoriaAcciones con filtros.
// Params: { desde, hasta, guidUsuario, codigoPermiso, resultado, limit }
async function GetAcciones({ desde, hasta, guidUsuario, codigoPermiso, resultado, limit = 500 } = {}) {
  const pool = await getPool();
  const request = pool.request();
  const where = [`1=1`];
  if (desde) { request.input('desde', sql.DateTime, new Date(desde));   where.push(`a.FECHA >= @desde`); }
  if (hasta) { request.input('hasta', sql.DateTime, new Date(hasta));   where.push(`a.FECHA <= @hasta`); }
  if (guidUsuario) { request.input('guidUsuario', sql.Char(16), guidUsuario); where.push(`a.GUIDUSUARIOS = @guidUsuario`); }
  if (codigoPermiso) { request.input('codigoPermiso', sql.NVarChar(64), codigoPermiso); where.push(`a.CODIGOPERMISO = @codigoPermiso`); }
  if (resultado)   { request.input('resultado',   sql.NVarChar(20), resultado);   where.push(`a.RESULTADO = @resultado`); }
  request.input('limit', sql.Int, Math.min(Math.max(1, parseInt(limit) || 500), 5000));

  const result = await request.query(`
    SELECT TOP (@limit)
      a.GUID, a.GUIDUSUARIOS, a.CODIGOPERMISO, a.ENTIDAD, a.GUIDENTIDAD,
      a.RESULTADO, a.DETALLE_JSON, a.FECHA, a.IP,
      u.ID AS UsuarioId, u.NOMBRE AS UsuarioNombre
    FROM AuditoriaAcciones a
    LEFT JOIN Usuarios u ON u.GUID = a.GUIDUSUARIOS
    WHERE ${where.join(' AND ')}
    ORDER BY a.FECHA DESC
  `);

  return result.recordset.map(r => ({
    guid: (r.GUID || '').trim(),
    guidUsuario: (r.GUIDUSUARIOS || '').trim(),
    usuarioId: (r.UsuarioId || '').trim(),
    usuarioNombre: (r.UsuarioNombre || '').trim(),
    codigoPermiso: (r.CODIGOPERMISO || '').trim(),
    entidad: (r.ENTIDAD || '').trim() || null,
    guidEntidad: (r.GUIDENTIDAD || '').trim() || null,
    resultado: (r.RESULTADO || '').trim(),
    detalleJson: parseJson(r.DETALLE_JSON),
    fecha: r.FECHA,
    ip: r.IP,
  }));
}

function parseJson(s) {
  if (s == null) return null;
  try { return JSON.parse(s); } catch (_) { return s; }
}

module.exports = { Registrar, GetCambios, GetAcciones };
