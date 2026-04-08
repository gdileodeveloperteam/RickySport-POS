const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

async function Login(id, clave) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Char(3), id)
    .input('clave', sql.Char(20), clave)
    .query(`
      SELECT u.GUID, u.CODIGOUSUARIO, u.ID, u.NOMBRE, u.NIVEL, u.MODULOS,
             u.GUIDSUCURSALES, u.GUIDCONFIGURACION
      FROM Usuarios u
      WHERE RTRIM(LTRIM(u.ID)) = RTRIM(LTRIM(@id))
        AND RTRIM(LTRIM(u.CLAVE)) = RTRIM(LTRIM(@clave))
        AND (u.dts IS NULL OR u.dts = 0)
    `);
  return result.recordset[0] || null;
}

async function GetAll({ search, page = 1, limit = 30, sortBy, sortDir } = {}) {
  const pool = await getPool();
  limit = Math.min(limit, 200);
  const offset = (page - 1) * limit;

  const allowedSort = ['CODIGOUSUARIO', 'ID', 'NOMBRE', 'NIVEL'];
  const col = allowedSort.includes(sortBy) ? sortBy : 'NOMBRE';
  const dir = sortDir === 'DESC' ? 'DESC' : 'ASC';

  let where = `(dts IS NULL OR dts = 0)`;
  if (search) where += ` AND (RTRIM(LTRIM(NOMBRE)) LIKE @search OR RTRIM(LTRIM(ID)) LIKE @search)`;

  const addInputs = (req) => {
    if (search) req.input('search', sql.VarChar, `%${search.toUpperCase()}%`);
    return req;
  };

  const countResult = await addInputs(pool.request()).query(`SELECT COUNT(*) AS total FROM Usuarios WHERE ${where}`);
  const total = countResult.recordset[0].total;

  const dataReq = addInputs(pool.request());
  dataReq.input('offset', sql.Int, offset);
  dataReq.input('limit', sql.Int, limit);
  const dataResult = await dataReq.query(`
    SELECT GUID, CODIGOUSUARIO, ID, NOMBRE, NIVEL, GUIDSUCURSALES
    FROM Usuarios
    WHERE ${where}
    ORDER BY ${col} ${dir}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return {
    data: dataResult.recordset,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`
      SELECT GUID, CODIGOUSUARIO, ID, NOMBRE, NIVEL, CLAVE, MODULOS,
             GUIDSUCURSALES, GUIDBANCOSCUENTAS, GUIDCONFIGURACION
      FROM Usuarios
      WHERE GUID = @guid AND (dts IS NULL OR dts = 0)
    `);
  return result.recordset[0] || null;
}

async function Create({ id, nombre, clave, nivel, guidsucursales, guidbancoscuentas, guidconfiguracion }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(CODIGOUSUARIO), 0) + 1 AS Next FROM Usuarios`);
  const codigoUsuario = idResult.recordset[0].Next;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('codigoUsuario', sql.SmallInt, codigoUsuario)
    .input('id', sql.Char(3), id)
    .input('nombre', sql.Char(40), nombre)
    .input('clave', sql.Char(20), clave || '')
    .input('nivel', sql.SmallInt, nivel || 0)
    .input('guidsucursales', sql.Char(16), guidsucursales || '')
    .input('guidbancoscuentas', sql.Char(16), guidbancoscuentas || '')
    .input('guidconfiguracion', sql.Char(16), guidconfiguracion || '')
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO Usuarios (GUID, CODIGOUSUARIO, ID, NOMBRE, CLAVE, NIVEL,
        GUIDSUCURSALES, GUIDBANCOSCUENTAS, GUIDCONFIGURACION, ts, sts)
      VALUES (@guid, @codigoUsuario, @id, @nombre, @clave, @nivel,
        @guidsucursales, @guidbancoscuentas, @guidconfiguracion, @ts, @sts)
    `);
  return { guid, codigoUsuario };
}

async function Update(guid, { id, nombre, clave, nivel, guidsucursales, guidbancoscuentas, guidconfiguracion }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('id', sql.Char(3), id)
    .input('nombre', sql.Char(40), nombre)
    .input('clave', sql.Char(20), clave || '')
    .input('nivel', sql.SmallInt, nivel || 0)
    .input('guidsucursales', sql.Char(16), guidsucursales || '')
    .input('guidbancoscuentas', sql.Char(16), guidbancoscuentas || '')
    .input('guidconfiguracion', sql.Char(16), guidconfiguracion || '')
    .input('ts', sql.Float, ts)
    .query(`
      UPDATE Usuarios SET
        ID = @id, NOMBRE = @nombre, CLAVE = @clave, NIVEL = @nivel,
        GUIDSUCURSALES = @guidsucursales, GUIDBANCOSCUENTAS = @guidbancoscuentas,
        GUIDCONFIGURACION = @guidconfiguracion, ts = @ts
      WHERE GUID = @guid AND (dts IS NULL OR dts = 0)
    `);
  return { ok: true };
}

async function Delete(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE Usuarios SET dts = @dts WHERE GUID = @guid`);
  return { ok: true };
}

module.exports = { Login, GetAll, GetByGuid, Create, Update, Delete };
