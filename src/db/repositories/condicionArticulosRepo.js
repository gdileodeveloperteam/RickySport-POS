const { getPool, sql } = require('../pool');

async function GetAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, ESTADO FROM CondicionArticulos ORDER BY ESTADO
  `);
  return result.recordset;
}

module.exports = { GetAll };
