const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToClarion } = require('../../utils/guidHelper');

async function Create({ nombre, documento, cuit, direccion, email, celular, tipoIva, tipoFactura, codigoDocumentoAfip }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(CODIGO_CLIENTE), 0) + 1 AS Next FROM Clientes`);
  const codigoCliente = idResult.recordset[0].Next;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('codigoCliente', sql.Int, codigoCliente)
    .input('nombre', sql.VarChar(255), nombre)
    .input('documento', sql.VarChar(20), documento || '')
    .input('cuit', sql.VarChar(20), cuit || '')
    .input('direccion', sql.VarChar(255), direccion || '')
    .input('email', sql.VarChar(255), email || '')
    .input('celular', sql.VarChar(60), celular || '')
    .input('tipoIva', sql.VarChar(40), tipoIva || 'CONSUMIDOR FINAL')
    .input('tipoFactura', sql.Char(1), tipoFactura || 'B')
    .input('codigoDocumentoAfip', sql.SmallInt, codigoDocumentoAfip || 96)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO Clientes (GUID, CODIGO_CLIENTE, NOMBRE, DOCUMENTO, CUIT, DIRECCION, EMAIL, CELULAR,
        TIPO_IVA, TIPO_FACTURA, CODIGO_DOCUMENTO_AFIP, SALDO, ts, sts)
      VALUES (@guid, @codigoCliente, @nombre, @documento, @cuit, @direccion, @email, @celular,
        @tipoIva, @tipoFactura, @codigoDocumentoAfip, 0, @ts, @sts)
    `);
  return { guid, codigoCliente };
}

async function GetAll(search) {
  const pool = await getPool();
  let query = `
    SELECT GUID, CODIGO_CLIENTE, NOMBRE, CUENTA, DIRECCION, CUIT, DOCUMENTO,
           EMAIL, TELEFONO, CELULAR, TIPO_IVA, TIPO_FACTURA, SALDO,
           LIMITE_CREDITO, PERMITECREDITO, LOCALIDAD, PROVINCIA
    FROM Clientes
    WHERE (dts IS NULL OR dts = 0)
  `;
  const request = pool.request();
  if (search) {
    query += ` AND (NOMBRE LIKE @search OR CUIT LIKE @search OR DOCUMENTO LIKE @search)`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  query += ` ORDER BY NOMBRE`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM Clientes WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

async function GetCtaCte(search) {
  const pool = await getPool();
  let query = `
    SELECT GUID, CODIGO_CLIENTE, NOMBRE, CUENTA, DIRECCION, CUIT, DOCUMENTO,
           EMAIL, TELEFONO, CELULAR, TIPO_IVA, TIPO_FACTURA, SALDO,
           LIMITE_CREDITO, PERMITECREDITO, LOCALIDAD, PROVINCIA
    FROM Clientes
    WHERE (dts IS NULL OR dts = 0)
      AND ISNULL(LIMITE_CREDITO, 0) <> 0
  `;
  const request = pool.request();
  if (search) {
    query += ` AND (NOMBRE LIKE @search OR CUIT LIKE @search OR DOCUMENTO LIKE @search)`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  query += ` ORDER BY NOMBRE`;
  const result = await request.query(query);
  return result.recordset;
}

async function ValidarCreditoCtaCte(guid, importeVenta) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT ISNULL(SALDO, 0) AS Saldo, ISNULL(LIMITE_CREDITO, 0) AS LimiteCredito FROM Clientes WHERE GUID = @guid`);
  const cliente = result.recordset[0];
  if (!cliente) return { ok: false, mensaje: 'Cliente no encontrado' };

  const limite = cliente.LimiteCredito;
  const saldo = cliente.Saldo;

  // Limite < 0 = sin tope de crédito
  if (limite < 0) return { ok: true, saldo, limite, mensaje: 'Sin límite de crédito' };

  // Limite > 0 = verificar que saldo + venta no supere el límite
  const nuevoSaldo = saldo + importeVenta;
  if (nuevoSaldo > limite) {
    return {
      ok: false,
      saldo,
      limite,
      nuevoSaldo,
      mensaje: `Supera el límite de crédito. Saldo actual: $${saldo.toFixed(2)}, Límite: $${limite.toFixed(2)}, Total con esta venta: $${nuevoSaldo.toFixed(2)}`
    };
  }

  return { ok: true, saldo, limite, nuevoSaldo, mensaje: 'OK' };
}

async function GetSaldo(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT ISNULL(SALDO, 0) AS Saldo FROM Clientes WHERE GUID = @guid`);
  return result.recordset[0] || { Saldo: 0 };
}

async function UpdateSaldo(guid, nuevoSaldo) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('saldo', sql.Decimal(13, 3), nuevoSaldo)
    .query(`UPDATE Clientes SET SALDO = @saldo WHERE GUID = @guid`);
}

async function GetMovimientos(guidCliente, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  request.input('guidCliente', sql.Char(16), guidCliente);
  let where = 'mc.GUIDCLIENTES = @guidCliente AND (mc.dts IS NULL OR mc.dts = 0)';
  if (desde) { request.input('desde', sql.Decimal(7), dateToClarion(desde)); where += ' AND mc.FECHA >= @desde'; }
  if (hasta) { request.input('hasta', sql.Decimal(7), dateToClarion(hasta)); where += ' AND mc.FECHA <= @hasta'; }
  const result = await request.query(`
    SELECT mc.GUID, mc.FECHA, mc.DESCRIPCION, mc.DEBE, mc.HABER, mc.SALDO,
           mc.GUIDREMITOS, mc.GUIDREMITOSDEVOLUCIONES, mc.GUIDREMITOSCAMBIOS
    FROM MovimientoClientes mc
    WHERE ${where}
    ORDER BY mc.FECHA DESC, mc.ts DESC
  `);
  return result.recordset;
}

async function GetFacturas(guidCliente, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  request.input('guidCliente', sql.Char(16), guidCliente);
  let where = 'f.GUIDCLIENTES = @guidCliente AND (f.dts IS NULL OR f.dts = 0)';
  if (desde) { request.input('desde', sql.Decimal(7), dateToClarion(desde)); where += ' AND f.FECHA >= @desde'; }
  if (hasta) { request.input('hasta', sql.Decimal(7), dateToClarion(hasta)); where += ' AND f.FECHA <= @hasta'; }
  const result = await request.query(`
    SELECT f.GUID, f.NUMERO_FACTURA, f.TIPO_COMPROBANTE, f.TIPO_FACTURA,
           f.FECHA, f.TOTAL, f.NOMBRE, f.CUIT, f.CAE, f.PENDIENTE,
           f.GUIDREMITOS
    FROM Facturas f
    WHERE ${where}
    ORDER BY f.FECHA DESC, f.ts DESC
  `);
  return result.recordset;
}

module.exports = { Create, GetAll, GetByGuid, GetCtaCte, ValidarCreditoCtaCte, GetSaldo, UpdateSaldo, GetMovimientos, GetFacturas };
