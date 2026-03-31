const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToClarion, todayAR, dateToInt, timeToInt } = require('../../utils/guidHelper');

async function Create({ nombre, documento, cuit, direccion, email, celular, tipoIva, tipoFactura, codigoDocumentoAfip, limiteCredito, provincia, localidad, codigoPostal, observaciones, nombreEmpresa }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  const upper = v => (v || '').toUpperCase();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(CODIGO_CLIENTE), 0) + 1 AS Next FROM Clientes`);
  const codigoCliente = idResult.recordset[0].Next;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('codigoCliente', sql.Int, codigoCliente)
    .input('nombre', sql.VarChar(255), upper(nombre))
    .input('documento', sql.VarChar(20), documento || '')
    .input('cuit', sql.VarChar(20), cuit || '')
    .input('direccion', sql.VarChar(255), upper(direccion))
    .input('email', sql.VarChar(255), email || '')
    .input('celular', sql.VarChar(60), celular || '')
    .input('tipoIva', sql.VarChar(40), tipoIva || 'CONSUMIDOR FINAL')
    .input('tipoFactura', sql.Char(1), tipoFactura || 'B')
    .input('codigoDocumentoAfip', sql.SmallInt, codigoDocumentoAfip || 96)
    .input('limiteCredito', sql.Decimal(11, 2), limiteCredito != null ? limiteCredito : null)
    .input('provincia', sql.VarChar(255), upper(provincia))
    .input('localidad', sql.VarChar(255), upper(localidad))
    .input('codigoPostal', sql.Char(6), upper(codigoPostal))
    .input('observaciones', sql.VarChar(5000), upper(observaciones))
    .input('nombreEmpresa', sql.Char(100), upper(nombreEmpresa))
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO Clientes (GUID, CODIGO_CLIENTE, NOMBRE, DOCUMENTO, CUIT, DIRECCION, EMAIL, CELULAR,
        TIPO_IVA, TIPO_FACTURA, CODIGO_DOCUMENTO_AFIP, SALDO, LIMITE_CREDITO,
        PROVINCIA, LOCALIDAD, CODIGO_POSTAL, OBSERVACIONES, NOMBRE_EMPRESA, ts, sts)
      VALUES (@guid, @codigoCliente, @nombre, @documento, @cuit, @direccion, @email, @celular,
        @tipoIva, @tipoFactura, @codigoDocumentoAfip, 0, @limiteCredito,
        @provincia, @localidad, @codigoPostal, @observaciones, @nombreEmpresa, @ts, @sts)
    `);
  return { guid, codigoCliente };
}

