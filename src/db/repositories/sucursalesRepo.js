const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

async function GetAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, GUIDCONFIGURACION, CODIGOSUCURSAL, NOMBRE, CUIT, PUNTOVENTA, COTIZACIONDOLAR, EMAIL, CELULAR
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

async function GetConfiguraciones() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, CODIGO_CONFIGURACION, NOMBREEMPRESA, CUIT
    FROM Configuracion
    WHERE (dts IS NULL OR dts = 0)
    ORDER BY NOMBREEMPRESA
  `);
  return result.recordset;
}

async function Create({ nombre, cuit, puntoventa, cotizaciondolar, email, celular, guidconfiguracion }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(CODIGOSUCURSAL), 0) + 1 AS Next FROM Sucursales`);
  const codigoSucursal = idResult.recordset[0].Next;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('codigoSucursal', sql.Int, codigoSucursal)
    .input('nombre', sql.VarChar(255), nombre)
    .input('cuit', sql.Char(13), cuit || '')
    .input('puntoventa', sql.SmallInt, puntoventa || 0)
    .input('cotizaciondolar', sql.Decimal(13, 2), cotizaciondolar || 0)
    .input('email', sql.VarChar(255), email || '')
    .input('celular', sql.Char(20), celular || '')
    .input('guidconfiguracion', sql.Char(16), guidconfiguracion || '')
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO Sucursales (GUID, CODIGOSUCURSAL, NOMBRE, CUIT, PUNTOVENTA, COTIZACIONDOLAR, EMAIL, CELULAR, GUIDCONFIGURACION, ts, sts)
      VALUES (@guid, @codigoSucursal, @nombre, @cuit, @puntoventa, @cotizaciondolar, @email, @celular, @guidconfiguracion, @ts, @sts)
    `);
  return { guid, codigoSucursal };
}

async function Update(guid, { nombre, cuit, puntoventa, cotizaciondolar, email, celular, guidconfiguracion }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('nombre', sql.VarChar(255), nombre)
    .input('cuit', sql.Char(13), cuit || '')
    .input('puntoventa', sql.SmallInt, puntoventa || 0)
    .input('cotizaciondolar', sql.Decimal(13, 2), cotizaciondolar || 0)
    .input('email', sql.VarChar(255), email || '')
    .input('celular', sql.Char(20), celular || '')
    .input('guidconfiguracion', sql.Char(16), guidconfiguracion || '')
    .input('ts', sql.Float, ts)
    .query(`
      UPDATE Sucursales SET
        NOMBRE = @nombre, CUIT = @cuit, PUNTOVENTA = @puntoventa,
        COTIZACIONDOLAR = @cotizaciondolar, EMAIL = @email, CELULAR = @celular,
        GUIDCONFIGURACION = @guidconfiguracion, ts = @ts
      WHERE GUID = @guid AND (dts IS NULL OR dts = 0)
    `);
  return { ok: true };
}

async function Delete(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE Sucursales SET dts = @dts WHERE GUID = @guid`);
  return { ok: true };
}

module.exports = { GetAll, GetByGuid, GetConfiguraciones, Create, Update, Delete };
