const { getPool, sql } = require('../pool');
const { newGuid } = require('../../utils/guidHelper');

async function GetAll(search) {
  const pool = await getPool();
  let query = `
    SELECT GUID, ID, GUIDPLANCUENTAS, DESCRIPCION, TIPOCONCEPTO, GUIDCONFIGURACION
    FROM BancosConceptos
  `;
  const request = pool.request();
  if (search) {
    query += ` WHERE DESCRIPCION LIKE @search`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  query += ` ORDER BY DESCRIPCION`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM BancosConceptos WHERE GUID = @guid`);
  return result.recordset[0] || null;
}

async function Create({ descripcion, tipoConcepto, guidPlanCuentas, guidConfiguracion }) {
  const pool = await getPool();
  const guid = newGuid();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(ID), 0) + 1 AS NextId FROM BancosConceptos`);
  const id = idResult.recordset[0].NextId;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('id', sql.Int, id)
    .input('descripcion', sql.VarChar(254), descripcion)
    .input('tipoConcepto', sql.VarChar(20), tipoConcepto || null)
    .input('guidPlanCuentas', sql.Char(16), guidPlanCuentas || '')
    .input('guidConfiguracion', sql.Char(16), guidConfiguracion || null)
    .query(`
      INSERT INTO BancosConceptos (GUID, ID, DESCRIPCION, TIPOCONCEPTO, GUIDPLANCUENTAS, GUIDCONFIGURACION)
      VALUES (@guid, @id, @descripcion, @tipoConcepto, @guidPlanCuentas, @guidConfiguracion)
    `);
  return { guid, id };
}

async function Update(guid, { descripcion, tipoConcepto, guidPlanCuentas, guidConfiguracion }) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('descripcion', sql.VarChar(254), descripcion)
    .input('tipoConcepto', sql.VarChar(20), tipoConcepto || null)
    .input('guidPlanCuentas', sql.Char(16), guidPlanCuentas || '')
    .input('guidConfiguracion', sql.Char(16), guidConfiguracion || null)
    .query(`
      UPDATE BancosConceptos
      SET DESCRIPCION = @descripcion, TIPOCONCEPTO = @tipoConcepto,
          GUIDPLANCUENTAS = @guidPlanCuentas, GUIDCONFIGURACION = @guidConfiguracion
      WHERE GUID = @guid
    `);
}

async function Delete(guid) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`DELETE FROM BancosConceptos WHERE GUID = @guid`);
}

module.exports = { GetAll, GetByGuid, Create, Update, Delete };