async function GetAll(search, page = 1, limit = 30) {
  const pool = await getPool();
  let where = `WHERE (dts IS NULL OR dts = 0)`;
  const request = pool.request();
  if (search) {
    where += ` AND (NOMBRE LIKE @search OR CUIT LIKE @search OR DOCUMENTO LIKE @search)`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  const offset = (page - 1) * limit;
  request.input('offset', sql.Int, offset);
  request.input('limit', sql.Int, limit);

  const countResult = await request.query(`SELECT COUNT(*) AS total FROM Clientes ${where}`);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT GUID, CODIGO_CLIENTE, NOMBRE, CUENTA, DIRECCION, CUIT, DOCUMENTO,
           EMAIL, TELEFONO, CELULAR, TIPO_IVA, TIPO_FACTURA, SALDO,
           LIMITE_CREDITO, PERMITECREDITO, LOCALIDAD, PROVINCIA
    FROM Clientes
    ${where}
    ORDER BY NOMBRE
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  return { data: result.recordset, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT * FROM Clientes WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return result.recordset[0] || null;
}

async function GetCtaCte(search) {
  const pool = await getPool();
  let query = `
    SELECT GUID, CODIGO_CLIENTE, NOMBRE, CUENTA, DIRECCION, CUIT, DOCUMENTO,
           EMAIL, TELEFONO, CELULAR, TIPO_IVA, TIPO_FACTURA, SALDO,
           LIMITE_CREDITO, PERMITECREDITO, LOCALIDAD, PROVINCIA
    FROM Clientes
    WHERE (dts IS NULL OR dts = 0)
  `;
  const request = pool.request();
  if (search) {
    query += ` AND (NOMBRE LIKE @search OR CUIT LIKE @search OR DOCUMENTO LIKE @search)`;
    request.input('search', sql.VarChar, `%${search}%`);
  }
  query += ` ORDER BY NOMBRE`;
  const result = await request.query(query);
  return result.recordset;
}

async function ValidarCreditoCtaCte(guid, importeVenta) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT ISNULL(SALDO, 0) AS Saldo, ISNULL(LIMITE_CREDITO, 0) AS LimiteCredito FROM Clientes WHERE GUID = @guid`);
  const cliente = result.recordset[0];
  if (!cliente) return { ok: false, mensaje: 'Cliente no encontrado' };

  const limite = cliente.LimiteCredito;
  const saldo = cliente.Saldo;

  // Limite < 0 = sin tope de crédito
  if (limite < 0) return { ok: true, saldo, limite, mensaje: 'Sin límite de crédito' };

  // Limite > 0 = verificar que saldo + venta no supere el límite
  const nuevoSaldo = saldo + importeVenta;
  if (nuevoSaldo > limite) {
    return {
      ok: false,
      saldo,
      limite,
      nuevoSaldo,
      mensaje: `Supera el límite de crédito. Saldo actual: $${saldo.toFixed(2)}, Límite: $${limite.toFixed(2)}, Total con esta venta: $${nuevoSaldo.toFixed(2)}`
    };
  }

  return { ok: true, saldo, limite, nuevoSaldo, mensaje: 'OK' };
}

async function GetSaldo(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`SELECT ISNULL(SALDO, 0) AS Saldo FROM Clientes WHERE GUID = @guid`);
  return result.recordset[0] || { Saldo: 0 };
}

async function UpdateSaldo(guid, nuevoSaldo) {
  const pool = await getPool();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('saldo', sql.Decimal(13, 3), nuevoSaldo)
    .query(`UPDATE Clientes SET SALDO = @saldo WHERE GUID = @guid`);
}

async function RecalcularSaldos(guidCliente = null) {
  const pool = await getPool();
  const req = pool.request();
  if (guidCliente) req.input('guid', sql.Char(16), guidCliente);
  await req.query(`EXEC SP_RecalcularSaldoCliente ${guidCliente ? '@guid_cliente = @guid' : ''}`);
  return { ok: true };
}

async function GetMovimientos(guidCliente, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  request.input('guidCliente', sql.Char(16), guidCliente);

  let fechaFilterSaldo = '';
  let fechaFilterMain = '';
  if (desde) {
    request.input('desde', sql.Decimal(7), dateToClarion(desde));
    fechaFilterSaldo = ' AND cc.FECHA < @desde';
    fechaFilterMain = ' AND cc.FECHA >= @desde';
  }
  if (hasta) {
    request.input('hasta', sql.Decimal(7), dateToClarion(hasta));
    fechaFilterMain += ' AND cc.FECHA <= @hasta';
  }

  // Movimientos desde ControlComprobantes con saldo inicial y final
  const result = await request.query(`
    -- Movimientos del rango solicitado
    SELECT cc.GUID, cc.FECHA, cc.HORA, cc.CONCEPTO, cc.DEBE, cc.HABER,
           cc.CONCILIADO, cc.TIPOMOVIMIENTO,
           cc.GUIDREMITO, cc.GUIDREMITOSDEVOLUCIONES, cc.GUIDREMITOSCAMBIOS,
           r.NOMBRE AS RemNombre,
           COALESCE(f.NUMERO_FACTURA, fd.NUMERO_FACTURA) AS NUMERO_FACTURA,
           COALESCE(f.TIPO_COMPROBANTE, fd.TIPO_COMPROBANTE) AS FacturaTipo,
           cc.ts
    FROM ControlComprobantes cc
    LEFT JOIN Remitos r ON r.GUID = cc.GUIDREMITO AND cc.GUIDREMITO <> ''
    LEFT JOIN Facturas f ON f.GUIDREMITOS = cc.GUIDREMITO AND f.GUIDREMITOS <> '' AND (f.dts IS NULL OR f.dts = 0)
    LEFT JOIN RemitosDevoluciones rd ON rd.GUID = cc.GUIDREMITOSDEVOLUCIONES AND cc.GUIDREMITOSDEVOLUCIONES <> ''
    LEFT JOIN Facturas fd ON fd.GUID = rd.GUIDFACTURAS AND rd.GUIDFACTURAS <> '' AND (fd.dts IS NULL OR fd.dts = 0)
    WHERE cc.GUIDCLIENTE = @guidCliente AND (cc.dts IS NULL OR cc.dts = 0)
      ${fechaFilterMain}
    ORDER BY cc.FECHA ASC, cc.ts ASC;

    -- Saldo anterior (hasta dia anterior a @desde)
    SELECT ISNULL(SUM(cc.DEBE), 0) - ISNULL(SUM(cc.HABER), 0) AS SaldoAnterior
    FROM ControlComprobantes cc
    WHERE cc.GUIDCLIENTE = @guidCliente AND (cc.dts IS NULL OR cc.dts = 0)
      ${fechaFilterSaldo};
  `);

  const movimientos = result.recordsets[0] || [];
  const saldoAnterior = result.recordsets[1]?.[0]?.SaldoAnterior || 0;
  return { movimientos, saldoAnterior };
}

async function GetFacturas(guidCliente, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  request.input('guidCliente', sql.Char(16), guidCliente);
  let where = 'f.GUIDCLIENTES = @guidCliente AND (f.dts IS NULL OR f.dts = 0)';
  if (desde) { request.input('desde', sql.Decimal(7), dateToClarion(desde)); where += ' AND f.FECHA >= @desde'; }
  if (hasta) { request.input('hasta', sql.Decimal(7), dateToClarion(hasta)); where += ' AND f.FECHA <= @hasta'; }
  const result = await request.query(`
    SELECT f.GUID, f.NUMERO_FACTURA, f.TIPO_COMPROBANTE, f.TIPO_FACTURA,
           f.FECHA, f.TOTAL, f.NOMBRE, f.CUIT, f.CAE, f.PENDIENTE,
           f.GUIDREMITOS
    FROM Facturas f
    WHERE ${where}
    ORDER BY f.FECHA DESC, f.ts DESC
  `);
  return result.recordset;
}

// Deuda activa: comprobantes sin conciliar del cliente (ControlComprobantes)
async function GetDeudaActiva(guidCliente) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guidCliente', sql.Char(16), guidCliente)
    .query(`
      SELECT cc.GUID, cc.FECHA, cc.CONCEPTO, cc.DEBE, cc.HABER,
             cc.GUIDREMITO, cc.GUIDREMITOSDEVOLUCIONES, cc.GUIDREMITOSCAMBIOS,
             r.NOMBRE AS RemNombre, r.TOTAL AS RemTotal,
             cd.MONTOORIGINAL AS CreditoOriginal,
             cd.MONTOUSADO AS CreditoUsado
      FROM ControlComprobantes cc
      LEFT JOIN Remitos r ON r.GUID = cc.GUIDREMITO AND cc.GUIDREMITO <> ''
      LEFT JOIN CreditosDevoluciones cd ON cd.GUIDREMITOSDEVOLUCIONES = cc.GUIDREMITOSDEVOLUCIONES
        AND cc.GUIDREMITOSDEVOLUCIONES <> '' AND cc.HABER > 0 AND cc.DEBE = 0
        AND (cd.dts IS NULL OR cd.dts = 0)
      WHERE cc.GUIDCLIENTE = @guidCliente
        AND cc.CONCILIADO = 0
        AND (cc.dts IS NULL OR cc.dts = 0)
      ORDER BY cc.FECHA ASC, cc.ts ASC
    `);
  return result.recordset;
}

// Cobro de deuda: registra pagos contra movimientos pendientes de ctacte
// NO elimina ni modifica DEBE de MovimientoClientes.
// - Pago total: setea GUIDFORMAPAGOS en el movimiento original
// - Pago parcial: crea registro en PagosParcialesMovimientos
async function CobroDeuda({ guidCliente, guidSucursal, guidUsuario, items, pagos, total, emitirFactura, nombre, cuit }) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const fecha = dateToClarion();
    const guidCobro = newGuid();

    // 1. Registrar cada pago (FormaPagos + CajaDiaria + MovimientosCuentaBancos)
    let firstGuidCaja = '';
    for (const pago of pagos) {
      const guidPago = newGuid();
      const guidCaja = newGuid();
      if (!firstGuidCaja) firstGuidCaja = guidCaja;

      const tipoNombreCorto = (pago.tipoNombre || pago.descripcion || '').substring(0, 30);
      await tx.request()
        .input('guid', sql.Char(16), guidPago)
        .input('fecha', sql.Date, todayAR())
        .input('tipoComprobante', sql.VarChar(30), tipoNombreCorto)
        .input('descripcion', sql.Char(60), `Cobro Cta. Cte. ${guidCobro}`)
        .input('importe', sql.Decimal(13, 3), pago.importe)
        .input('importePagar', sql.Decimal(13, 2), pago.importe)
        .input('guidRemito', sql.Char(16), '')
        .input('guidFactura', sql.Char(16), '')
        .input('guidCliente', sql.Char(16), guidCliente)
        .input('guidCaja', sql.Char(16), guidCaja)
        .input('guidBanco', sql.Char(16), pago.guidBanco || '')
        .input('guidMovBanco', sql.Char(16), '')
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .query(`
          INSERT INTO FormaPagos (GUID, FECHA, TIPOCOMPROBANTE, DESCRIPCION, IMPORTE,
            IMPORTEPAGAR, GUIDREMITOS, GUIDFACTURAS, GUIDCLIENTES, GUIDCAJADIARIA, GUIDBANCOS,
            GUIDMOVIMIENTOBANCOS, ts, sts)
          VALUES (@guid, @fecha, @tipoComprobante, @descripcion, @importe,
            @importePagar, @guidRemito, @guidFactura, @guidCliente, @guidCaja, @guidBanco,
            @guidMovBanco, @ts, @sts)
        `);

      await tx.request()
        .input('guid', sql.Char(16), guidCaja)
        .input('fecha', sql.Date, todayAR())
        .input('tipoComprobante', sql.VarChar(40), tipoNombreCorto)
        .input('descripcion', sql.Char(60), `Cobro Cta. Cte. ${guidCobro}`)
        .input('debe', sql.Decimal(13, 2), pago.importe)
        .input('haber', sql.Decimal(13, 2), 0)
        .input('guidSucursal', sql.Char(16), guidSucursal)
        .input('guidBanco', sql.Char(16), pago.guidBanco || '')
        .input('guidBancosCuentas', sql.Char(16), pago.guidBancosCuentas || '')
        .input('guidFormaPago', sql.Char(16), guidPago)
        .input('guidCajaGastos', sql.Char(16), '')
        .input('guidCliente', sql.Char(16), guidCliente)
        .input('guidProveedor', sql.Char(16), '')
        .input('guidEmpleado', sql.Char(16), '')
        .input('guidUsuario', sql.Char(16), guidUsuario || '')
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

      // MovimientosCuentaBancos
      const guidMovBanco = newGuid();
      await tx.request()
        .input('guid', sql.Char(16), guidMovBanco)
        .input('fecha', sql.Date, todayAR())
        .input('debitos', sql.Decimal(13, 2), pago.importe)
        .input('creditos', sql.Decimal(13, 2), 0)
        .input('importe', sql.Decimal(13, 2), pago.importe)
        .input('guidConfig', sql.Char(16), '')
        .input('guidBanco', sql.Char(16), pago.guidBanco || '')
        .input('banco', sql.VarChar(100), '')
        .input('guidConceptoBanco', sql.Char(16), '')
        .input('concepto', sql.VarChar(100), '')
        .input('guidTipoMovBanco', sql.Char(16), '')
        .input('guidBancosCuentas', sql.Char(16), pago.guidBancosCuentas || '')
        .input('saldo', sql.Decimal(13, 2), 0)
        .input('descripcion', sql.VarChar(200), `Cobro Cta. Cte. ${guidCobro}`)
        .query(`
          INSERT INTO MovimientosCuentaBancos (GUID, ID, FECHA, DEBITOS, CREDITOS, IMPORTE,
            GUIDCONFIGURACION, GUIDBANCOS, BANCO, GUIDCONCEPTOBANCO, CONCEPTO,
            GuidTiposMovimientosCuentaBancos, GuidBancosCuentas, SALDO, DESCRIPCION)
          VALUES (@guid, (SELECT ISNULL(MAX(ID), 0) + 1 FROM MovimientosCuentaBancos),
            @fecha, @debitos, @creditos, @importe,
            @guidConfig, @guidBanco, @banco, @guidConceptoBanco, @concepto,
            @guidTipoMovBanco, @guidBancosCuentas, @saldo, @descripcion)
        `);

      // Vincular movimiento banco en FormaPagos
      await tx.request()
        .input('guidPago', sql.Char(16), guidPago)
        .input('guidMovBanco', sql.Char(16), guidMovBanco)
        .query(`UPDATE FormaPagos SET GUIDMOVIMIENTOBANCOS = @guidMovBanco WHERE GUID = @guidPago`);
    }

    // 2. Conciliar comprobantes seleccionados en ControlComprobantes
    //    item.guid ahora es el GUID de ControlComprobantes
    for (const item of items) {
      // Marcar conciliado en ControlComprobantes
      await tx.request()
        .input('guid', sql.Char(16), item.guid)
        .query(`
          UPDATE ControlComprobantes SET CONCILIADO = 1
          WHERE GUID = @guid AND (dts IS NULL OR dts = 0)
        `);

      // También marcar en MovimientoClientes (por el GUIDREMITO del CC)
      const ccInfo = await tx.request()
        .input('guid', sql.Char(16), item.guid)
        .query(`SELECT RTRIM(GUIDREMITO) AS GUIDREMITO FROM ControlComprobantes WHERE GUID = @guid`);
      const guidRemCC = (ccInfo.recordset[0]?.GUIDREMITO || '').trim();
      if (guidRemCC) {
        await tx.request()
          .input('guidRemito', sql.Char(16), guidRemCC)
          .input('guidFP', sql.Char(16), guidCobro)
          .query(`
            UPDATE MovimientoClientes SET GUIDFORMAPAGOS = @guidFP
            WHERE GUIDREMITOS = @guidRemito AND GUIDREMITOS <> ''
              AND (GUIDFORMAPAGOS = '' OR GUIDFORMAPAGOS IS NULL)
              AND (dts IS NULL OR dts = 0)
          `);
      }
    }

    // 3. Registrar movimiento HABER en MovimientoClientes (cobro recibido)
    //    Con GUIDFORMAPAGOS seteado para que NO aparezca en deuda activa
    const guidMovCli = newGuid();
    await tx.request()
      .input('guid', sql.Char(16), guidMovCli)
      .input('fecha', sql.Decimal(7), fecha)
      .input('cantidad', sql.SmallInt, 0)
      .input('articulo', sql.VarChar(255), '')
      .input('descripcion', sql.VarChar(2000), `Cobro Cta. Cte. ${guidCobro}`)
      .input('talle', sql.Decimal(7, 2), 0)
      .input('precioUnitario', sql.Decimal(11, 2), 0)
      .input('iva', sql.Decimal(5, 2), 0)
      .input('debe', sql.Decimal(13, 3), 0)
      .input('haber', sql.Decimal(13, 3), total)
      .input('saldo', sql.Decimal(13, 3), 0)
      .input('pago', sql.Char(10), '')
      .input('sucursal', sql.TinyInt, 0)
      .input('guidCliente', sql.Char(16), guidCliente)
      .input('guidArticulo', sql.Char(16), '')
      .input('guidRemito', sql.Char(16), '')
      .input('guidFormaPago', sql.Char(16), '')
      .input('guidCaja', sql.Char(16), '')
      .input('guidBanco', sql.Char(16), '')
      .input('guidMovBanco', sql.Char(16), '')
      .input('guidRemitoDev', sql.Char(16), '')
      .input('guidRemitoCambio', sql.Char(16), '')
      .input('guidFormaPagos', sql.Char(16), guidCobro)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .input('dts', sql.Float, 0)
      .query(`
        INSERT INTO MovimientoClientes (GUID, FECHA, CANTIDAD, ARTICULO, DESCRIPCION, TALLE,
          PRECIOUNITARIO, IVA, DEBE, HABER, SALDO, PAGO, SUCURSAL,
          GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
          GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
          GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDFORMAPAGOS, ts, sts, dts)
        VALUES (@guid, @fecha, @cantidad, @articulo, @descripcion, @talle,
          @precioUnitario, @iva, @debe, @haber, @saldo, @pago, @sucursal,
          @guidCliente, @guidArticulo, @guidRemito, @guidFormaPago,
          @guidCaja, @guidBanco, @guidMovBanco,
          @guidRemitoDev, @guidRemitoCambio, @guidFormaPagos, @ts, @sts, @dts)
      `);

    // 4. ControlComprobantes — COBRANZA CTA.CTE.
    const guidCCCobro = newGuid();
    await tx.request()
      .input('guid', sql.Char(16), guidCCCobro)
      .input('fecha', sql.Int, fecha)
      .input('hora', sql.Int, timeToInt())
      .input('concepto', sql.VarChar(255), 'COBRANZA CTA.CTE.')
      .input('debe', sql.Decimal(13, 3), 0)
      .input('haber', sql.Decimal(13, 3), total)
      .input('conciliado', sql.TinyInt, 1)
      .input('tipoMov', sql.TinyInt, 2)
      .input('guidCliente', sql.Char(16), guidCliente)
      .input('guidRemito', sql.Char(16), '')
      .input('guidRemDev', sql.Char(16), '')
      .input('guidRemCambio', sql.Char(16), '')
      .input('guidCaja', sql.Char(16), firstGuidCaja)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO ControlComprobantes (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER,
          CONCILIADO, TIPOMOVIMIENTO, GUIDCLIENTE, GUIDREMITO,
          GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA, ts, sts)
        VALUES (@guid, @fecha, @hora, @concepto, @debe, @haber,
          @conciliado, @tipoMov, @guidCliente, @guidRemito,
          @guidRemDev, @guidRemCambio, @guidCaja, @ts, @sts)
      `);

    // 5. Recalcular saldo del cliente via SP
    await tx.request()
      .input('guid', sql.Char(16), guidCliente)
      .query(`EXEC SP_RecalcularSaldoCliente @guid_cliente = @guid`);

    // 6. Generar factura (Recibo) si se solicitó
    let guidFactura = null;
    let facturaNumero = null;
    if (emitirFactura) {
      guidFactura = newGuid();

      let tipoFactura = 'B';
      let tipoIvaCliente = '';
      let direccionCliente = '';
      if (guidCliente) {
        const cliRes = await tx.request()
          .input('guidCli', sql.Char(16), guidCliente)
          .query(`SELECT TIPO_FACTURA, TIPO_IVA, DIRECCION FROM Clientes WHERE GUID = @guidCli`);
        const cli = cliRes.recordset[0];
        if (cli) {
          if (cli.TIPO_FACTURA) tipoFactura = (cli.TIPO_FACTURA || 'B').trim().toUpperCase();
          tipoIvaCliente = (cli.TIPO_IVA || '').trim();
          direccionCliente = (cli.DIRECCION || '').trim();
        }
      }

      const esFacturaA = tipoFactura === 'A';
      const tipoComp = esFacturaA ? 'RCA' : 'RCB';

      const sucRes = await tx.request()
        .input('guidSuc', sql.Char(16), guidSucursal)
        .query(`SELECT PUNTOVENTA, ULTIMAFACTURAA, ULTIMAFACTURAB, IDCOMPROBANTEFACA, IDCOMPROBANTEFACB, GUIDCONFIGURACION FROM Sucursales WHERE GUID = @guidSuc`);
      const suc = sucRes.recordset[0] || {};
      const puntoVenta = suc.PUNTOVENTA || 1;
      const ultimaFactura = esFacturaA ? (suc.ULTIMAFACTURAA || 0) : (suc.ULTIMAFACTURAB || 0);
      const numeroFactura = ultimaFactura + 1;
      const idComp = esFacturaA ? (suc.IDCOMPROBANTEFACA || 1) : (suc.IDCOMPROBANTEFACB || 6);
      const guidConfig = suc.GUIDCONFIGURACION || '';
      const numFacturaStr = `${String(puntoVenta).padStart(4, '0')}-${String(numeroFactura).padStart(8, '0')}`;

      let totalNeto21, totalIva21;
      if (esFacturaA) {
        totalNeto21 = Math.round((total / 1.21) * 100) / 100;
        totalIva21 = Math.round((totalNeto21 * 0.21) * 100) / 100;
      } else {
        totalNeto21 = total;
        totalIva21 = 0;
      }

      await tx.request()
        .input('guid', sql.Char(16), guidFactura)
        .input('guidCliente', sql.Char(16), guidCliente)
        .input('guidRemito', sql.Char(16), '')
        .input('guidConfig', sql.Char(16), guidConfig)
        .input('ts', sql.Float, ts)
        .input('sts', sql.Float, ts)
        .input('idComp', sql.Int, idComp)
        .input('numFactura', sql.Char(13), numFacturaStr)
        .input('puntoVenta', sql.Int, puntoVenta)
        .input('numero', sql.Int, numeroFactura)
        .input('tipoComp', sql.Char(3), tipoComp)
        .input('tipoFactura', sql.Char(1), tipoFactura)
        .input('fecha', sql.Decimal(7), fecha)
        .input('nombre', sql.Char(100), nombre || 'CONSUMIDOR FINAL')
        .input('cuit', sql.Char(13), cuit || '')
        .input('total', sql.Decimal(15, 2), total)
        .input('neto21', sql.Decimal(15, 2), totalNeto21)
        .input('iva21', sql.Decimal(15, 2), totalIva21)
        .input('tipoIva', sql.NVarChar, tipoIvaCliente || null)
        .input('fechaVencimiento', sql.Date, todayAR())
        .input('fechaServDesde', sql.Date, todayAR())
        .input('fechaServHasta', sql.Date, todayAR())
        .input('direccion', sql.NVarChar, direccionCliente || null)
        .query(`
          INSERT INTO Facturas (GUID, GUIDCLIENTES, GUIDREMITOS, GUIDCONFIGURACION, ts, sts,
            CODIGO_CONFIGURACION, CODIGO_IMPUTACION, CODIGO_VENDEDOR, VENDEDOR_NOMBRE,
            CODIGO_DOCUMENTO_AFIP, CODIGO_CONCEPTO_AFIP, IDCOMP,
            NUMERO_FACTURA, PUNTOVENTA, NUMERO, NUMEROHASTA,
            TIPO_COMPROBANTE, TIPO_FACTURA, TIPO_IVA, FECHA, FECHA_VENCIMIENTO,
            FECHASERVDESDE, FECHASERVHASTA, NOMBRE, DIRECCION, CUIT,
            TOTAL, TOTAL_NETO21, TOTAL_IVA21, TOTAL_NETO0, TOTAL_IVA0,
            TOTAL_EXENTO, TOTAL_NOGRAVADO, PENDIENTE,
            DATEADDED, TIMEADDED)
          VALUES (@guid, @guidCliente, @guidRemito, @guidConfig, @ts, @sts,
            1, 0, 0, '',
            80, 1, @idComp,
            @numFactura, @puntoVenta, @numero, @numero,
            @tipoComp, @tipoFactura, @tipoIva, @fecha, @fechaVencimiento,
            @fechaServDesde, @fechaServHasta, @nombre, @direccion, @cuit,
            @total, @neto21, @iva21, 0, 0,
            0, 0, 0,
            ${dateToInt()}, ${timeToInt()})
        `);

      await tx.request()
        .input('guidSuc', sql.Char(16), guidSucursal)
        .input('numero', sql.Int, numeroFactura)
        .query(esFacturaA
          ? `UPDATE Sucursales SET ULTIMAFACTURAA = @numero WHERE GUID = @guidSuc`
          : `UPDATE Sucursales SET ULTIMAFACTURAB = @numero WHERE GUID = @guidSuc`
        );

      facturaNumero = numFacturaStr;
    }

    await tx.commit();
    return { ok: true, total, guidCobro, guidFactura, factura: facturaNumero };
  } catch (err) {
    try { await tx.rollback(); } catch (_) {}
    throw err;
  }
}

async function UpdateContacto(guid, { email, celular }) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('email', sql.VarChar(255), email || '')
    .input('celular', sql.VarChar(60), celular || '')
    .input('ts', sql.Float, ts)
    .query(`UPDATE Clientes SET EMAIL = @email, CELULAR = @celular, ts = @ts WHERE GUID = @guid`);
}

module.exports = { Create, GetAll, GetByGuid, GetCtaCte, ValidarCreditoCtaCte, GetSaldo, UpdateSaldo, RecalcularSaldos, GetMovimientos, GetFacturas, GetDeudaActiva, CobroDeuda, UpdateContacto };
