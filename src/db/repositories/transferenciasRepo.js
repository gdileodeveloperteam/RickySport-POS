const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToClarion, todayAR } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

async function CreateTransferencia({ guidSucursalOrigen, guidSucursalDestino, items, observaciones }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const guidTransferencia = newGuid();

    for (const item of items) {
      // EGRESO desde sucursal origen
      const guidEgreso = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidEgreso)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCompras', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosTransf', sql.Char(16), guidTransferencia)
        .input('guidRemitosDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCambios', sql.Char(16), EMPTY_GUID)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(20), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucOrigen', sql.Char(16), guidSucursalOrigen)
        .input('guidSucDestino', sql.Char(16), guidSucursalDestino)
        .input('codigoArt', sql.VarChar(255), item.codigoArticulo)
        .input('numero', sql.Decimal(13, 2), item.talle || 0)
        .input('color', sql.VarChar(255), item.color || '')
        .input('egreso', sql.Float, item.cantidad)
        .input('ingreso', sql.Float, 0)
        .input('estado', sql.VarChar(20), 'CONFIRMADO')
        .input('fecha', sql.Date, todayAR())
        .input('tipo', sql.VarChar(20), 'TRANSFERENCIA')
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoStock (GUID, GUIDREMITOS, GUIDREMITOSCOMPRAS,
            GUIDREMITOSTRANSFERENCIAS, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS,
            GUIDARTICULOS, GUIDMOVIMIENTOARTICULOS, GUIDSUCURSALORIGEN, GUIDSUCURSALDESTINO,
            CODIGOARTICULO, NUMERO, COLOR, EGRESO, INGRESO, ESTADO, FECHA, TIPO, ts, sts)
          VALUES (@guid, @guidRemito, @guidRemitosCompras,
            @guidRemitosTransf, @guidRemitosDev, @guidRemitosCambios,
            @guidArticulo, @guidMovArt, @guidSucOrigen, @guidSucDestino,
            @codigoArt, @numero, @color, @egreso, @ingreso, @estado, @fecha, @tipo, @ts, @sts)
        `);

      // INGRESO en sucursal destino
      const guidIngreso = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidIngreso)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCompras', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosTransf', sql.Char(16), guidTransferencia)
        .input('guidRemitosDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCambios', sql.Char(16), EMPTY_GUID)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(20), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucOrigen', sql.Char(16), guidSucursalOrigen)
        .input('guidSucDestino', sql.Char(16), guidSucursalDestino)
        .input('codigoArt', sql.VarChar(255), item.codigoArticulo)
        .input('numero', sql.Decimal(13, 2), item.talle || 0)
        .input('color', sql.VarChar(255), item.color || '')
        .input('egreso', sql.Float, 0)
        .input('ingreso', sql.Float, item.cantidad)
        .input('estado', sql.VarChar(20), 'CONFIRMADO')
        .input('fecha', sql.Date, todayAR())
        .input('tipo', sql.VarChar(20), 'TRANSFERENCIA')
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoStock (GUID, GUIDREMITOS, GUIDREMITOSCOMPRAS,
            GUIDREMITOSTRANSFERENCIAS, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS,
            GUIDARTICULOS, GUIDMOVIMIENTOARTICULOS, GUIDSUCURSALORIGEN, GUIDSUCURSALDESTINO,
            CODIGOARTICULO, NUMERO, COLOR, EGRESO, INGRESO, ESTADO, FECHA, TIPO, ts, sts)
          VALUES (@guid, @guidRemito, @guidRemitosCompras,
            @guidRemitosTransf, @guidRemitosDev, @guidRemitosCambios,
            @guidArticulo, @guidMovArt, @guidSucOrigen, @guidSucDestino,
            @codigoArt, @numero, @color, @egreso, @ingreso, @estado, @fecha, @tipo, @ts, @sts)
        `);
    }

    await tx.commit();
    return { guidTransferencia, cantidadItems: items.length };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

async function GetTransferencias({ desde, hasta, guidSucursal }) {
  const pool = await getPool();
  const request = pool.request();
  let where = `(ms.dts IS NULL OR ms.dts = 0) AND ms.TIPO = 'TRANSFERENCIA' AND ms.EGRESO > 0`;

  if (desde) {
    request.input('desde', sql.Date, new Date(desde));
    where += ` AND ms.FECHA >= @desde`;
  }
  if (hasta) {
    request.input('hasta', sql.Date, new Date(hasta));
    where += ` AND ms.FECHA <= @hasta`;
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ` AND (ms.GUIDSUCURSALORIGEN = @guidSuc OR ms.GUIDSUCURSALDESTINO = @guidSuc)`;
  }

  const result = await request.query(`
    SELECT ms.GUIDREMITOSTRANSFERENCIAS AS GuidTransferencia,
           MIN(ms.FECHA) AS Fecha,
           ms.GUIDSUCURSALORIGEN,
           ms.GUIDSUCURSALDESTINO,
           so.NOMBRE AS SucursalOrigen,
           sd.NOMBRE AS SucursalDestino,
           COUNT(*) AS CantidadItems
    FROM MovimientoStock ms
    LEFT JOIN Sucursales so ON so.GUID = ms.GUIDSUCURSALORIGEN
    LEFT JOIN Sucursales sd ON sd.GUID = ms.GUIDSUCURSALDESTINO
    WHERE ${where}
    GROUP BY ms.GUIDREMITOSTRANSFERENCIAS, ms.GUIDSUCURSALORIGEN, ms.GUIDSUCURSALDESTINO,
             so.NOMBRE, sd.NOMBRE
    ORDER BY Fecha DESC
  `);
  return result.recordset;
}

async function GetTransferenciaDetalle(guidTransferencia) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guidTransf', sql.Char(16), guidTransferencia)
    .query(`
      SELECT ms.GUID, ms.GUIDARTICULOS, ms.GUIDMOVIMIENTOARTICULOS,
             ms.CODIGOARTICULO, ms.NUMERO, ms.COLOR, ms.EGRESO,
             ms.FECHA, ms.ESTADO,
             ms.GUIDSUCURSALORIGEN, ms.GUIDSUCURSALDESTINO,
             so.NOMBRE AS SucursalOrigen,
             sd.NOMBRE AS SucursalDestino,
             RTRIM(a.DESCRIPCION) AS Descripcion,
             RTRIM(a.CODIGOARTICULOREL) AS CodigoArticuloRel
      FROM MovimientoStock ms
      LEFT JOIN Sucursales so ON so.GUID = ms.GUIDSUCURSALORIGEN
      LEFT JOIN Sucursales sd ON sd.GUID = ms.GUIDSUCURSALDESTINO
      LEFT JOIN Articulos a ON a.GUID = ms.GUIDARTICULOS
      WHERE ms.GUIDREMITOSTRANSFERENCIAS = @guidTransf
        AND ms.EGRESO > 0
        AND (ms.dts IS NULL OR ms.dts = 0)
    `);
  return result.recordset;
}

module.exports = { CreateTransferencia, GetTransferencias, GetTransferenciaDetalle };
