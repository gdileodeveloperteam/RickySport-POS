const { getPool, sql } = require('../pool');

async function GetAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, GUIDCONFIGURACION, CODIGOSUCURSAL, NOMBRE, CUIT, PUNTOVENTA, COTIZACIONDOLAR
    FROM Sucursales
    WHERE (dts IS NULL OR dts = 0)
    ORDER BY NOMBRE
  `);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM Sucursales WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

module.exports = { GetAll, GetByGuid };
