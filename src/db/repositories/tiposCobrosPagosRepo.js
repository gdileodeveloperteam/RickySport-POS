const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

async function GetAll(tipoMovimiento) {
  const pool = await getPool();
  const request = pool.request();
  let query = `
    SELECT GUID, TIPO, DESCRIPCION, TIPOMOVIMIENTO
    FROM TiposCobrosPagos
    WHERE (dts IS NULL OR dts = 0)
  `;
  if (tipoMovimiento) {
    query += ` AND TIPOMOVIMIENTO = @tipoMovimiento`;
    request.input('tipoMovimiento', sql.Char(1), tipoMovimiento);
  }
  query += ` ORDER BY TIPO`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM TiposCobrosPagos WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

async function Create({ tipo, descripcion, tipoMovimiento }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('tipo', sql.TinyInt, tipo || 0)
    .input('descripcion', sql.Char(40), descripcion)
    .input('tipoMovimiento', sql.Char(1), tipoMovimiento)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO TiposCobrosPagos (GUID, TIPO, DESCRIPCION, TIPOMOVIMIENTO, ts, sts)
      VALUES (@guid, @tipo, @descripcion, @tipoMovimiento, @ts, @sts)
    `);
  return { guid };
}

async function Update(guid, { tipo, descripcion, tipoMovimiento }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('tipo', sql.TinyInt, tipo || 0)
    .input('descripcion', sql.Char(40), descripcion)
    .input('tipoMovimiento', sql.Char(1), tipoMovimiento)
    .input('sts', sql.Float, ts)
    .query(`
      UPDATE TiposCobrosPagos
      SET TIPO = @tipo, DESCRIPCION = @descripcion, TIPOMOVIMIENTO = @tipoMovimiento, sts = @sts
      WHERE GUID = @guid
    `);
}

async function Delete(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE TiposCobrosPagos SET dts = @dts WHERE GUID = @guid`);
}

module.exports = { GetAll, GetByGuid, Create, Update, Delete };
