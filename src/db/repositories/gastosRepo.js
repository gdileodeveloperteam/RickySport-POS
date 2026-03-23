const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToClarion } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

// Create a gasto (expense) - inserts into CajaGastos + CajaDiaria
async function CreateGasto({ guidSucursal, rubro, descripcion, importe, medioPago, guidProveedores, guidBancosCuentas, guidBanco, guidUsuario }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const guidGasto = newGuid();
    const guidCaja = newGuid();
    const fecha = dateToClarion();

    // 1. CajaGastos
    await tx.request()
      .input('guid', sql.Char(16), guidGasto)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidBancos', sql.Char(16), guidBanco || EMPTY_GUID)
      .input('guidImputacion', sql.Char(16), EMPTY_GUID)
      .input('guidProveedores', sql.Char(16), guidProveedores || EMPTY_GUID)
      .input('guidMovProv', sql.Char(16), EMPTY_GUID)
      .input('guidMovBancos', sql.Char(16), EMPTY_GUID)
      .input('guidMovAdelantos', sql.Char(16), EMPTY_GUID)
      .input('fecha', sql.Decimal(7), fecha)
      .input('rubro', sql.Char(40), rubro)
      .input('descripcion', sql.Char(60), descripcion)
      .input('debe', sql.Decimal(13, 3), importe)
      .input('tipoComprobante', sql.Char(20), 'GASTO')
      .input('guidBancosCuentas', sql.Char(16), guidBancosCuentas || EMPTY_GUID)
      .input('guidCajaDiaria', sql.Char(16), guidCaja)
      .input('guidUsuario', sql.Char(16), guidUsuario || EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO CajaGastos (GUID, GUIDSUCURSALES, GUIDBANCOS, GUIDIMPUTACION,
          GUIDPROVEEDORES, GUIDMOVIMIENTOPROVEEDORES, GUIDMOVIMIENTOBANCOS, GUIDMOVIMIENTOADELANTOS,
          FECHA, RUBRO, DESCRIPCION, DEBE, TIPO_COMPROBANTE,
          GUIDBANCOSCUENTAS, GUIDCAJADIARIA, GUIDUSUARIOS, ts, sts)
        VALUES (@guid, @guidSucursal, @guidBancos, @guidImputacion,
          @guidProveedores, @guidMovProv, @guidMovBancos, @guidMovAdelantos,
          @fecha, @rubro, @descripcion, @debe, @tipoComprobante,
          @guidBancosCuentas, @guidCajaDiaria, @guidUsuario, @ts, @sts)
      `);

    // 2. CajaDiaria
    await tx.request()
      .input('guid', sql.Char(16), guidCaja)
      .input('fecha', sql.Date, new Date())
      .input('tipoComprobante', sql.VarChar(40), medioPago || 'EFECTIVO')
      .input('descripcion', sql.Char(60), `Gasto - ${rubro} - ${descripcion}`.substring(0, 60))
      .input('debe', sql.Decimal(13, 2), 0)
      .input('haber', sql.Decimal(13, 2), importe)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidBanco', sql.Char(16), guidBanco || EMPTY_GUID)
      .input('guidBancosCuentas', sql.Char(16), guidBancosCuentas || EMPTY_GUID)
      .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
      .input('guidCajaGastos', sql.Char(16), guidGasto)
      .input('guidCliente', sql.Char(16), EMPTY_GUID)
      .input('guidProveedor', sql.Char(16), guidProveedores || EMPTY_GUID)
      .input('guidEmpleado', sql.Char(16), EMPTY_GUID)
      .input('guidUsuario', sql.Char(16), guidUsuario || EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO CajaDiaria (GUID, FECHA, TIPOCOMPROBANTE, DESCRIPCION, DEBE, HABER,
          GUIDSUCURSALES, GUIDBANCOS, GUIDBANCOSCUENTAS, GUIDFORMAPAGOS, GUIDCAJAGASTOS,
          GUIDCLIENTES, GUIDPROVEEDORES, GUIDEMPLEADOS, GUIDUSUARIOS, ts, sts)
        VALUES (@guid, @fecha, @tipoComprobante, @descripcion, @debe, @haber,
          @guidSucursal, @guidBanco, @guidBancosCuentas, @guidFormaPago, @guidCajaGastos,
          @guidCliente, @guidProveedor, @guidEmpleado, @guidUsuario, @ts, @sts)
      `);

    await tx.commit();
    return { guidGasto, importe };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// Create adelanto (cash withdrawal for employee) - inserts into MovimientoAdelantos + CajaGastos + CajaDiaria + Recibos
async function CreateAdelanto({ guidSucursal, guidEmpleado, importe, observaciones, mesImputacion, medioPago, guidBancosCuentas, guidBanco, guidUsuario }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const guidAdelanto = newGuid();
    const guidGasto = newGuid();
    const guidCaja = newGuid();
    const guidRecibo = newGuid();
    const fecha = dateToClarion();

    // 1. MovimientoAdelantos
    await tx.request()
      .input('guid', sql.Char(16), guidAdelanto)
      .input('guidEmpleado', sql.Char(16), guidEmpleado)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidCajaGastos', sql.Char(16), guidGasto)
      .input('fecha', sql.Date, new Date())
      .input('debe', sql.Decimal(13, 3), importe)
      .input('haber', sql.Decimal(13, 3), 0)
      .input('saldo', sql.Decimal(13, 3), importe)
      .input('observaciones', sql.VarChar(255), observaciones || '')
      .input('mesImputacion', sql.VarChar(7), mesImputacion || '')
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO MovimientoAdelantos (Guid, GuidEmpleados, GuidSucursales, GuidCajaGastos,
          Fecha, Debe, Haber, Saldo, Observaciones, MesImputacion, ts, sts)
        VALUES (@guid, @guidEmpleado, @guidSucursal, @guidCajaGastos,
          @fecha, @debe, @haber, @saldo, @observaciones, @mesImputacion, @ts, @sts)
      `);

    // 2. CajaGastos
    await tx.request()
      .input('guid', sql.Char(16), guidGasto)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidBancos', sql.Char(16), guidBanco || EMPTY_GUID)
      .input('guidImputacion', sql.Char(16), EMPTY_GUID)
      .input('guidProveedores', sql.Char(16), EMPTY_GUID)
      .input('guidMovProv', sql.Char(16), EMPTY_GUID)
      .input('guidMovBancos', sql.Char(16), EMPTY_GUID)
      .input('guidMovAdelantos', sql.Char(16), guidAdelanto)
      .input('fecha', sql.Decimal(7), fecha)
      .input('rubro', sql.Char(40), 'ADELANTO')
      .input('descripcion', sql.Char(60), (observaciones || 'Retiro de efectivo').substring(0, 60))
      .input('debe', sql.Decimal(13, 3), importe)
      .input('tipoComprobante', sql.Char(20), 'ADELANTO')
      .input('guidBancosCuentas', sql.Char(16), guidBancosCuentas || EMPTY_GUID)
      .input('guidCajaDiaria', sql.Char(16), guidCaja)
      .input('guidUsuario', sql.Char(16), guidUsuario || EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO CajaGastos (GUID, GUIDSUCURSALES, GUIDBANCOS, GUIDIMPUTACION,
          GUIDPROVEEDORES, GUIDMOVIMIENTOPROVEEDORES, GUIDMOVIMIENTOBANCOS, GUIDMOVIMIENTOADELANTOS,
          FECHA, RUBRO, DESCRIPCION, DEBE, TIPO_COMPROBANTE,
          GUIDBANCOSCUENTAS, GUIDCAJADIARIA, GUIDUSUARIOS, ts, sts)
        VALUES (@guid, @guidSucursal, @guidBancos, @guidImputacion,
          @guidProveedores, @guidMovProv, @guidMovBancos, @guidMovAdelantos,
          @fecha, @rubro, @descripcion, @debe, @tipoComprobante,
          @guidBancosCuentas, @guidCajaDiaria, @guidUsuario, @ts, @sts)
      `);

    // 3. CajaDiaria
    await tx.request()
      .input('guid', sql.Char(16), guidCaja)
      .input('fecha', sql.Date, new Date())
      .input('tipoComprobante', sql.VarChar(40), medioPago || 'EFECTIVO')
      .input('descripcion', sql.Char(60), `Adelanto - ${observaciones || 'Retiro de efectivo'}`.substring(0, 60))
      .input('debe', sql.Decimal(13, 2), 0)
      .input('haber', sql.Decimal(13, 2), importe)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidBanco', sql.Char(16), guidBanco || EMPTY_GUID)
      .input('guidBancosCuentas', sql.Char(16), guidBancosCuentas || EMPTY_GUID)
      .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
      .input('guidCajaGastos', sql.Char(16), guidGasto)
      .input('guidCliente', sql.Char(16), EMPTY_GUID)
      .input('guidProveedor', sql.Char(16), EMPTY_GUID)
      .input('guidEmpleado', sql.Char(16), guidEmpleado)
      .input('guidUsuario', sql.Char(16), guidUsuario || EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO CajaDiaria (GUID, FECHA, TIPOCOMPROBANTE, DESCRIPCION, DEBE, HABER,
          GUIDSUCURSALES, GUIDBANCOS, GUIDBANCOSCUENTAS, GUIDFORMAPAGOS, GUIDCAJAGASTOS,
          GUIDCLIENTES, GUIDPROVEEDORES, GUIDEMPLEADOS, GUIDUSUARIOS, ts, sts)
        VALUES (@guid, @fecha, @tipoComprobante, @descripcion, @debe, @haber,
          @guidSucursal, @guidBanco, @guidBancosCuentas, @guidFormaPago, @guidCajaGastos,
          @guidCliente, @guidProveedor, @guidEmpleado, @guidUsuario, @ts, @sts)
      `);

    // 4. Recibo — ADELANTO DE SUELDOS
    const idResult = await tx.request().query(`SELECT ISNULL(MAX(ID), 0) + 1 AS NextId FROM Recibos`);
    const reciboId = idResult.recordset[0].NextId;

    await tx.request()
      .input('guid', sql.Char(16), guidRecibo)
      .input('id', sql.Int, reciboId)
      .input('guidProveedores', sql.Char(16), EMPTY_GUID)
      .input('guidOrdenesDePago', sql.Char(16), EMPTY_GUID)
      .input('tipoRecibo', sql.Char(20), 'ADELANTO DE SUELDOS')
      .input('fechaCreacion', sql.Date, new Date())
      .input('importeComprobante', sql.Decimal(13, 2), importe)
      .input('descuentoComprobante', sql.Decimal(13, 2), 0)
      .input('subtotalComprobante', sql.Decimal(13, 2), importe)
      .input('totalRecibo', sql.Decimal(13, 2), importe)
      .input('guidCajaGastos', sql.Char(16), guidGasto)
      .input('guidCajaDiaria', sql.Char(16), guidCaja)
      .input('guidUsuario', sql.Char(16), guidUsuario || EMPTY_GUID)
      .input('guidEmpleado', sql.Char(16), guidEmpleado)
      .query(`
        INSERT INTO Recibos (GUID, ID, GUIDPROVEEDORES, GUIDORDENESDEPAGO, TIPORECIBO,
          FECHACREACIONRECIBO, IMPORTECOMPROBANTE, DESCUENTOCOMPROBANTE, SUBTOTALCOMPROBANTE,
          TOTALRECIBO, GUIDCAJAGASTOS, GUIDCAJADIARIA, GUIDUSUARIOS, GUIDEMPLEADOS)
        VALUES (@guid, @id, @guidProveedores, @guidOrdenesDePago, @tipoRecibo,
          @fechaCreacion, @importeComprobante, @descuentoComprobante, @subtotalComprobante,
          @totalRecibo, @guidCajaGastos, @guidCajaDiaria, @guidUsuario, @guidEmpleado)
      `);

    await tx.commit();
    return { guidAdelanto, guidGasto, guidRecibo, importe };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// Get gastos list
async function GetGastos({ desde, hasta, guidSucursal }) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(cg.dts IS NULL OR cg.dts = 0)';

  if (desde) {
    request.input('desde', sql.Decimal(7), dateToClarion(desde));
    where += ' AND cg.FECHA >= @desde';
  }
  if (hasta) {
    request.input('hasta', sql.Decimal(7), dateToClarion(hasta));
    where += ' AND cg.FECHA <= @hasta';
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ' AND cg.GUIDSUCURSALES = @guidSuc';
  }

  const result = await request.query(`
    SELECT cg.GUID, cg.FECHA, cg.RUBRO, cg.DESCRIPCION, cg.DEBE,
           cg.TIPO_COMPROBANTE, cg.GUIDSUCURSALES, cg.GUIDMOVIMIENTOADELANTOS,
           s.NOMBRE AS Sucursal,
           e.NOMBRE AS Empleado
    FROM CajaGastos cg
    LEFT JOIN Sucursales s ON s.GUID = cg.GUIDSUCURSALES
    LEFT JOIN MovimientoAdelantos ma ON ma.Guid = cg.GUIDMOVIMIENTOADELANTOS AND (ma.dts IS NULL OR ma.dts = 0)
    LEFT JOIN Empleados e ON e.GUID = ma.GuidEmpleados AND (e.dts IS NULL OR e.dts = 0)
    WHERE ${where}
    ORDER BY cg.FECHA DESC
  `);
  return result.recordset;
}

module.exports = { CreateGasto, CreateAdelanto, GetGastos };
