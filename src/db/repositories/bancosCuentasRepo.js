const { getPool, sql } = require('../pool');
const { newGuid } = require('../../utils/guidHelper');

async function GetAll(guidBanco) {
  const pool = await getPool();
  let query = `
    SELECT bc.GUID, bc.ID, bc.GUIDBANCOS, bc.GUIDTIPOCUENTABANCO, bc.TIPOCUENTA,
           bc.NUMEROCUENTA, bc.CBU, bc.ALIAS, bc.DIRECCION, bc.SUCURSAL,
           bc.FECHAAPERTURA, bc.FECHACIERRE, bc.SALDOINICIAL, bc.SALDO, bc.TITULAR,
           b.BANCO AS NombreBanco
    FROM BancosCuentas bc
    LEFT JOIN Bancos b ON bc.GUIDBANCOS = b.GUID AND (b.dts IS NULL OR b.dts = 0)
  `;
  const request = pool.request();
  if (guidBanco) {
    query += ` WHERE bc.GUIDBANCOS = @guidBanco`;
    request.input('guidBanco', sql.Char(16), guidBanco);
  }
  query += ` ORDER BY bc.NUMEROCUENTA`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`
      SELECT bc.*, b.BANCO AS NombreBanco
      FROM BancosCuentas bc
      LEFT JOIN Bancos b ON bc.GUIDBANCOS = b.GUID AND (b.dts IS NULL OR b.dts = 0)
      WHERE bc.GUID = @guid
    `);
  return result.recordset[0] || null;
}

async function Create({ guidBanco, guidTipoCuentaBanco, tipoCuenta, numeroCuenta, cbu, alias, direccion, sucursal, fechaApertura, fechaCierre, saldoInicial, titular, guidConfiguracion }) {
  const pool = await getPool();
  const guid = newGuid();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(ID), 0) + 1 AS NextId FROM BancosCuentas`);
  const id = idResult.recordset[0].NextId;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('id', sql.Int, id)
    .input('guidBanco', sql.Char(16), guidBanco || '')
    .input('guidTipoCuentaBanco', sql.Char(16), guidTipoCuentaBanco || '')
    .input('tipoCuenta', sql.VarChar(255), tipoCuenta || null)
    .input('numeroCuenta', sql.VarChar(255), numeroCuenta || null)
    .input('cbu', sql.VarChar(22), cbu || null)
    .input('alias', sql.VarChar(255), alias || null)
    .input('direccion', sql.VarChar(255), direccion || null)
    .input('sucursal', sql.VarChar(255), sucursal || null)
    .input('fechaApertura', sql.Date, fechaApertura || null)
    .input('fechaCierre', sql.Date, fechaCierre || null)
    .input('saldoInicial', sql.Int, saldoInicial || 0)
    .input('titular', sql.VarChar(255), titular || null)
    .input('guidConfiguracion', sql.Char(16), guidConfiguracion || null)
    .query(`
      INSERT INTO BancosCuentas (GUID, ID, GUIDBANCOS, GUIDTIPOCUENTABANCO, TIPOCUENTA, NUMEROCUENTA,
                                  CBU, ALIAS, DIRECCION, SUCURSAL, FECHAAPERTURA, FECHACIERRE,
                                  SALDOINICIAL, SALDO, TITULAR, GUIDCONFIGURACION)
      VALUES (@guid, @id, @guidBanco, @guidTipoCuentaBanco, @tipoCuenta, @numeroCuenta,
              @cbu, @alias, @direccion, @sucursal, @fechaApertura, @fechaCierre,
              @saldoInicial, @saldoInicial, @titular, @guidConfiguracion)
    `);
  return { guid, id };
}

async function Update(guid, { guidBanco, guidTipoCuentaBanco, tipoCuenta, numeroCuenta, cbu, alias, direccion, sucursal, fechaApertura, fechaCierre, titular, guidConfiguracion }) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('guidBanco', sql.Char(16), guidBanco || '')
    .input('guidTipoCuentaBanco', sql.Char(16), guidTipoCuentaBanco || '')
    .input('tipoCuenta', sql.VarChar(255), tipoCuenta || null)
    .input('numeroCuenta', sql.VarChar(255), numeroCuenta || null)
    .input('cbu', sql.VarChar(22), cbu || null)
    .input('alias', sql.VarChar(255), alias || null)
    .input('direccion', sql.VarChar(255), direccion || null)
    .input('sucursal', sql.VarChar(255), sucursal || null)
    .input('fechaApertura', sql.Date, fechaApertura || null)
    .input('fechaCierre', sql.Date, fechaCierre || null)
    .input('titular', sql.VarChar(255), titular || null)
    .input('guidConfiguracion', sql.Char(16), guidConfiguracion || null)
    .query(`
      UPDATE BancosCuentas
      SET GUIDBANCOS = @guidBanco, GUIDTIPOCUENTABANCO = @guidTipoCuentaBanco, TIPOCUENTA = @tipoCuenta,
          NUMEROCUENTA = @numeroCuenta, CBU = @cbu, ALIAS = @alias, DIRECCION = @direccion,
          SUCURSAL = @sucursal, FECHAAPERTURA = @fechaApertura, FECHACIERRE = @fechaCierre,
          TITULAR = @titular, GUIDCONFIGURACION = @guidConfiguracion
      WHERE GUID = @guid
    `);
}

async function Delete(guid) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`DELETE FROM BancosCuentas WHERE GUID = @guid`);
}

module.exports = { GetAll, GetByGuid, Create, Update, Delete };
