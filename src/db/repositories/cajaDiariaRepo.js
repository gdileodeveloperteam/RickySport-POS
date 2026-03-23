const { getPool, sql } = require('../pool');

async function GetCajaDiaria({ desde, hasta, guidSucursal, guidUsuario }) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(cd.dts IS NULL OR cd.dts = 0)';

  if (desde) {
    request.input('desde', sql.Date, new Date(desde));
    where += ' AND cd.FECHA >= @desde';
  }
  if (hasta) {
    request.input('hasta', sql.Date, new Date(hasta));
    where += ' AND cd.FECHA <= @hasta';
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ' AND cd.GUIDSUCURSALES = @guidSuc';
  }
  if (guidUsuario) {
    request.input('guidUsr', sql.Char(16), guidUsuario);
    where += ' AND cd.GUIDUSUARIOS = @guidUsr';
  }

  const result = await request.query(`
    SELECT cd.GUID, cd.FECHA, cd.TIPOCOMPROBANTE, cd.DESCRIPCION,
           cd.DEBE, cd.HABER,
           cd.GUIDSUCURSALES, cd.GUIDCLIENTES, cd.GUIDPROVEEDORES,
           cd.GUIDEMPLEADOS, cd.GUIDCAJAGASTOS, cd.GUIDFORMAPAGOS,
           cd.GUIDBANCOSCUENTAS, cd.GUIDUSUARIOS,
           s.NOMBRE  AS Sucursal,
           c.NOMBRE  AS Cliente,
           p.NOMBRE  AS Proveedor,
           e.NOMBRE  AS Empleado,
           bc.NUMEROCUENTA AS CuentaBancaria,
           bc.TIPOCUENTA   AS TipoCuenta,
           u.NOMBRE  AS Usuario
    FROM CajaDiaria cd
    LEFT JOIN Sucursales     s  ON s.GUID  = cd.GUIDSUCURSALES
    LEFT JOIN Clientes       c  ON c.GUID  = cd.GUIDCLIENTES    AND RTRIM(cd.GUIDCLIENTES)    <> ''
    LEFT JOIN Proveedores    p  ON p.GUID  = cd.GUIDPROVEEDORES AND RTRIM(cd.GUIDPROVEEDORES) <> ''
    LEFT JOIN Empleados      e  ON e.GUID  = cd.GUIDEMPLEADOS   AND RTRIM(cd.GUIDEMPLEADOS)   <> ''
    LEFT JOIN BancosCuentas  bc ON bc.GUID = cd.GUIDBANCOSCUENTAS AND RTRIM(cd.GUIDBANCOSCUENTAS) <> ''
    LEFT JOIN Usuarios       u  ON u.GUID  = cd.GUIDUSUARIOS    AND RTRIM(cd.GUIDUSUARIOS)    <> ''
    WHERE ${where}
    ORDER BY cd.FECHA DESC, cd.ts DESC
  `);
  return result.recordset;
}

async function GetCajaDiariaResumen({ desde, hasta, guidSucursal, guidUsuario }) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(cd.dts IS NULL OR cd.dts = 0)';

  if (desde) {
    request.input('desde', sql.Date, new Date(desde));
    where += ' AND cd.FECHA >= @desde';
  }
  if (hasta) {
    request.input('hasta', sql.Date, new Date(hasta));
    where += ' AND cd.FECHA <= @hasta';
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ' AND cd.GUIDSUCURSALES = @guidSuc';
  }
  if (guidUsuario) {
    request.input('guidUsr', sql.Char(16), guidUsuario);
    where += ' AND cd.GUIDUSUARIOS = @guidUsr';
  }

  const result = await request.query(`
    SELECT
      RTRIM(cd.TIPOCOMPROBANTE) AS Categoria,
      COUNT(*)                  AS Cantidad,
      SUM(cd.DEBE)              AS TotalDebe,
      SUM(cd.HABER)             AS TotalHaber
    FROM CajaDiaria cd
    WHERE ${where}
    GROUP BY RTRIM(cd.TIPOCOMPROBANTE)
    ORDER BY Categoria
  `);
  return result.recordset;
}

module.exports = { GetCajaDiaria, GetCajaDiariaResumen };
