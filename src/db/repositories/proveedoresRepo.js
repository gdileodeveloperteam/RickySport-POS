const { getPool, sql } = require('../pool');

async function GetAll(search) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(dts IS NULL OR dts = 0)';
  if (search) {
    request.input('search', sql.VarChar(255), `%${search}%`);
    where += ' AND (NOMBRE LIKE @search OR CUIT LIKE @search OR RUBRO LIKE @search)';
  }
  const result = await request.query(`
    SELECT GUID, NOMBRE, CUIT, RUBRO, TELEFONO, CELULAR, EMAIL, DIRECCION, LOCALIDAD, ACTIVO
    FROM Proveedores WHERE ${where} ORDER BY NOMBRE
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
