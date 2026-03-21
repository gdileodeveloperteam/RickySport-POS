const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToInt, timeToInt, dateToClarion } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

async function CreateVenta({ guidCliente, guidSucursal, guidVendedor, nombre, cuit, tipoOperacion, items, pagos, emitirFactura }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const fecha = dateToClarion();
    const hora = timeToInt();
    const guidRemito = newGuid();

    let totalNeto = 0;
    let totalIva = 0;
    for (const item of items) {
      totalNeto += item.cantidad * item.precioUnitario;
    }
    const totalVenta = totalNeto;

    let totalPagos = 0;
    for (const p of pagos) {
      totalPagos += p.importe;
    }

    // 1. Crear Remito (cabecera de venta)
    await tx.request()
      .input('guid', sql.Char(16), guidRemito)
      .input('fecha', sql.Int, fecha)
      .input('hora', sql.Int, hora)
      .input('nombre', sql.VarChar(255), nombre || '')
      .input('cuit', sql.Char(13), cuit || '')
      .input('neto', sql.Decimal(13, 2), totalNeto)
      .input('iva', sql.Decimal(13, 2), totalIva)
      .input('total', sql.Decimal(13, 3), totalVenta)
      .input('totalPagos', sql.Decimal(13, 2), totalPagos)
      .input('tipoOperacion', sql.VarChar(30), tipoOperacion || 'VENTA')
      .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidVendedor', sql.Char(16), guidVendedor || EMPTY_GUID)
      .input('guidFactura', sql.Char(16), EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO Remitos (GUID, FECHA, HORA, NOMBRE, CUIT, NETO, IVA, TOTAL, TOTAL_PAGOS,
          TIPOOPERACION, GUIDCLIENTES, GUIDSUCURSALES, GUIDVENDEDORES, GUIDFACTURAS,
          PENDIENTEFACTURAR, ts, sts)
        VALUES (@guid, @fecha, @hora, @nombre, @cuit, @neto, @iva, @total, @totalPagos,
          @tipoOperacion, @guidCliente, @guidSucursal, @guidVendedor, @guidFactura,
          1, @ts, @sts)
      `);

    // 2. Crear MovimientoRemitos (detalle de cada línea)
    for (const item of items) {
      const guidMov = newGuid();
      const subtotal = item.cantidad * item.precioUnitario;

      await tx.request()
        .input('guid', sql.Char(16), guidMov)
        .input('articulo', sql.VarChar(255), item.codigoArticulo)
        .input('descripcion', sql.VarChar(1024), item.descripcion || '')
        .input('numero', sql.Decimal(5, 1), item.talle || 0)
        .input('cantidad', sql.Decimal(7, 2), item.cantidad)
        .input('neto', sql.Decimal(11, 2), item.precioUnitario)
        .input('subtotal', sql.Decimal(11, 2), subtotal)
        .input('total', sql.Decimal(11, 2), subtotal)
        .input('costo', sql.Decimal(13, 2), item.precioCosto || 0)
        .input('tipoOp', sql.VarChar(30), tipoOperacion || 'VENTA')
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidRemito', sql.Char(16), guidRemito)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(16), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucursal', sql.Char(16), guidSucursal)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoRemitos (GUID, ARTICULO, DESCRIPCION, NUMERO, CANTIDAD,
            NETO, SUBTOTAL, TOTAL, COSTO, TIPOOPERACION,
            GUIDCLIENTES, GUIDREMITOS, GUIDARTICULOS, GUIDMOVIMIENTOARTICULOS, GUIDSUCURSALES,
            ts, sts)
          VALUES (@guid, @articulo, @descripcion, @numero, @cantidad,
            @neto, @subtotal, @total, @costo, @tipoOp,
            @guidCliente, @guidRemito, @guidArticulo, @guidMovArt, @guidSucursal,
            @ts, @sts)
        `);

      // 3. Descontar stock (MovimientoStock - EGRESO)
      const guidStock = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidStock)
        .input('guidRemito', sql.Char(16), guidRemito)
        .input('guidRemitosCompras', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosTransf', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCambios', sql.Char(16), EMPTY_GUID)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(20), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucOrigen', sql.Char(16), guidSucursal)
        .input('guidSucDestino', sql.Char(16), EMPTY_GUID)
        .input('codigoArt', sql.VarChar(255), item.codigoArticulo)
        .input('numero', sql.Decimal(13, 2), item.talle || 0)
        .input('color', sql.VarChar(255), item.color || '')
        .input('egreso', sql.Float, item.cantidad)
        .input('ingreso', sql.Float, 0)
        .input('estado', sql.VarChar(20), 'NUEVO')
        .input('fecha', sql.Date, new Date())
        .input('tipo', sql.VarChar(20), 'VENTA')
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

    // 4. Registrar pagos
    for (const pago of pagos) {
      const guidPago = newGuid();
      const guidCaja = newGuid();

      // FormaPagos
      await tx.request()
        .input('guid', sql.Char(16), guidPago)
        .input('fecha', sql.Date, new Date())
        .input('tipoComprobante', sql.VarChar(30), pago.tipo)
        .input('descripcion', sql.Char(60), pago.descripcion || pago.tipo)
        .input('importe', sql.Decimal(13, 3), pago.importe)
        .input('importePagar', sql.Decimal(13, 2), pago.importe)
        .input('cuotas', sql.TinyInt, pago.cuotas || 1)
        .input('interes', sql.Decimal(7, 2), pago.interes || 0)
        .input('tarjetaNumero', sql.Char(20), pago.tarjetaNumero || '')
        .input('guidRemito', sql.Char(16), guidRemito)
        .input('guidFactura', sql.Char(16), EMPTY_GUID)
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidCaja', sql.Char(16), guidCaja)
        .input('guidBanco', sql.Char(16), pago.guidBanco || EMPTY_GUID)
        .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO FormaPagos (GUID, FECHA, TIPOCOMPROBANTE, DESCRIPCION, IMPORTE,
            IMPORTEPAGAR, CUOTAS, INTERES, TARJETANUMERO,
            GUIDREMITOS, GUIDFACTURAS, GUIDCLIENTES, GUIDCAJADIARIA, GUIDBANCOS,
            GUIDMOVIMIENTOBANCOS, ts, sts)
          VALUES (@guid, @fecha, @tipoComprobante, @descripcion, @importe,
            @importePagar, @cuotas, @interes, @tarjetaNumero,
            @guidRemito, @guidFactura, @guidCliente, @guidCaja, @guidBanco,
            @guidMovBanco, @ts, @sts)
        `);

      // CajaDiaria
      await tx.request()
        .input('guid', sql.Char(16), guidCaja)
        .input('fecha', sql.Date, new Date())
        .input('tipoComprobante', sql.VarChar(40), pago.tipo)
        .input('descripcion', sql.Char(60), `Venta - ${pago.tipo}`)
        .input('debe', sql.Decimal(13, 2), pago.importe)
        .input('haber', sql.Decimal(13, 2), 0)
        .input('guidSucursal', sql.Char(16), guidSucursal)
        .input('guidBanco', sql.Char(16), pago.guidBanco || EMPTY_GUID)
        .input('guidBancosCuentas', sql.Char(16), pago.guidBancosCuentas || EMPTY_GUID)
        .input('guidFormaPago', sql.Char(16), guidPago)
        .input('guidCajaGastos', sql.Char(16), EMPTY_GUID)
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidProveedor', sql.Char(16), EMPTY_GUID)
        .input('guidEmpleado', sql.Char(16), EMPTY_GUID)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO CajaDiaria (GUID, FECHA, TIPOCOMPROBANTE, DESCRIPCION, DEBE, HABER,
            GUIDSUCURSALES, GUIDBANCOS, GUIDBANCOSCUENTAS, GUIDFORMAPAGOS, GUIDCAJAGASTOS,
            GUIDCLIENTES, GUIDPROVEEDORES, GUIDEMPLEADOS, ts, sts)
          VALUES (@guid, @fecha, @tipoComprobante, @descripcion, @debe, @haber,
            @guidSucursal, @guidBanco, @guidBancosCuentas, @guidFormaPago, @guidCajaGastos,
            @guidCliente, @guidProveedor, @guidEmpleado, @ts, @sts)
        `);

      // Si pago es Credito Devolucion, consumir credito
      if (pago.tipo === 'CREDITO_DEV' && pago.guidCreditoDevolucion) {
        const guidUso = newGuid();
        await tx.request()
          .input('guid', sql.Char(16), guidUso)
          .input('guidCredito', sql.Char(16), pago.guidCreditoDevolucion)
          .input('guidRemito', sql.Char(16), guidRemito)
          .input('guidFormaPago', sql.Char(16), guidPago)
          .input('monto', sql.Decimal(13, 3), pago.importe)
          .input('fecha', sql.Date, new Date())
          .input('ts', sql.Float, ts)
          .input('sts', sql.Float, ts)
          .query(`
            INSERT INTO CreditosDevolucionesUsos (GUID, GUIDCREDITOSDEVOLUCIONES, GUIDREMITOS,
              GUIDFORMAPAGOS, MONTOUSADO, FECHA, ts, sts)
            VALUES (@guid, @guidCredito, @guidRemito, @guidFormaPago, @monto, @fecha, @ts, @sts)
          `);

        await tx.request()
          .input('guidCredito', sql.Char(16), pago.guidCreditoDevolucion)
          .input('monto', sql.Decimal(13, 3), pago.importe)
          .query(`
            UPDATE CreditosDevoluciones
            SET MONTOUSADO = MONTOUSADO + @monto,
                ESTADO = CASE WHEN (MONTOUSADO + @monto) >= MONTOORIGINAL THEN 'CONSUMIDO' ELSE 'ACTIVO' END
            WHERE GUID = @guidCredito
          `);
      }

      // Si pago es Cuenta Corriente, actualizar saldo cliente
      if (pago._esCtaCte && guidCliente && guidCliente !== EMPTY_GUID) {
        await tx.request()
          .input('guid', sql.Char(16), guidCliente)
          .input('importe', sql.Decimal(13, 3), pago.importe)
          .query(`UPDATE Clientes SET SALDO = ISNULL(SALDO, 0) + @importe WHERE GUID = @guid`);

        const guidMovCli = newGuid();
        await tx.request()
          .input('guid', sql.Char(16), guidMovCli)
          .input('fecha', sql.Decimal(7), dateToClarion())
          .input('cantidad', sql.SmallInt, 0)
          .input('articulo', sql.VarChar(255), '')
          .input('descripcion', sql.VarChar(2000), `Venta - Cta. Cte.`)
          .input('talle', sql.Decimal(7, 2), 0)
          .input('precioUnitario', sql.Decimal(11, 2), 0)
          .input('iva', sql.Decimal(5, 2), 0)
          .input('debe', sql.Decimal(13, 3), pago.importe)
          .input('haber', sql.Decimal(13, 3), 0)
          .input('saldo', sql.Decimal(13, 3), 0)
          .input('pago', sql.Char(10), '')
          .input('sucursal', sql.TinyInt, 0)
          .input('guidCliente', sql.Char(16), guidCliente)
          .input('guidArticulo', sql.Char(16), EMPTY_GUID)
          .input('guidRemito', sql.Char(16), guidRemito)
          .input('guidFormaPago', sql.Char(16), guidPago)
          .input('guidCaja', sql.Char(16), guidCaja)
          .input('guidBanco', sql.Char(16), EMPTY_GUID)
          .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoCambio', sql.Char(16), EMPTY_GUID)
          .input('ts', sql.Float, ts)
          .input('sts', sql.Float, ts)
          .input('dts', sql.Float, 0)
          .query(`
            INSERT INTO MovimientoClientes (GUID, FECHA, CANTIDAD, ARTICULO, DESCRIPCION, TALLE,
              PRECIOUNITARIO, IVA, DEBE, HABER, SALDO, PAGO, SUCURSAL,
              GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
              GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
              GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, ts, sts, dts)
            VALUES (@guid, @fecha, @cantidad, @articulo, @descripcion, @talle,
              @precioUnitario, @iva, @debe, @haber, @saldo, @pago, @sucursal,
              @guidCliente, @guidArticulo, @guidRemito, @guidFormaPago,
              @guidCaja, @guidBanco, @guidMovBanco,
              @guidRemitoDev, @guidRemitoCambio, @ts, @sts, @dts)
          `);
      }
    }

    // 5. Emitir Factura si corresponde
    let facturaNumero = null;
    if (emitirFactura) {
      const guidFactura = newGuid();

      // Obtener punto de venta y próximo número de la sucursal
      const sucResult = await tx.request()
        .input('guidSuc', sql.Char(16), guidSucursal)
        .query(`SELECT PUNTOVENTA, ULTIMAFACTURAB, GUIDCONFIGURACION FROM Sucursales WHERE GUID = @guidSuc`);

      const suc = sucResult.recordset[0] || {};
      const puntoVenta = suc.PUNTOVENTA || 1;
      const ultimaFactura = suc.ULTIMAFACTURAB || 0;
      const numeroFactura = ultimaFactura + 1;
      const guidConfig = suc.GUIDCONFIGURACION || EMPTY_GUID;
      const numFacturaStr = `${String(puntoVenta).padStart(4, '0')}-${String(numeroFactura).padStart(8, '0')}`;

      await tx.request()
        .input('guid', sql.Char(16), guidFactura)
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidConfig', sql.Char(16), guidConfig)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .input('codConfig', sql.Int, 1)
        .input('codImputacion', sql.Int, 0)
        .input('codVendedor', sql.Int, 0)
        .input('codDocAfip', sql.Decimal(3), 99)
        .input('codConceptoAfip', sql.Decimal(3), 1)
        .input('idComp', sql.Int, 6)
        .input('numFactura', sql.Char(13), numFacturaStr)
        .input('puntoVenta', sql.Int, puntoVenta)
        .input('numero', sql.Int, numeroFactura)
        .input('tipoComp', sql.Char(3), 'FCB')
        .input('tipoFactura', sql.Char(1), 'B')
        .input('fecha', sql.Decimal(7), dateToClarion())
        .input('nombre', sql.Char(100), nombre || 'CONSUMIDOR FINAL')
        .input('cuit', sql.Char(13), cuit || '')
        .input('total', sql.Decimal(15, 2), totalVenta)
        .input('neto', sql.Decimal(15, 2), totalVenta)
        .input('pendiente', sql.TinyInt, 0)
        .query(`
          INSERT INTO Facturas (GUID, GUIDCLIENTES, GUIDCONFIGURACION, ts, sts,
            CODIGO_CONFIGURACION, CODIGO_IMPUTACION, CODIGO_VENDEDOR,
            CODIGO_DOCUMENTO_AFIP, CODIGO_CONCEPTO_AFIP, IDCOMP,
            NUMERO_FACTURA, PUNTOVENTA, NUMERO,
            TIPO_COMPROBANTE, TIPO_FACTURA, FECHA, NOMBRE, CUIT,
            TOTAL, TOTAL_NETO21, PENDIENTE)
          VALUES (@guid, @guidCliente, @guidConfig, @ts, @sts,
            @codConfig, @codImputacion, @codVendedor,
            @codDocAfip, @codConceptoAfip, @idComp,
            @numFactura, @puntoVenta, @numero,
            @tipoComp, @tipoFactura, @fecha, @nombre, @cuit,
            @total, @neto, @pendiente)
        `);

      // Actualizar último número de factura en Sucursales
      await tx.request()
        .input('guidSuc', sql.Char(16), guidSucursal)
        .input('numero', sql.Int, numeroFactura)
        .query(`UPDATE Sucursales SET ULTIMAFACTURAB = @numero WHERE GUID = @guidSuc`);

      // Vincular remito con factura
      await tx.request()
        .input('guidRemito', sql.Char(16), guidRemito)
        .input('guidFactura', sql.Char(16), guidFactura)
        .query(`UPDATE Remitos SET GUIDFACTURAS = @guidFactura, PENDIENTEFACTURAR = 0 WHERE GUID = @guidRemito`);

      facturaNumero = numFacturaStr;
    }

    await tx.commit();
    return { guid: guidRemito, total: totalVenta, totalPagos, factura: facturaNumero };
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    throw err;
  }
}

