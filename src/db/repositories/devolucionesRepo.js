const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToInt, timeToInt, dateToClarion } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

// ============================================================================
// Devolución: reingresa mercadería y registra en RemitosDevoluciones
// ============================================================================
async function CreateDevolucion({ guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, items, motivo, tipoDevolucion, emitirNotaCredito }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const fecha = dateToClarion();
    const hora = timeToInt();
    const guidRemitoDev = newGuid();

    let totalDevolucion = 0;
    for (const item of items) {
      totalDevolucion += item.cantidad * item.precioUnitario;
    }

    // 1. Crear registro en RemitosDevoluciones
    await tx.request()
      .input('guid', sql.Char(16), guidRemitoDev)
      .input('fecha', sql.Int, fecha)
      .input('hora', sql.Int, hora)
      .input('nombre', sql.VarChar(255), nombre || '')
      .input('neto', sql.Decimal(13, 2), totalDevolucion)
      .input('total', sql.Decimal(13, 3), totalDevolucion)
      .input('tipoOperacion', sql.VarChar(30), 'DEVOLUCION')
      .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidVendedor', sql.Char(16), guidVendedor || EMPTY_GUID)
      .input('guidFactura', sql.Char(16), EMPTY_GUID)
      .input('guidRemitos', sql.Char(16), guidRemitoOriginal || EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO RemitosDevoluciones (GUID, FECHA, HORA, NOMBRE, NETO, TOTAL, TOTAL_PAGOS,
          TIPOOPERACION, GUIDCLIENTES, GUIDSUCURSALES, GUIDVENDEDORES, GUIDFACTURAS, GUIDREMITOS,
          PENDIENTEFACTURAR, ts, sts)
        VALUES (@guid, @fecha, @hora, @nombre, @neto, @total, 0,
          @tipoOperacion, @guidCliente, @guidSucursal, @guidVendedor, @guidFactura, @guidRemitos,
          0, @ts, @sts)
      `);

    // 2. Detalle de items devueltos + reingreso de stock
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
        .input('tipoOp', sql.VarChar(30), 'DEVOLUCION')
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoDev', sql.Char(16), guidRemitoDev)
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

      // Reingreso stock
      const guidStock = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidStock)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCompras', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosTransf', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosDev', sql.Char(16), guidRemitoDev)
        .input('guidRemitosCambios', sql.Char(16), EMPTY_GUID)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(20), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucOrigen', sql.Char(16), guidSucursal)
        .input('guidSucDestino', sql.Char(16), EMPTY_GUID)
        .input('codigoArt', sql.VarChar(255), item.codigoArticulo)
        .input('numero', sql.Decimal(13, 2), item.talle || 0)
        .input('color', sql.VarChar(255), item.color || '')
        .input('ingreso', sql.Float, item.cantidad)
        .input('egreso', sql.Float, 0)
        .input('estado', sql.VarChar(20), tipoDevolucion === 'DEFECTO' ? 'DEFECTUOSO' : 'NUEVO')
        .input('fecha', sql.Date, new Date())
        .input('tipo', sql.VarChar(20), 'DEVOLUCION')
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

    // 3. Si cliente tiene cuenta corriente, devolver saldo
    if (guidCliente && guidCliente !== EMPTY_GUID) {
      await tx.request()
        .input('guid', sql.Char(16), guidCliente)
        .input('importe', sql.Decimal(13, 3), totalDevolucion)
        .query(`UPDATE Clientes SET SALDO = ISNULL(SALDO, 0) - @importe WHERE GUID = @guid`);

      for (const item of items) {
        const guidMovCli = newGuid();
        const subtotalItem = item.cantidad * item.precioUnitario;
        await tx.request()
          .input('guid', sql.Char(16), guidMovCli)
          .input('fecha', sql.Decimal(7), dateToClarion())
          .input('cantidad', sql.SmallInt, item.cantidad || 0)
          .input('articulo', sql.VarChar(255), item.codigoArticulo || '')
          .input('descripcion', sql.VarChar(2000), `Devolucion - ${motivo || 'Sin motivo'}`)
          .input('talle', sql.Decimal(7, 2), item.talle || 0)
          .input('precioUnitario', sql.Decimal(11, 2), item.precioUnitario || 0)
          .input('iva', sql.Decimal(5, 2), item.iva || 0)
          .input('debe', sql.Decimal(13, 3), 0)
          .input('haber', sql.Decimal(13, 3), subtotalItem)
          .input('saldo', sql.Decimal(13, 3), 0)
          .input('pago', sql.Char(10), '')
          .input('sucursal', sql.TinyInt, 0)
          .input('guidCliente', sql.Char(16), guidCliente)
          .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
          .input('guidRemito', sql.Char(16), EMPTY_GUID)
          .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
          .input('guidCaja', sql.Char(16), EMPTY_GUID)
          .input('guidBanco', sql.Char(16), EMPTY_GUID)
          .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoDev', sql.Char(16), guidRemitoDev)
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

    // 4. Emitir Nota de Credito si corresponde
    let notaCreditoNumero = null;
    if (emitirNotaCredito) {
      const guidNotaCredito = newGuid();

      const sucResult = await tx.request()
        .input('guidSuc', sql.Char(16), guidSucursal)
        .query(`SELECT PUNTOVENTA, ULTIMANOTACREDITOB, GUIDCONFIGURACION, IDCOMPROBANTENCDB FROM Sucursales WHERE GUID = @guidSuc`);

      const suc = sucResult.recordset[0] || {};
      const puntoVenta = suc.PUNTOVENTA || 1;
      const ultimaNC = suc.ULTIMANOTACREDITOB || 0;
      const numeroNC = ultimaNC + 1;
      const guidConfig = suc.GUIDCONFIGURACION || EMPTY_GUID;
      const idComp = suc.IDCOMPROBANTENCDB || 8;
      const numNCStr = `${String(puntoVenta).padStart(4, '0')}-${String(numeroNC).padStart(8, '0')}`;

      await tx.request()
        .input('guid', sql.Char(16), guidNotaCredito)
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidConfig', sql.Char(16), guidConfig)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .input('codConfig', sql.Int, 1)
        .input('codImputacion', sql.Int, 0)
        .input('codVendedor', sql.Int, 0)
        .input('codDocAfip', sql.Decimal(3), 99)
        .input('codConceptoAfip', sql.Decimal(3), 1)
        .input('idComp', sql.Int, idComp)
        .input('numFactura', sql.Char(13), numNCStr)
        .input('puntoVenta', sql.Int, puntoVenta)
        .input('numero', sql.Int, numeroNC)
        .input('tipoComp', sql.Char(3), 'NCB')
        .input('tipoFactura', sql.Char(1), 'B')
        .input('fecha', sql.Decimal(7), dateToClarion())
        .input('nombre', sql.Char(100), nombre || 'CONSUMIDOR FINAL')
        .input('cuit', sql.Char(13), '')
        .input('total', sql.Decimal(15, 2), totalDevolucion)
        .input('neto', sql.Decimal(15, 2), totalDevolucion)
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

      await tx.request()
        .input('guidSuc', sql.Char(16), guidSucursal)
        .input('numero', sql.Int, numeroNC)
        .query(`UPDATE Sucursales SET ULTIMANOTACREDITOB = @numero WHERE GUID = @guidSuc`);

      await tx.request()
        .input('guidDev', sql.Char(16), guidRemitoDev)
        .input('guidFactura', sql.Char(16), guidNotaCredito)
        .query(`UPDATE RemitosDevoluciones SET GUIDFACTURAS = @guidFactura, PENDIENTEFACTURAR = 0 WHERE GUID = @guidDev`);

      notaCreditoNumero = numNCStr;
    }

    // 5. Crear credito de devolucion para uso como forma de pago futura
    const guidCredito = newGuid();
    await tx.request()
      .input('guid', sql.Char(16), guidCredito)
      .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
      .input('guidRemitoDev', sql.Char(16), guidRemitoDev)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('fecha', sql.Date, new Date())
      .input('montoOriginal', sql.Decimal(13, 3), totalDevolucion)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO CreditosDevoluciones (GUID, GUIDCLIENTES, GUIDREMITOSDEVOLUCIONES, GUIDSUCURSALES,
          FECHA, MONTOORIGINAL, MONTOUSADO, ESTADO, ts, sts)
        VALUES (@guid, @guidCliente, @guidRemitoDev, @guidSucursal,
          @fecha, @montoOriginal, 0, 'ACTIVO', @ts, @sts)
      `);

    await tx.commit();
    return { guid: guidRemitoDev, total: totalDevolucion, notaCredito: notaCreditoNumero, guidCredito };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// ============================================================================
// Cambio con Venta: transaccion atomica que graba TODO junto
//   1. RemitosCambios (reingreso mercaderia devuelta)
//   2. MovimientoRemitos del cambio + stock ingreso
//   3. Remitos (nueva venta con GUIDREMITOSCAMBIOS)
//   4. MovimientoRemitos de la venta + stock egreso
//   5. FormaPagos + CajaDiaria (cobro automatico con forma de pago original)
// ============================================================================
async function CreateCambioConVenta({
  // Datos del cambio
  guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, motivo, tipoCambio,
  itemsCambio,
  // Datos de la nueva venta
  itemsVenta,
  // Pagos para la diferencia (cuando totalVenta > totalCambio)
  pagos,
}) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const fecha = dateToClarion();
    const hora = timeToInt();
    const guidRemitoCambio = newGuid();
    const guidRemitoVenta = newGuid();

    // ── Totales ──
    let totalCambio = 0;
    for (const item of itemsCambio) {
      totalCambio += item.cantidad * item.precioUnitario;
    }
    let totalVenta = 0;
    for (const item of itemsVenta) {
      totalVenta += item.cantidad * item.precioUnitario;
    }

    // ── Obtener forma de pago original ──
    const fpResult = await tx.request()
      .input('guidOrig', sql.Char(16), guidRemitoOriginal)
      .query(`SELECT TOP 1 RTRIM(LTRIM(TIPOCOMPROBANTE)) AS TIPOCOMPROBANTE,
              RTRIM(LTRIM(DESCRIPCION)) AS DESCRIPCION,
              GUIDBANCOS, CUOTAS, INTERES, TARJETANUMERO
              FROM FormaPagos WHERE GUIDREMITOS = @guidOrig AND (dts IS NULL OR dts = 0)`);
    const fpOrig = fpResult.recordset[0] || {};
    const tipoPago = fpOrig.TIPOCOMPROBANTE || 'EFECTIVO';

    // ================================================================
    // PARTE A: Remito de Cambio (RemitosCambios + reingreso stock)
    // ================================================================
    await tx.request()
      .input('guid', sql.Char(16), guidRemitoCambio)
      .input('fecha', sql.Int, fecha)
      .input('hora', sql.Int, hora)
      .input('nombre', sql.VarChar(255), nombre || '')
      .input('neto', sql.Decimal(13, 2), totalCambio)
      .input('total', sql.Decimal(13, 3), totalCambio)
      .input('tipoOperacion', sql.VarChar(30), 'CAMBIO')
      .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidVendedor', sql.Char(16), guidVendedor || EMPTY_GUID)
      .input('guidFactura', sql.Char(16), EMPTY_GUID)
      .input('guidRemitos', sql.Char(16), guidRemitoOriginal || EMPTY_GUID)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO RemitosCambios (GUID, FECHA, HORA, NOMBRE, NETO, TOTAL, TOTAL_PAGOS,
          TIPOOPERACION, GUIDCLIENTES, GUIDSUCURSALES, GUIDVENDEDORES, GUIDFACTURAS, GUIDREMITOS,
          PENDIENTEFACTURAR, ts, sts)
        VALUES (@guid, @fecha, @hora, @nombre, @neto, @total, 0,
          @tipoOperacion, @guidCliente, @guidSucursal, @guidVendedor, @guidFactura, @guidRemitos,
          0, @ts, @sts)
      `);

    // Detalle items cambio + reingreso stock
    for (const item of itemsCambio) {
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
        .input('tipoOp', sql.VarChar(30), 'CAMBIO')
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
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

      const guidStock = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidStock)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCompras', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosTransf', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitosCambios', sql.Char(16), guidRemitoCambio)
        .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
        .input('guidMovArt', sql.Char(20), item.guidMovimientoArticulo || EMPTY_GUID)
        .input('guidSucOrigen', sql.Char(16), guidSucursal)
        .input('guidSucDestino', sql.Char(16), EMPTY_GUID)
        .input('codigoArt', sql.VarChar(255), item.codigoArticulo)
        .input('numero', sql.Decimal(13, 2), item.talle || 0)
        .input('color', sql.VarChar(255), item.color || '')
        .input('ingreso', sql.Float, item.cantidad)
        .input('egreso', sql.Float, 0)
        .input('estado', sql.VarChar(20), tipoCambio === 'DEFECTO' ? 'DEFECTUOSO' : 'NUEVO')
        .input('fecha', sql.Date, new Date())
        .input('tipo', sql.VarChar(20), 'CAMBIO')
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

    // ================================================================
    // PARTE A.2: MovimientoClientes del cambio (credito al cliente)
    // ================================================================
    if (guidCliente && guidCliente !== EMPTY_GUID) {
      // Un registro por cada item devuelto (credito)
      for (const item of itemsCambio) {
        const guidMovCliCambio = newGuid();
        const subtotalItem = item.cantidad * item.precioUnitario;
        await tx.request()
          .input('guid', sql.Char(16), guidMovCliCambio)
          .input('fecha', sql.Decimal(7), dateToClarion())
          .input('cantidad', sql.SmallInt, item.cantidad || 0)
          .input('articulo', sql.VarChar(255), item.codigoArticulo || '')
          .input('descripcion', sql.VarChar(2000), `Cambio - Credito por devolucion de mercaderia`)
          .input('talle', sql.Decimal(7, 2), item.talle || 0)
          .input('precioUnitario', sql.Decimal(11, 2), item.precioUnitario || 0)
          .input('iva', sql.Decimal(5, 2), item.iva || 0)
          .input('debe', sql.Decimal(13, 3), 0)
          .input('haber', sql.Decimal(13, 3), subtotalItem)
          .input('saldo', sql.Decimal(13, 3), 0)
          .input('pago', sql.Char(10), '')
          .input('sucursal', sql.TinyInt, 0)
          .input('guidCliente', sql.Char(16), guidCliente)
          .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
          .input('guidRemito', sql.Char(16), EMPTY_GUID)
          .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
          .input('guidCaja', sql.Char(16), EMPTY_GUID)
          .input('guidBanco', sql.Char(16), EMPTY_GUID)
          .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
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

      // Un registro por cada item de la nueva venta (debito)
      for (const item of itemsVenta) {
        const guidMovCliVenta = newGuid();
        const subtotalItem = item.cantidad * item.precioUnitario;
        await tx.request()
          .input('guid', sql.Char(16), guidMovCliVenta)
          .input('fecha', sql.Decimal(7), dateToClarion())
          .input('cantidad', sql.SmallInt, item.cantidad || 0)
          .input('articulo', sql.VarChar(255), item.codigoArticulo || '')
          .input('descripcion', sql.VarChar(2000), `Cambio - Debito por nueva mercaderia`)
          .input('talle', sql.Decimal(7, 2), item.talle || 0)
          .input('precioUnitario', sql.Decimal(11, 2), item.precioUnitario || 0)
          .input('iva', sql.Decimal(5, 2), item.iva || 0)
          .input('debe', sql.Decimal(13, 3), subtotalItem)
          .input('haber', sql.Decimal(13, 3), 0)
          .input('saldo', sql.Decimal(13, 3), 0)
          .input('pago', sql.Char(10), '')
          .input('sucursal', sql.TinyInt, 0)
          .input('guidCliente', sql.Char(16), guidCliente)
          .input('guidArticulo', sql.Char(16), item.guidArticulo || EMPTY_GUID)
          .input('guidRemito', sql.Char(16), guidRemitoVenta)
          .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
          .input('guidCaja', sql.Char(16), EMPTY_GUID)
          .input('guidBanco', sql.Char(16), EMPTY_GUID)
          .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
          .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
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

    // ================================================================
    // PARTE B: Remito de Venta nueva (con GUIDREMITOSCAMBIOS)
    // ================================================================
    const diferencia = totalVenta - totalCambio;
    const totalPagosReal = diferencia > 0 ? diferencia : 0;

    await tx.request()
      .input('guid', sql.Char(16), guidRemitoVenta)
      .input('fecha', sql.Int, fecha)
      .input('hora', sql.Int, hora)
      .input('nombre', sql.VarChar(255), nombre || '')
      .input('neto', sql.Decimal(13, 2), totalVenta)
      .input('total', sql.Decimal(13, 3), totalVenta)
      .input('totalPagos', sql.Decimal(13, 2), totalPagosReal)
      .input('tipoOperacion', sql.VarChar(30), 'VENTA')
      .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
      .input('guidSucursal', sql.Char(16), guidSucursal)
      .input('guidVendedor', sql.Char(16), guidVendedor || EMPTY_GUID)
      .input('guidFactura', sql.Char(16), EMPTY_GUID)
      .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO Remitos (GUID, FECHA, HORA, NOMBRE, NETO, TOTAL, TOTAL_PAGOS,
          TIPOOPERACION, GUIDCLIENTES, GUIDSUCURSALES, GUIDVENDEDORES, GUIDFACTURAS,
          GUIDREMITOSCAMBIOS, PENDIENTEFACTURAR, ts, sts)
        VALUES (@guid, @fecha, @hora, @nombre, @neto, @total, @totalPagos,
          @tipoOperacion, @guidCliente, @guidSucursal, @guidVendedor, @guidFactura,
          @guidRemitoCambio, 1, @ts, @sts)
      `);

    // Detalle items venta + egreso stock
    for (const item of itemsVenta) {
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
        .input('tipoOp', sql.VarChar(30), 'VENTA')
        .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
        .input('guidRemito', sql.Char(16), guidRemitoVenta)
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

      const guidStock = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidStock)
        .input('guidRemito', sql.Char(16), guidRemitoVenta)
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

    // ================================================================
    // PARTE C: Cobro de la diferencia (solo si totalVenta > totalCambio)
    // ================================================================
    if (diferencia > 0.01) {
      const pagosArr = (pagos && pagos.length > 0) ? pagos : [{ tipo: tipoPago, importe: diferencia, descripcion: tipoPago, guidBanco: fpOrig.GUIDBANCOS || EMPTY_GUID, guidBancosCuentas: '', cuotas: fpOrig.CUOTAS || 1, interes: fpOrig.INTERES || 0, tarjetaNumero: fpOrig.TARJETANUMERO || '' }];

      for (const pago of pagosArr) {
        const guidPago = newGuid();
        const guidCaja = newGuid();

        await tx.request()
          .input('guid', sql.Char(16), guidPago)
          .input('fecha', sql.Date, new Date())
          .input('tipoComprobante', sql.VarChar(30), pago.tipo)
          .input('descripcion', sql.Char(60), `Cambio - ${pago.tipo}`)
          .input('importe', sql.Decimal(13, 3), pago.importe)
          .input('importePagar', sql.Decimal(13, 2), pago.importe)
          .input('cuotas', sql.TinyInt, pago.cuotas || 1)
          .input('interes', sql.Decimal(7, 2), pago.interes || 0)
          .input('tarjetaNumero', sql.Char(20), pago.tarjetaNumero || '')
          .input('guidRemito', sql.Char(16), guidRemitoVenta)
          .input('guidFactura', sql.Char(16), EMPTY_GUID)
          .input('guidCliente', sql.Char(16), guidCliente || EMPTY_GUID)
          .input('guidCaja', sql.Char(16), guidCaja)
          .input('guidBanco', sql.Char(16), (pago.guidBanco || EMPTY_GUID))
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

        await tx.request()
          .input('guid', sql.Char(16), guidCaja)
          .input('fecha', sql.Date, new Date())
          .input('tipoComprobante', sql.VarChar(40), pago.tipo)
          .input('descripcion', sql.Char(60), `Cambio - ${pago.tipo}`)
          .input('debe', sql.Decimal(13, 2), pago.importe)
          .input('haber', sql.Decimal(13, 2), 0)
          .input('guidSucursal', sql.Char(16), guidSucursal)
          .input('guidBanco', sql.Char(16), (pago.guidBanco || EMPTY_GUID))
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

        // Si pago es CTA_CTE, actualizar saldo cliente
        if (pago.tipo === 'CTA_CTE' && guidCliente && guidCliente !== EMPTY_GUID) {
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
            .input('descripcion', sql.VarChar(2000), `Cambio - Cta. Cte. (diferencia)`)
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
            .input('guidRemito', sql.Char(16), guidRemitoVenta)
            .input('guidFormaPago', sql.Char(16), guidPago)
            .input('guidCaja', sql.Char(16), guidCaja)
            .input('guidBanco', sql.Char(16), EMPTY_GUID)
            .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
            .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
            .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
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
    }

    await tx.commit();
    return {
      guidCambio: guidRemitoCambio,
      guidVenta: guidRemitoVenta,
      totalCambio,
      totalVenta,
      diferencia: diferencia > 0 ? diferencia : 0,
      formaPago: diferencia > 0.01 ? ((pagos && pagos.length > 0) ? pagos.map(p => p.tipo).join(', ') : tipoPago) : 'Sin cobro',
    };
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    throw err;
  }
}

