const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

async function GetAll(search) {
  const pool = await getPool();
  let query = `
    SELECT GUID, BANCO, CUENTANUMERO, DIRECCION, LOCALIDAD, TELEFONO, SALDO, TIPOCUENTA
    FROM Bancos
    WHERE (dts IS NULL OR dts = 0)
  `;
  const request = pool.request();
  if (search) {
    query += ` AND (BANCO LIKE @search OR CUENTANUMERO LIKE @search)`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  query += ` ORDER BY BANCO`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM Bancos WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

async function Create({ banco, cuentaNumero, direccion, localidad, telefono, tipoCuenta }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('banco', sql.VarChar(255), banco)
    .input('cuentaNumero', sql.VarChar(255), cuentaNumero || null)
    .input('direccion', sql.VarChar(255), direccion || null)
    .input('localidad', sql.VarChar(255), localidad || null)
    .input('telefono', sql.Char(16), telefono || null)
    .input('tipoCuenta', sql.VarChar(255), tipoCuenta || null)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO Bancos (GUID, BANCO, CUENTANUMERO, DIRECCION, LOCALIDAD, TELEFONO, SALDO, TIPOCUENTA, ts, sts)
      VALUES (@guid, @banco, @cuentaNumero, @direccion, @localidad, @telefono, 0, @tipoCuenta, @ts, @sts)
    `);
  return { guid };
}

async function Update(guid, { banco, cuentaNumero, direccion, localidad, telefono, tipoCuenta }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('banco', sql.VarChar(255), banco)
    .input('cuentaNumero', sql.VarChar(255), cuentaNumero || null)
    .input('direccion', sql.VarChar(255), direccion || null)
    .input('localidad', sql.VarChar(255), localidad || null)
    .input('telefono', sql.Char(16), telefono || null)
    .input('tipoCuenta', sql.VarChar(255), tipoCuenta || null)
    .input('sts', sql.Float, ts)
    .query(`
      UPDATE Bancos
      SET BANCO = @banco, CUENTANUMERO = @cuentaNumero, DIRECCION = @direccion,
          LOCALIDAD = @localidad, TELEFONO = @telefono, TIPOCUENTA = @tipoCuenta, sts = @sts
      WHERE GUID = @guid AND (dts IS NULL OR dts = 0)
    `);
}

async function Delete(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE Bancos SET dts = @dts WHERE GUID = @guid`);
}

module.exports = { GetAll, GetByGuid, Create, Update, Delete };