async function GetVentas({ desde, hasta, guidSucursal }) {
  const pool = await getPool();
  const request = pool.request();
  let where = `(r.dts IS NULL OR r.dts = 0) AND (ISNULL(r.TIPOOPERACION,'') NOT IN ('CAMBIO','DEVOLUCION'))`;

  if (desde) {
    request.input('desde', sql.Int, dateToClarion(desde));
    where += ` AND r.FECHA >= @desde`;
  }
  if (hasta) {
    request.input('hasta', sql.Int, dateToClarion(hasta));
    where += ` AND r.FECHA <= @hasta`;
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ` AND r.GUIDSUCURSALES = @guidSuc`;
  }

  const result = await request.query(`
    SELECT r.GUID, r.FECHA, r.HORA, r.NOMBRE, r.TOTAL, r.TOTAL_PAGOS,
           r.TIPOOPERACION, r.GUIDSUCURSALES, s.NOMBRE AS Sucursal
    FROM Remitos r
    LEFT JOIN Sucursales s ON s.GUID = r.GUIDSUCURSALES
    WHERE ${where}
      AND (
        SELECT ISNULL(SUM(mr.CANTIDAD), 0)
        FROM MovimientoRemitos mr
        WHERE mr.GUIDREMITOS = r.GUID AND (mr.dts IS NULL OR mr.dts = 0)
      ) > (
        ISNULL((
          SELECT SUM(mrd.CANTIDAD)
          FROM RemitosDevoluciones rd
          JOIN MovimientoRemitos mrd ON mrd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (mrd.dts IS NULL OR mrd.dts = 0)
          WHERE rd.GUIDREMITOS = r.GUID AND (rd.dts IS NULL OR rd.dts = 0)
        ), 0)
        +
        ISNULL((
          SELECT SUM(mrc.CANTIDAD)
          FROM RemitosCambios rc
          JOIN MovimientoRemitos mrc ON mrc.GUIDREMITOSCAMBIOS = rc.GUID AND (mrc.dts IS NULL OR mrc.dts = 0)
          WHERE rc.GUIDREMITOS = r.GUID AND (rc.dts IS NULL OR rc.dts = 0)
        ), 0)
      )
    ORDER BY r.FECHA DESC, r.HORA DESC
  `);
  return result.recordset;
}

