const { getPool, sql } = require('../pool');

// Devuelve el % máximo de descuento configurado (env o BD)
async function GetMaxDescuento() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT TOP 1 MaxDescuentoPorcentaje
    FROM ConfiguracionDescuento
    WHERE (dts IS NULL OR dts = 0)
  `);
  if (result.recordset.length > 0) {
    return result.recordset[0].MaxDescuentoPorcentaje;
  }
  // Fallback al .env
  return parseFloat(process.env.MAX_DESCUENTO_PORCENTAJE || '10');
}

// Actualiza el % máximo de descuento en la BD
async function SetMaxDescuento(porcentaje) {
  const pool = await getPool();
  const ts = Date.now() / 1000;
  // Verificar si ya existe un registro activo
  const existing = await pool.request().query(`
    SELECT TOP 1 GUID FROM ConfiguracionDescuento WHERE (dts IS NULL OR dts = 0)
  `);
  if (existing.recordset.length > 0) {
    const guid = existing.recordset[0].GUID;
    await pool.request()
      .input('guid', sql.Char(16), guid)
      .input('porcentaje', sql.Decimal(5, 2), porcentaje)
      .input('ts', sql.Float, ts)
      .query(`
        UPDATE ConfiguracionDescuento
        SET MaxDescuentoPorcentaje = @porcentaje, ts = @ts
        WHERE GUID = @guid
      `);
  } else {
    const crypto = require('crypto');
    const guid = crypto.randomBytes(8).toString('hex');
    await pool.request()
      .input('guid', sql.Char(16), guid)
      .input('porcentaje', sql.Decimal(5, 2), porcentaje)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO ConfiguracionDescuento (GUID, MaxDescuentoPorcentaje, ts, sts)
        VALUES (@guid, @porcentaje, @ts, @sts)
      `);
  }
  return { ok: true, porcentaje };
}

module.exports = { GetMaxDescuento, SetMaxDescuento };
