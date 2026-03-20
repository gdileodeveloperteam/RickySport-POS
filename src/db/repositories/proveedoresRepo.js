const { getPool, sql } = require('../pool');

async function GetAll(search, guidConfiguracion) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(p.dts IS NULL OR p.dts = 0)';
  if (search) {
    request.input('search', sql.VarChar(255), `%${search}%`);
    where += ' AND (p.NOMBRE LIKE @search OR p.CUIT LIKE @search OR p.RUBRO LIKE @search)';
  }
  if (guidConfiguracion) {
    request.input('guidConfig', sql.Char(16), guidConfiguracion);
    where += ' AND p.GUIDCONFIGURACION = @guidConfig';
  }
  const result = await request.query(`
    SELECT p.GUID, p.NOMBRE, p.CUIT, p.RUBRO, p.TELEFONO, p.CELULAR, p.EMAIL, p.DIRECCION, p.LOCALIDAD, p.ACTIVO
    FROM Proveedores p WHERE ${where} ORDER BY p.NOMBRE
  `);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query('SELECT * FROM Proveedores WHERE GUID = @guid AND (dts IS NULL OR dts = 0)');
  return result.recordset[0] || null;
}

module.exports = { GetAll, GetByGuid };