async function GetVentaDetalle(guidRemito) {
  const pool = await getPool();
  const remito = await pool.request()
    .input('guid', sql.Char(16), guidRemito)
    .query(`SELECT * FROM Remitos WHERE GUID = @guid`);

  const items = await pool.request()
    .input('guid', sql.Char(16), guidRemito)
    .query(`
      SELECT mr.*,
        mr.CANTIDAD - (
          ISNULL((
            SELECT SUM(mrd.CANTIDAD)
            FROM RemitosDevoluciones rd
            JOIN MovimientoRemitos mrd ON mrd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (mrd.dts IS NULL OR mrd.dts = 0)
            WHERE rd.GUIDREMITOS = @guid AND mrd.GUIDARTICULOS = mr.GUIDARTICULOS AND mrd.NUMERO = mr.NUMERO
              AND (rd.dts IS NULL OR rd.dts = 0)
          ), 0)
          +
          ISNULL((
            SELECT SUM(mrc.CANTIDAD)
            FROM RemitosCambios rc
            JOIN MovimientoRemitos mrc ON mrc.GUIDREMITOSCAMBIOS = rc.GUID AND (mrc.dts IS NULL OR mrc.dts = 0)
            WHERE rc.GUIDREMITOS = @guid AND mrc.GUIDARTICULOS = mr.GUIDARTICULOS AND mrc.NUMERO = mr.NUMERO
              AND (rc.dts IS NULL OR rc.dts = 0)
          ), 0)
        ) AS RESTANTE
      FROM MovimientoRemitos mr
      WHERE mr.GUIDREMITOS = @guid AND (mr.dts IS NULL OR mr.dts = 0)
    `);

  const pagos = await pool.request()
    .input('guid', sql.Char(16), guidRemito)
    .query(`SELECT * FROM FormaPagos WHERE GUIDREMITOS = @guid AND (dts IS NULL OR dts = 0)`);

  return {
    remito: remito.recordset[0] || null,
    items: items.recordset,
    pagos: pagos.recordset,
  };
}

