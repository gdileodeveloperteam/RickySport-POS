const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToInt, timeToInt, dateToClarion } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

// ============================================================================
// Devolución: reingresa mercadería y registra en RemitosDevoluciones
// ============================================================================
async function CreateDevolucion({ guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, items, motivo, tipoDevolucion }) {
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

      const guidMovCli = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidMovCli)
        .input('fecha', sql.Decimal(7), dateToClarion())
        .input('descripcion', sql.VarChar(2000), `Devolucion - ${motivo || 'Sin motivo'}`)
        .input('debe', sql.Decimal(13, 3), 0)
        .input('haber', sql.Decimal(13, 3), totalDevolucion)
        .input('guidCliente', sql.Char(16), guidCliente)
        .input('guidArticulo', sql.Char(16), EMPTY_GUID)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
        .input('guidCaja', sql.Char(16), EMPTY_GUID)
        .input('guidBanco', sql.Char(16), EMPTY_GUID)
        .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoDev', sql.Char(16), guidRemitoDev)
        .input('guidRemitoCambio', sql.Char(16), EMPTY_GUID)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoClientes (GUID, FECHA, DESCRIPCION, DEBE, HABER,
            GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
            GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
            GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, ts, sts)
          VALUES (@guid, @fecha, @descripcion, @debe, @haber,
            @guidCliente, @guidArticulo, @guidRemito, @guidFormaPago,
            @guidCaja, @guidBanco, @guidMovBanco,
            @guidRemitoDev, @guidRemitoCambio, @ts, @sts)
        `);
    }

    await tx.commit();
    return { guid: guidRemitoDev, total: totalDevolucion };
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
      const guidMovCliCambio = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidMovCliCambio)
        .input('fecha', sql.Decimal(7), dateToClarion())
        .input('descripcion', sql.VarChar(2000), `Cambio - Credito por devolucion de mercaderia`)
        .input('debe', sql.Decimal(13, 3), 0)
        .input('haber', sql.Decimal(13, 3), totalCambio)
        .input('guidCliente', sql.Char(16), guidCliente)
        .input('guidArticulo', sql.Char(16), EMPTY_GUID)
        .input('guidRemito', sql.Char(16), EMPTY_GUID)
        .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
        .input('guidCaja', sql.Char(16), EMPTY_GUID)
        .input('guidBanco', sql.Char(16), EMPTY_GUID)
        .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoClientes (GUID, FECHA, DESCRIPCION, DEBE, HABER,
            GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
            GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
            GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, ts, sts)
          VALUES (@guid, @fecha, @descripcion, @debe, @haber,
            @guidCliente, @guidArticulo, @guidRemito, @guidFormaPago,
            @guidCaja, @guidBanco, @guidMovBanco,
            @guidRemitoDev, @guidRemitoCambio, @ts, @sts)
        `);

      // MovimientoClientes de la nueva venta (debito al cliente)
      const guidMovCliVenta = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidMovCliVenta)
        .input('fecha', sql.Decimal(7), dateToClarion())
        .input('descripcion', sql.VarChar(2000), `Cambio - Debito por nueva mercaderia`)
        .input('debe', sql.Decimal(13, 3), totalVenta)
        .input('haber', sql.Decimal(13, 3), 0)
        .input('guidCliente', sql.Char(16), guidCliente)
        .input('guidArticulo', sql.Char(16), EMPTY_GUID)
        .input('guidRemito', sql.Char(16), guidRemitoVenta)
        .input('guidFormaPago', sql.Char(16), EMPTY_GUID)
        .input('guidCaja', sql.Char(16), EMPTY_GUID)
        .input('guidBanco', sql.Char(16), EMPTY_GUID)
        .input('guidMovBanco', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoDev', sql.Char(16), EMPTY_GUID)
        .input('guidRemitoCambio', sql.Char(16), guidRemitoCambio)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO MovimientoClientes (GUID, FECHA, DESCRIPCION, DEBE, HABER,
            GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
            GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
            GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, ts, sts)
          VALUES (@guid, @fecha, @descripcion, @debe, @haber,
            @guidCliente, @guidArticulo, @guidRemito, @guidFormaPago,
            @guidCaja, @guidBanco, @guidMovBanco,
            @guidRemitoDev, @guidRemitoCambio, @ts, @sts)
        `);
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
            .input('descripcion', sql.VarChar(2000), `Cambio - Cta. Cte. (diferencia)`)
            .input('debe', sql.Decimal(13, 3), pago.importe)
            .input('haber', sql.Decimal(13, 3), 0)
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
            .query(`
              INSERT INTO MovimientoClientes (GUID, FECHA, DESCRIPCION, DEBE, HABER,
                GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
                GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
                GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, ts, sts)
              VALUES (@guid, @fecha, @descripcion, @debe, @haber,
                @guidCliente, @guidArticulo, @guidRemito, @guidFormaPago,
                @guidCaja, @guidBanco, @guidMovBanco,
                @guidRemitoDev, @guidRemitoCambio, @ts, @sts)
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

module.exports = { CreateDevolucion, CreateCambioConVenta };