// ============================================================================
// Detalle de una devolucion (para comprobante PDF)
// ============================================================================
async function GetDevolucionDetalle(guidRemitoDev) {
  const pool = await getPool();

  const devolucion = await pool.request()
    .input('guid', sql.Char(16), guidRemitoDev)
    .query(`
      SELECT rd.*, s.NOMBRE AS Sucursal, s.PUNTOVENTA,
             c.NOMBRE AS ClienteNombre, c.CUIT AS ClienteCuit,
             f.NUMERO_FACTURA AS NotaCreditoNumero, f.TIPO_COMPROBANTE AS NotaCreditoTipo
      FROM RemitosDevoluciones rd
      LEFT JOIN Sucursales s ON s.GUID = rd.GUIDSUCURSALES
      LEFT JOIN Clientes c ON c.GUID = rd.GUIDCLIENTES
      LEFT JOIN Facturas f ON f.GUID = rd.GUIDFACTURAS AND rd.GUIDFACTURAS <> ''
      WHERE rd.GUID = @guid
    `);

  const items = await pool.request()
    .input('guid', sql.Char(16), guidRemitoDev)
    .query(`
      SELECT mr.ARTICULO, mr.DESCRIPCION, mr.NUMERO AS TALLE, mr.CANTIDAD,
             mr.NETO AS PRECIOUNITARIO, mr.SUBTOTAL, mr.TOTAL
      FROM MovimientoRemitos mr
      WHERE mr.GUIDREMITOSDEVOLUCIONES = @guid AND (mr.dts IS NULL OR mr.dts = 0)
    `);

  const credito = await pool.request()
    .input('guid', sql.Char(16), guidRemitoDev)
    .query(`
      SELECT GUID, MONTOORIGINAL, MONTOUSADO, ESTADO,
             (MONTOORIGINAL - MONTOUSADO) AS MONTODISPONIBLE
      FROM CreditosDevoluciones
      WHERE GUIDREMITOSDEVOLUCIONES = @guid AND (dts IS NULL OR dts = 0)
    `);

  return {
    devolucion: devolucion.recordset[0] || null,
    items: items.recordset,
    credito: credito.recordset[0] || null,
  };
}

// ============================================================================
// Creditos disponibles de un cliente
// ============================================================================
async function GetCreditosCliente(guidCliente) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guidCliente', sql.Char(16), guidCliente)
    .query(`
      SELECT cd.GUID, cd.FECHA, cd.MONTOORIGINAL, cd.MONTOUSADO,
             (cd.MONTOORIGINAL - cd.MONTOUSADO) AS MONTODISPONIBLE,
             cd.ESTADO, cd.GUIDREMITOSDEVOLUCIONES,
             rd.NOMBRE AS DevolucionNombre, rd.FECHA AS DevolucionFecha
      FROM CreditosDevoluciones cd
      LEFT JOIN RemitosDevoluciones rd ON rd.GUID = cd.GUIDREMITOSDEVOLUCIONES
      WHERE cd.GUIDCLIENTES = @guidCliente
        AND cd.ESTADO = 'ACTIVO'
        AND (cd.MONTOORIGINAL - cd.MONTOUSADO) > 0
        AND (cd.dts IS NULL OR cd.dts = 0)
      ORDER BY cd.FECHA ASC
    `);
  return result.recordset;
}

module.exports = { CreateDevolucion, CreateCambioConVenta, GetDevolucionDetalle, GetCreditosCliente };
