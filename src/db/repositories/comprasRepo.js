const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToClarion, dateToInt, timeToInt } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

async function CreateCompra({ guidProveedor, nombreProveedor, guidSucursal, items, observaciones }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const fecha = dateToClarion();
    const guidCompra = newGuid();

    let totalCompra = 0;
    for (const item of items) {
      totalCompra += item.cantidad * item.precioUnitario;
    }

    // 1. RemitosCompras header
    await tx.request()
      .input('guid', sql.Char(16), guidCompra)
      .input('guidConfig', sql.Char(16), EMPTY_GUID)
      .input('guidProveedor', sql.Char(16), guidProveedor || EMPTY_GUID)
      .input('guidImputacion', sql.Char(16), EMPTY_GUID)
      .input('guidFacturaCompra', sql.Char(16), EMPTY_GUID)
      .input('guidVendedor', sql.Char(16), EMPTY_GUID)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('nombre', sql.VarChar(255), nombreProveedor || '')
      .input('total', sql.Decimal(13, 3), totalCompra)
      .input('fecha', sql.Int, fecha)
      .input('fechaCarga', sql.Date, new Date())
      .input('observaciones', sql.VarChar(1998), observaciones || '')
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO RemitosCompras (GUID, GUIDCONFIGURACION, GUIDPROVEEDORES, GUIDIMPUTACIONES,
          GUIDFACTURASCOMPRAS, GUIDVENDEDORES, GUIDSUCURSALES,
          CODIGOCOMPROBANTEAFIP, NOMBRE, REMITONUMERO, PUNTOVENTA, NUMERO,
          TIPOCOMPROBANTE, LETRA, TOTAL, FECHA, FECHACARGA, OBSERVACIONES,
          PAGADA, TIPO, ts, sts)
        VALUES (@guid, @guidConfig, @guidProveedor, @guidImputacion,
          @guidFacturaCompra, @guidVendedor, @guidSucursal,
          0, @nombre, '', 0, 0,
          'REM', 'X', @total, @fecha, @fechaCarga, @observaciones,
          0, 'COM', @ts, @sts)
      `);

    // 2. Items + Stock INGRESO
    for (const item of items) {
      const guidMov = newGuid();
      const subtotal = item.cantidad * item.precioUnitario;

      // MovimientoRemitos (items de la compra)
      await tx.request()
        .input('guid', sql.Char(16), guidMov)
        .input('articulo', sql.VarChar(255), item.codigoArticulo)
        .input('descripcion', sql.VarChar(1024), item.descripcion || '')
        .input('numero', sql.Decimal(5, 1), item.talle || 0)
        .input('cantidad', sql.Decimal(7, 2), item.cantidad)
        .input('neto', sql.Decimal(11, 2), item.precioUnitario)
        .input('subtotal', sql.Decimal(11, 2), subtotal)
        .input('total', sql.Decimal(11, 2), subtotal)
        .input('costo', sql.Decimal(13, 2), item.precioUnitario)
        .input('tipoOp', sql.VarChar(30), 'COMPRA')
        .input('guidCliente', sql.Char(16), EMPTY_GUID)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoCambio', sql.Char(16), EMPTY_GUID)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(16), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucursal', sql.Char(16), guidSucursal)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoRemitos (GUID, ARTICULO, DESCRIPCION, NUMERO, CANTIDAD,
            NETO, SUBTOTAL, TOTAL, COSTO, TIPOOPERACION,
            GUIDCLIENTES, GUIDREMITOS, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS,
            GUIDARTICULOS, GUIDMOVIMIENTOARTICULOS, GUIDSUCURSALES,
            ts, sts)
          VALUES (@guid, @articulo, @descripcion, @numero, @cantidad,
            @neto, @subtotal, @total, @costo, @tipoOp,
            @guidCliente, @guidRemito, @guidRemitoDev, @guidRemitoCambio,
            @guidArticulo, @guidMovArt, @guidSucursal,
            @ts, @sts)
        `);

      // MovimientoStock - INGRESO
      const guidStock = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidStock)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCompras', sql.Char(16), guidCompra)
        .input('guidRemitosTransf', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCambios', sql.Char(16), EMPTY_GUID)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(20), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucOrigen', sql.Char(16), EMPTY_GUID)
        .input('guidSucDestino', sql.Char(16), guidSucursal)
        .input('codigoArt', sql.VarChar(255), item.codigoArticulo)
        .input('numero', sql.Decimal(13, 2), item.talle || 0)
        .input('color', sql.VarChar(255), item.color || '')
        .input('ingreso', sql.Float, item.cantidad)
        .input('egreso', sql.Float, 0)
        .input('estado', sql.VarChar(20), item.estado || 'NUEVO')
        .input('fecha', sql.Date, new Date())
        .input('tipo', sql.VarChar(20), 'COMPRA')
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoStock (GUID, GUIDREMITOS, GUIDREMITOSCOMPRAS,
            GUIDREMITOSTRANSFERENCIAS, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS,
            GUIDARTICULOS, GUIDMOVIMIENTOARTICULOS, GUIDSUCURSALORIGEN, GUIDSUCURSALDESTINO,
            CODIGOARTICULO, NUMERO, COLOR, INGRESO, EGRESO, ESTADO, FECHA, TIPO, ts, sts)
          VALUES (@guid, @guidRemito, @guidRemitosCompras,
            @guidRemitosTransf, @guidRemitosDev, @guidRemitosCambios,
            @guidArticulo, @guidMovArt, @guidSucOrigen, @guidSucDestino,
            @codigoArt, @numero, @color, @ingreso, @egreso, @estado, @fecha, @tipo, @ts, @sts)
        `);
    }

    await tx.commit();
    return { guidCompra, total: totalCompra, cantidadItems: items.length };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

async function GetCompras({ desde, hasta, guidSucursal }) {
  const pool = await getPool();
  const request = pool.request();
  let where = '(rc.dts IS NULL OR rc.dts = 0)';

  if (desde) {
    request.input('desde', sql.Int, dateToClarion(desde));
    where += ' AND rc.FECHA >= @desde';
  }
  if (hasta) {
    request.input('hasta', sql.Int, dateToClarion(hasta));
    where += ' AND rc.FECHA <= @hasta';
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ' AND rc.GUIDSUCURSALES = @guidSuc';
  }

  const result = await request.query(`
    SELECT rc.GUID, rc.FECHA, rc.NOMBRE, rc.TOTAL, rc.OBSERVACIONES,
           rc.GUIDSUCURSALES, s.NOMBRE AS Sucursal,
           p.NOMBRE AS Proveedor
    FROM RemitosCompras rc
    LEFT JOIN Sucursales s ON s.GUID = rc.GUIDSUCURSALES
    LEFT JOIN Proveedores p ON p.GUID = rc.GUIDPROVEEDORES
    WHERE ${where}
    ORDER BY rc.FECHA DESC
  `);
  return result.recordset;
}

async function GetCompraDetalle(guid) {
  const pool = await getPool();
  const items = await pool.request()
    .input('guidCompra', sql.Char(16), guid)
    .query(`
      SELECT ms.CODIGOARTICULO, ms.NUMERO, ms.COLOR, ms.INGRESO,
             a.DESCRIPCION
      FROM MovimientoStock ms
      LEFT JOIN Articulos a ON a.GUID = ms.GUIDARTICULOS
      WHERE ms.GUIDREMITOSCOMPRAS = @guidCompra
        AND ms.INGRESO > 0
        AND (ms.dts IS NULL OR ms.dts = 0)
    `);

  const header = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query('SELECT * FROM RemitosCompras WHERE GUID = @guid');

  return {
    compra: header.recordset[0] || null,
    items: items.recordset,
  };
}

module.exports = { CreateCompra, GetCompras, GetCompraDetalle };
