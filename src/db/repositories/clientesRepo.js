const { getPool, sql } = require('../pool');

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

module.exports = { GetAll, GetByGuid, GetCtaCte, ValidarCreditoCtaCte, GetSaldo, UpdateSaldo };