async function GetResumenPagos({ desde, hasta, guidSucursal }) {
  const pool = await getPool();
  const request = pool.request();
  let where = `(fp.dts IS NULL OR fp.dts = 0)`;

  if (desde) {
    request.input('desde', sql.Date, desde);
    where += ` AND fp.FECHA >= @desde`;
  }
  if (hasta) {
    request.input('hasta', sql.Date, hasta);
    where += ` AND fp.FECHA <= @hasta`;
  }
  if (guidSucursal) {
    request.input('guidSuc', sql.Char(16), guidSucursal);
    where += ` AND r.GUIDSUCURSALES = @guidSuc`;
  }

  const result = await request.query(`
    SELECT RTRIM(LTRIM(fp.TIPOCOMPROBANTE)) AS TipoPago,
           COUNT(*) AS Cantidad,
           SUM(fp.IMPORTE) AS Total
    FROM FormaPagos fp
    LEFT JOIN Remitos r ON r.GUID = fp.GUIDREMITOS
    WHERE ${where}
    GROUP BY RTRIM(LTRIM(fp.TIPOCOMPROBANTE))
    ORDER BY Total DESC
  `);
  return result.recordset;
}

async function GetVentasPorSucursal({ desde, hasta }) {
  const pool = await getPool();
  const request = pool.request();
  let where = `(r.dts IS NULL OR r.dts = 0) AND (r.TIPOOPERACION IN ('VENTA') OR r.TIPOOPERACION = '' OR r.TIPOOPERACION IS NULL)`;

  if (desde) {
    request.input('desde', sql.Int, dateToClarion(desde));
    where += ` AND r.FECHA >= @desde`;
  }
  if (hasta) {
    request.input('hasta', sql.Int, dateToClarion(hasta));
    where += ` AND r.FECHA <= @hasta`;
  }

  const result = await request.query(`
    SELECT RTRIM(LTRIM(s.NOMBRE)) AS Sucursal,
           COUNT(*) AS Cantidad,
           SUM(r.TOTAL) AS Total
    FROM Remitos r
    LEFT JOIN Sucursales s ON s.GUID = r.GUIDSUCURSALES
    WHERE ${where}
    GROUP BY RTRIM(LTRIM(s.NOMBRE))
    ORDER BY Total DESC
  `);
  return result.recordset;
}

