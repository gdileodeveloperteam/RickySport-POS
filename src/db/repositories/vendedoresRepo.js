const { getPool, sql } = require('../pool');

async function GetAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, CODIGOVENDEDOR, NOMBRE, SALDO
    FROM Vendedores
    WHERE (dts IS NULL OR dts = 0)
    ORDER BY NOMBRE
  `);
  return result.recordset;
}

module.exports = { GetAll };
