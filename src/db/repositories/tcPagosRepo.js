const { getPool, sql } = require('../pool');

async function GetAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, CODIGO_TCP, ABREVIADO, TIPO_COMPROBANTE, INTERES, COEFICIENTE,
           NUMERO_COMERCIO, TIPO, DATOSADICIONAL
    FROM TCPagos
    WHERE (dts IS NULL OR dts = 0)
    ORDER BY TIPO_COMPROBANTE
  `);
  return result.recordset;
}

async function GetPlanes(guidTcPago) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guidTcPago)
    .query(`
      SELECT GUID, NOMBRECOMPROBANTEPAGO, INTERES, COEFICIENTE, CUOTAS
      FROM TCPagosPlanes
      WHERE GUIDTCPAGOS = @guid AND (dts IS NULL OR dts = 0)
      ORDER BY CUOTAS
    `);
  return result.recordset;
}

module.exports = { GetAll, GetPlanes };