async function GetTotalesDevCambios({ desde, hasta, guidSucursal }) {
  const pool = await getPool();

  // Totales de RemitosDevoluciones
  const reqDev = pool.request();
  let whereDev = `(r.dts IS NULL OR r.dts = 0)`;
  if (desde) {
    reqDev.input('desde', sql.Int, dateToClarion(desde));
    whereDev += ` AND r.FECHA >= @desde`;
  }
  if (hasta) {
    reqDev.input('hasta', sql.Int, dateToClarion(hasta));
    whereDev += ` AND r.FECHA <= @hasta`;
  }
  if (guidSucursal) {
    reqDev.input('guidSuc', sql.Char(16), guidSucursal);
    whereDev += ` AND r.GUIDSUCURSALES = @guidSuc`;
  }
  const devResult = await reqDev.query(`
    SELECT ISNULL(SUM(r.TOTAL), 0) AS Total, COUNT(*) AS Cantidad
    FROM RemitosDevoluciones r
    WHERE ${whereDev}
  `);

  // Totales de RemitosCambios
  const reqCam = pool.request();
  let whereCam = `(r.dts IS NULL OR r.dts = 0)`;
  if (desde) {
    reqCam.input('desde', sql.Int, dateToClarion(desde));
    whereCam += ` AND r.FECHA >= @desde`;
  }
  if (hasta) {
    reqCam.input('hasta', sql.Int, dateToClarion(hasta));
    whereCam += ` AND r.FECHA <= @hasta`;
  }
  if (guidSucursal) {
    reqCam.input('guidSuc', sql.Char(16), guidSucursal);
    whereCam += ` AND r.GUIDSUCURSALES = @guidSuc`;
  }
  const camResult = await reqCam.query(`
    SELECT ISNULL(SUM(r.TOTAL), 0) AS Total, COUNT(*) AS Cantidad
    FROM RemitosCambios r
    WHERE ${whereCam}
  `);

  return {
    devoluciones: devResult.recordset[0] || { Total: 0, Cantidad: 0 },
    cambios: camResult.recordset[0] || { Total: 0, Cantidad: 0 },
  };
}

module.exports = { CreateVenta, GetVentas, GetVentaDetalle, GetResumenPagos, GetVentasPorSucursal, GetTotalesDevCambios };
