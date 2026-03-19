const { getPool, sql } = require('../pool');

async function GetAll(search) {
  const pool = await getPool();
  let query = `
    SELECT a.GUID, a.CODIGOARTICULO, a.CODIGOARTICULOREL, a.DESCRIPCION, a.PRECIOCOSTO, a.PRECIOVENTA,
           a.TALLEDESDE, a.TALLEHASTA, a.COLOR, a.UTILIDAD, a.TIPO,
           a.GUIDGRUPOS, a.GUIDPROVEEDORES, a.CostoDolar, a.VentaDolar
    FROM Articulos a
    WHERE (a.dts IS NULL OR a.dts = 0)
  `;
  const request = pool.request();
  if (search) {
    query += ` AND (a.CODIGOARTICULOREL LIKE @search OR a.DESCRIPCION LIKE @search)`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  query += ` ORDER BY a.DESCRIPCION`;
  if (search) query += ` OFFSET 0 ROWS FETCH NEXT 30 ROWS ONLY`;
  const result = await request.query(query);
  return result.recordset;
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM Articulos WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

async function GetByCodigo(codigo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('codigo', sql.VarChar, codigo)
    .query(`
      SELECT a.GUID, a.CODIGOARTICULO, a.CODIGOARTICULOREL, a.DESCRIPCION, a.PRECIOCOSTO, a.PRECIOVENTA,
             a.TALLEDESDE, a.TALLEHASTA, a.COLOR, a.UTILIDAD, a.TIPO,
             a.GUIDGRUPOS, a.GUIDPROVEEDORES
      FROM Articulos a
      WHERE a.CODIGOARTICULOREL = @codigo
        AND (a.dts IS NULL OR a.dts = 0)
    `);
  return result.recordset[0] || null;
}

async function GetMovimientoArticulos(guidArticulo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guidArticulo', sql.Char(16), guidArticulo)
    .query(`
      SELECT GUID, GUIDARTICULOS, CODIGOARTICULO, NUMERO, COLOR
      FROM MovimientoArticulos
      WHERE GUIDARTICULOS = @guidArticulo
      ORDER BY NUMERO
    `);
  return result.recordset;
}

module.exports = { GetAll, GetByGuid, GetByCodigo, GetMovimientoArticulos };
