const { getPool, sql } = require('../pool');

async function GetAll(search) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(dts IS NULL OR dts = 0)';
  if (search) {
    request.input('search', sql.VarChar(255), `%${search}%`);
    where += ' AND (NOMBRE LIKE @search OR DOCUMENTO LIKE @search OR CUIL LIKE @search)';
  }
  const result = await request.query(`
    SELECT GUID, NOMBRE, DOCUMENTO, CUIL, CELULAR, TAREA, ESTADO
    FROM Empleados WHERE ${where} ORDER BY NOMBRE
  `);
  return result.recordset;
}

module.exports = { GetAll };
