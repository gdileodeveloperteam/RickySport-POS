const { getPool, sql } = require('../pool');

async function GetAll(search) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(dts IS NULL OR dts = 0)';
  if (search) {
    request.input('search', sql.VarChar(255), `%${search}%`);
    where += ' AND (NOMBRE LIKE @search OR DOCUMENTO LIKE @search OR CUIL LIKE @search)';
  }
  const result = await request.query(`
    SELECT GUID, NOMBRE, DOCUMENTO, CUIL, CELULAR, TAREA, ESTADO
    FROM Empleados WHERE ${where} ORDER BY NOMBRE
  `);
  return result.recordset;
}

async function GetAllConAdelantos(search, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(e.dts IS NULL OR e.dts = 0)';
  if (search) {
    request.input('search', sql.VarChar(255), `%${search}%`);
    where += ' AND (e.NOMBRE LIKE @search OR e.DOCUMENTO LIKE @search OR e.CUIL LIKE @search)';
  }
  let advWhere = '(ma.dts IS NULL OR ma.dts = 0)';
  if (desde) { request.input('desde', sql.Date, new Date(desde)); advWhere += ' AND ma.Fecha >= @desde'; }
  if (hasta) { request.input('hasta', sql.Date, new Date(hasta)); advWhere += ' AND ma.Fecha <= @hasta'; }

  const result = await request.query(`
    SELECT e.GUID, e.NOMBRE, e.DOCUMENTO, e.CUIL, e.CELULAR, e.TAREA, e.ESTADO,
           ISNULL(adv.CantAdelantos, 0) AS CantAdelantos,
           ISNULL(adv.TotalAdelantos, 0) AS TotalAdelantos
    FROM Empleados e
    LEFT JOIN (
      SELECT ma.GuidEmpleados, COUNT(*) AS CantAdelantos, SUM(ma.Debe) AS TotalAdelantos
      FROM MovimientoAdelantos ma
      WHERE ${advWhere}
      GROUP BY ma.GuidEmpleados
    ) adv ON adv.GuidEmpleados = e.GUID
    WHERE ${where}
    ORDER BY e.NOMBRE
  `);
  return result.recordset;
}

async function GetAdelantos(guidEmpleado, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  request.input('guidEmpleado', sql.Char(16), guidEmpleado);
  let where = 'ma.GuidEmpleados = @guidEmpleado AND (ma.dts IS NULL OR ma.dts = 0)';
  if (desde) { request.input('desde', sql.Date, new Date(desde)); where += ' AND ma.Fecha >= @desde'; }
  if (hasta) { request.input('hasta', sql.Date, new Date(hasta)); where += ' AND ma.Fecha <= @hasta'; }
  const result = await request.query(`
    SELECT ma.Guid, ma.Fecha, ma.Debe, ma.Haber, ma.Saldo, ma.Observaciones, ma.MesImputacion,
           RTRIM(s.NOMBRE) AS Sucursal
    FROM MovimientoAdelantos ma
    LEFT JOIN Sucursales s ON s.GUID = ma.GuidSucursales
    WHERE ${where}
    ORDER BY ma.Fecha DESC, ma.ts DESC
  `);
  return result.recordset;
}

module.exports = { GetAll, GetAllConAdelantos, GetAdelantos };
