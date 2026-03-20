const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

// ============================================================================
// TCPagos
// ============================================================================
async function GetAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, CODIGO_TCP, ABREVIADO, TIPO_COMPROBANTE, INTERES, COEFICIENTE,
           NUMERO_COMERCIO, TIPO, DATOSADICIONAL, TELEFONO, OBSERVACIONES
    FROM TCPagos
    WHERE (dts IS NULL OR dts = 0)
    ORDER BY TIPO_COMPROBANTE
  `);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM TCPagos WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

async function Create({ tipoComprobante, abreviado, interes, coeficiente, numeroComercio, telefono, observaciones, tipo, datosAdicional }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(CODIGO_TCP), 0) + 1 AS Next FROM TCPagos`);
  const codigoTcp = idResult.recordset[0].Next;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('codigoTcp', sql.Int, codigoTcp)
    .input('tipoComprobante', sql.Char(40), tipoComprobante)
    .input('abreviado', sql.Char(2), abreviado || '')
    .input('interes', sql.Decimal(7, 2), interes || 0)
    .input('coeficiente', sql.Decimal(11, 7), coeficiente || 0)
    .input('numeroComercio', sql.Char(40), numeroComercio || '')
    .input('telefono', sql.Char(60), telefono || '')
    .input('observaciones', sql.VarChar(254), observaciones || '')
    .input('tipo', sql.TinyInt, tipo || 0)
    .input('datosAdicional', sql.TinyInt, datosAdicional || 0)
    .input('guidFormaPagos', sql.Char(16), EMPTY_GUID)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO TCPagos (GUID, CODIGO_TCP, TIPO_COMPROBANTE, ABREVIADO, INTERES, COEFICIENTE,
        NUMERO_COMERCIO, TELEFONO, OBSERVACIONES, TIPO, DATOSADICIONAL,
        GUIDFORMAPAGOS, ts, sts)
      VALUES (@guid, @codigoTcp, @tipoComprobante, @abreviado, @interes, @coeficiente,
        @numeroComercio, @telefono, @observaciones, @tipo, @datosAdicional,
        @guidFormaPagos, @ts, @sts)
    `);
  return { guid, codigoTcp };
}

async function Update(guid, { tipoComprobante, abreviado, interes, coeficiente, numeroComercio, telefono, observaciones, tipo, datosAdicional }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('tipoComprobante', sql.Char(40), tipoComprobante)
    .input('abreviado', sql.Char(2), abreviado || '')
    .input('interes', sql.Decimal(7, 2), interes || 0)
    .input('coeficiente', sql.Decimal(11, 7), coeficiente || 0)
    .input('numeroComercio', sql.Char(40), numeroComercio || '')
    .input('telefono', sql.Char(60), telefono || '')
    .input('observaciones', sql.VarChar(254), observaciones || '')
    .input('tipo', sql.TinyInt, tipo || 0)
    .input('datosAdicional', sql.TinyInt, datosAdicional || 0)
    .input('sts', sql.Float, ts)
    .query(`
      UPDATE TCPagos
      SET TIPO_COMPROBANTE = @tipoComprobante, ABREVIADO = @abreviado,
          INTERES = @interes, COEFICIENTE = @coeficiente, NUMERO_COMERCIO = @numeroComercio,
          TELEFONO = @telefono, OBSERVACIONES = @observaciones, TIPO = @tipo,
          DATOSADICIONAL = @datosAdicional, sts = @sts
      WHERE GUID = @guid
    `);
}

async function Delete(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE TCPagos SET dts = @dts WHERE GUID = @guid`);
}

// ============================================================================
// TCPagosPlanes
// ============================================================================
async function GetPlanes(guidTcPago) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guidTcPago)
    .query(`
      SELECT GUID, NOMBRECOMPROBANTEPAGO, INTERES, COEFICIENTE, CUOTAS, GUIDTCPAGOS
      FROM TCPagosPlanes
      WHERE GUIDTCPAGOS = @guid AND (dts IS NULL OR dts = 0)
      ORDER BY CUOTAS
    `);
  return result.recordset;
}

async function CreatePlan({ guidTcPagos, nombreComprobantePago, interes, coeficiente, cuotas }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('guidTcPagos', sql.Char(16), guidTcPagos)
    .input('nombre', sql.Char(40), nombreComprobantePago || '')
    .input('interes', sql.Decimal(7, 2), interes || 0)
    .input('coeficiente', sql.Decimal(11, 5), coeficiente || 0)
    .input('cuotas', sql.SmallInt, cuotas || 1)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .input('dts', sql.Float, 0)
    .query(`
      INSERT INTO TCPagosPlanes (GUID, GUIDTCPAGOS, NOMBRECOMPROBANTEPAGO, INTERES, COEFICIENTE, CUOTAS, ts, sts, dts)
      VALUES (@guid, @guidTcPagos, @nombre, @interes, @coeficiente, @cuotas, @ts, @sts, @dts)
    `);
  return { guid };
}

async function UpdatePlan(guid, { nombreComprobantePago, interes, coeficiente, cuotas }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('nombre', sql.Char(40), nombreComprobantePago || '')
    .input('interes', sql.Decimal(7, 2), interes || 0)
    .input('coeficiente', sql.Decimal(11, 5), coeficiente || 0)
    .input('cuotas', sql.SmallInt, cuotas || 1)
    .input('sts', sql.Float, ts)
    .query(`
      UPDATE TCPagosPlanes
      SET NOMBRECOMPROBANTEPAGO = @nombre, INTERES = @interes, COEFICIENTE = @coeficiente,
          CUOTAS = @cuotas, sts = @sts
      WHERE GUID = @guid
    `);
}

async function DeletePlan(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE TCPagosPlanes SET dts = @dts WHERE GUID = @guid`);
}

module.exports = { GetAll, GetByGuid, Create, Update, Delete, GetPlanes, CreatePlan, UpdatePlan, DeletePlan };
