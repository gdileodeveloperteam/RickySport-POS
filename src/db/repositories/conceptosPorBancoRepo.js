const { getPool, sql } = require('../pool');
const { newGuid } = require('../../utils/guidHelper');

async function GetAll(guidBanco) {
  const pool = await getPool();
  let query = `
    SELECT cpb.GUID, cpb.ID, cpb.GUIDBANCOS, cpb.GUIDCONCEPTOBANCO,
           cpb.CODIGOCONCEPTOSEGUNBANCO, cpb.DESCRIPCIONSEGUNBANCO,
           b.NOMBRE AS NombreBanco, bc.DESCRIPCION AS ConceptoDescripcion
    FROM ConceptosPorBanco cpb
    LEFT JOIN Bancos b ON cpb.GUIDBANCOS = b.GUID AND (b.dts IS NULL OR b.dts = 0)
    LEFT JOIN BancosConceptos bc ON cpb.GUIDCONCEPTOBANCO = bc.GUID
  `;
  const request = pool.request();
  if (guidBanco) {
    query += ` WHERE cpb.GUIDBANCOS = @guidBanco`;
    request.input('guidBanco', sql.Char(16), guidBanco);
  }
  query += ` ORDER BY b.NOMBRE, bc.DESCRIPCION`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`
      SELECT cpb.*, b.NOMBRE AS NombreBanco, bc.DESCRIPCION AS ConceptoDescripcion
      FROM ConceptosPorBanco cpb
      LEFT JOIN Bancos b ON cpb.GUIDBANCOS = b.GUID AND (b.dts IS NULL OR b.dts = 0)
      LEFT JOIN BancosConceptos bc ON cpb.GUIDCONCEPTOBANCO = bc.GUID
      WHERE cpb.GUID = @guid
    `);
  return result.recordset[0] || null;
}

async function Create({ guidBanco, guidConceptoBanco, codigoConceptoSegunBanco, descripcionSegunBanco }) {
  const pool = await getPool();
  const guid = newGuid();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(ID), 0) + 1 AS NextId FROM ConceptosPorBanco`);
  const id = idResult.recordset[0].NextId;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('id', sql.Int, id)
    .input('guidBanco', sql.Char(16), guidBanco)
    .input('guidConceptoBanco', sql.Char(16), guidConceptoBanco)
    .input('codigoConceptoSegunBanco', sql.VarChar(255), codigoConceptoSegunBanco || null)
    .input('descripcionSegunBanco', sql.VarChar(255), descripcionSegunBanco || null)
    .query(`
      INSERT INTO ConceptosPorBanco (GUID, ID, GUIDBANCOS, GUIDCONCEPTOBANCO, CODIGOCONCEPTOSEGUNBANCO, DESCRIPCIONSEGUNBANCO)
      VALUES (@guid, @id, @guidBanco, @guidConceptoBanco, @codigoConceptoSegunBanco, @descripcionSegunBanco)
    `);
  return { guid, id };
}

async function Update(guid, { guidBanco, guidConceptoBanco, codigoConceptoSegunBanco, descripcionSegunBanco }) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('guidBanco', sql.Char(16), guidBanco)
    .input('guidConceptoBanco', sql.Char(16), guidConceptoBanco)
    .input('codigoConceptoSegunBanco', sql.VarChar(255), codigoConceptoSegunBanco || null)
    .input('descripcionSegunBanco', sql.VarChar(255), descripcionSegunBanco || null)
    .query(`
      UPDATE ConceptosPorBanco
      SET GUIDBANCOS = @guidBanco, GUIDCONCEPTOBANCO = @guidConceptoBanco,
          CODIGOCONCEPTOSEGUNBANCO = @codigoConceptoSegunBanco, DESCRIPCIONSEGUNBANCO = @descripcionSegunBanco
      WHERE GUID = @guid
    `);
}

async function Delete(guid) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`DELETE FROM ConceptosPorBanco WHERE GUID = @guid`);
}

module.exports = { GetAll, GetByGuid, Create, Update, Delete };
