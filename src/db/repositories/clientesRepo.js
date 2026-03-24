const { getPool, sql } = require('../pool');
const { newGuid, tsNow, dateToClarion, todayAR, dateToInt, timeToInt } = require('../../utils/guidHelper');

async function Create({ nombre, documento, cuit, direccion, email, celular, tipoIva, tipoFactura, codigoDocumentoAfip }) {
  const pool = await getPool();
  const guid = newGuid();
  const ts = tsNow();
  const idResult = await pool.request().query(`SELECT ISNULL(MAX(CODIGO_CLIENTE), 0) + 1 AS Next FROM Clientes`);
  const codigoCliente = idResult.recordset[0].Next;
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('codigoCliente', sql.Int, codigoCliente)
    .input('nombre', sql.VarChar(255), nombre)
    .input('documento', sql.VarChar(20), documento || '')
    .input('cuit', sql.VarChar(20), cuit || '')
    .input('direccion', sql.VarChar(255), direccion || '')
    .input('email', sql.VarChar(255), email || '')
    .input('celular', sql.VarChar(60), celular || '')
    .input('tipoIva', sql.VarChar(40), tipoIva || 'CONSUMIDOR FINAL')
    .input('tipoFactura', sql.Char(1), tipoFactura || 'B')
    .input('codigoDocumentoAfip', sql.SmallInt, codigoDocumentoAfip || 96)
    .input('ts', sql.Float, ts)
    .input('sts', sql.Float, ts)
    .query(`
      INSERT INTO Clientes (GUID, CODIGO_CLIENTE, NOMBRE, DOCUMENTO, CUIT, DIRECCION, EMAIL, CELULAR,
        TIPO_IVA, TIPO_FACTURA, CODIGO_DOCUMENTO_AFIP, SALDO, ts, sts)
      VALUES (@guid, @codigoCliente, @nombre, @documento, @cuit, @direccion, @email, @celular,
        @tipoIva, @tipoFactura, @codigoDocumentoAfip, 0, @ts, @sts)
    `);
  return { guid, codigoCliente };
}

async function GetAll(search) {
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

async function RecalcularSaldos() {
  const pool = await getPool();

  // 1. Reconciliar movimientos legacy: marcar HABER "Ingreso por venta"
  //    y TODOS los DEBE del mismo GUIDREMITOS como saldados
  const reconciled = await pool.request().query(`
    ;WITH RemitosConIngreso AS (
      SELECT DISTINCT RTRIM(mc.GUIDREMITOS) AS GuidRemito
      FROM MovimientoClientes mc
      WHERE mc.DESCRIPCION LIKE '%Ingreso por venta %'
        AND mc.HABER > 0
        AND mc.GUIDREMITOS <> ''
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
        AND (mc.dts IS NULL OR mc.dts = 0)
    )
    UPDATE mc
    SET mc.GUIDFORMAPAGOS = 'RECONCILIADO'
    FROM MovimientoClientes mc
    INNER JOIN RemitosConIngreso r ON RTRIM(mc.GUIDREMITOS) = r.GuidRemito
    WHERE (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
      AND (mc.dts IS NULL OR mc.dts = 0)
  `);
  const reconciliados = reconciled.rowsAffected[0] || 0;

  // 2. Reconciliar cobros legacy: HABER "Cobro Cta. Cte." sin GUIDFORMAPAGOS
  await pool.request().query(`
    UPDATE MovimientoClientes
    SET GUIDFORMAPAGOS = 'RECONCILIADO'
    WHERE DESCRIPCION LIKE 'Cobro Cta. Cte.%'
      AND HABER > 0
      AND (GUIDFORMAPAGOS = '' OR GUIDFORMAPAGOS IS NULL)
      AND (dts IS NULL OR dts = 0)
  `);

  // 3. Recalcular saldos: movimientos pendientes - pagos parciales
  const result = await pool.request().query(`
    UPDATE c
    SET c.SALDO = ISNULL(mov.SaldoReal, 0)
    FROM Clientes c
    CROSS APPLY (
      SELECT SUM(ISNULL(mc.DEBE, 0)) - ISNULL(SUM(pp.TotalParcial), 0) - SUM(ISNULL(mc.HABER, 0)) AS SaldoReal
      FROM MovimientoClientes mc
      LEFT JOIN (
        SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
        FROM PagosParcialesMovimientos WHERE (dts IS NULL OR dts = 0)
        GROUP BY GUIDMOVIMIENTOCLIENTES
      ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
      WHERE mc.GUIDCLIENTES = c.GUID
        AND (mc.dts IS NULL OR mc.dts = 0)
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
    ) mov
    WHERE c.SALDO <> ISNULL(mov.SaldoReal, 0)
      AND (c.dts IS NULL OR c.dts = 0)
  `);
  const saldosActualizados = result.rowsAffected[0] || 0;

  return { actualizados: saldosActualizados, reconciliados };
}

async function GetMovimientos(guidCliente, desde, hasta) {
  const pool = await getPool();
  const request = pool.request();
  request.input('guidCliente', sql.Char(16), guidCliente);

  let fechaFilterSaldo = '';
  let fechaFilterMain = '';
  if (desde) {
    request.input('desde', sql.Decimal(7), dateToClarion(desde));
    fechaFilterSaldo = ' AND FECHA < @desde';
    fechaFilterMain = ' AND FECHA >= @desde';
  }
  if (hasta) {
    request.input('hasta', sql.Decimal(7), dateToClarion(hasta));
    fechaFilterMain += ' AND FECHA <= @hasta';
  }

  // Vista unificada: MovimientoClientes + Ventas + Devoluciones no representadas en MC
  const result = await request.query(`
    ;WITH MovimientosCompletos AS (
      -- 1. MovimientoClientes existentes
      SELECT mc.GUID, mc.FECHA, mc.DESCRIPCION, mc.DEBE, mc.HABER,
             mc.GUIDREMITOS, mc.GUIDREMITOSDEVOLUCIONES, mc.GUIDFORMAPAGOS, mc.ts,
             ISNULL(pp.TotalParcial, 0) AS TOTALPARCIAL
      FROM MovimientoClientes mc
      LEFT JOIN (
        SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
        FROM PagosParcialesMovimientos WHERE (dts IS NULL OR dts = 0)
        GROUP BY GUIDMOVIMIENTOCLIENTES
      ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
      WHERE mc.GUIDCLIENTES = @guidCliente AND (mc.dts IS NULL OR mc.dts = 0)

      UNION ALL

      -- 2. Ventas (Remitos) sin entrada en MC (pagadas con efectivo/credito/tarjeta)
      SELECT r.GUID, r.FECHA, CAST('Venta - ' + RTRIM(ISNULL(r.NOMBRE, '')) AS VARCHAR(2000)),
             r.TOTAL AS DEBE, 0 AS HABER,
             r.GUID AS GUIDREMITOS, '' AS GUIDREMITOSDEVOLUCIONES,
             'PAGADO' AS GUIDFORMAPAGOS, r.ts, 0 AS TOTALPARCIAL
      FROM Remitos r
      WHERE r.GUIDCLIENTES = @guidCliente AND (r.dts IS NULL OR r.dts = 0)
        AND NOT EXISTS (
          SELECT 1 FROM MovimientoClientes mc2
          WHERE mc2.GUIDREMITOS = r.GUID AND (mc2.dts IS NULL OR mc2.dts = 0)
        )
        AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)

      UNION ALL

      -- 3. Devoluciones sin entrada en MC
      SELECT rd.GUID, rd.FECHA, CAST('Devolucion - ' + RTRIM(ISNULL(rd.NOMBRE, '')) AS VARCHAR(2000)),
             0 AS DEBE, rd.TOTAL AS HABER,
             '' AS GUIDREMITOS, rd.GUID AS GUIDREMITOSDEVOLUCIONES,
             CASE WHEN cd.ESTADO = 'CONSUMIDO' THEN 'CONSUMIDO' ELSE '' END AS GUIDFORMAPAGOS,
             rd.ts, 0 AS TOTALPARCIAL
      FROM RemitosDevoluciones rd
      LEFT JOIN CreditosDevoluciones cd ON cd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (cd.dts IS NULL OR cd.dts = 0)
      WHERE rd.GUIDCLIENTES = @guidCliente AND (rd.dts IS NULL OR rd.dts = 0)
        AND NOT EXISTS (
          SELECT 1 FROM MovimientoClientes mc3
          WHERE mc3.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (mc3.dts IS NULL OR mc3.dts = 0)
        )
    )
    SELECT GUID, FECHA, DESCRIPCION, DEBE, HABER, GUIDREMITOS, GUIDREMITOSDEVOLUCIONES, GUIDFORMAPAGOS, TOTALPARCIAL
    FROM MovimientosCompletos
    WHERE 1=1 ${fechaFilterMain}
    ORDER BY FECHA ASC, ts ASC;

    -- Saldo anterior (solo movimientos pendientes, descontando pagos parciales)
    SELECT ISNULL(SUM(sub.DEBE), 0) - ISNULL(SUM(sub.PARCIAL), 0) - ISNULL(SUM(sub.HABER), 0) AS SaldoAnterior
    FROM (
      SELECT mc.DEBE, mc.HABER, ISNULL(pp.TotalParcial, 0) AS PARCIAL, mc.FECHA
      FROM MovimientoClientes mc
      LEFT JOIN (
        SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
        FROM PagosParcialesMovimientos WHERE (dts IS NULL OR dts = 0)
        GROUP BY GUIDMOVIMIENTOCLIENTES
      ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
      WHERE mc.GUIDCLIENTES = @guidCliente AND (mc.dts IS NULL OR mc.dts = 0)
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
      UNION ALL
      SELECT r.TOTAL AS DEBE, 0 AS HABER, 0 AS PARCIAL, r.FECHA
      FROM Remitos r
      WHERE r.GUIDCLIENTES = @guidCliente AND (r.dts IS NULL OR r.dts = 0)
        AND NOT EXISTS (SELECT 1 FROM MovimientoClientes mc2 WHERE mc2.GUIDREMITOS = r.GUID AND (mc2.dts IS NULL OR mc2.dts = 0))
        AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)
      UNION ALL
      SELECT 0 AS DEBE, rd.TOTAL AS HABER, 0 AS PARCIAL, rd.FECHA
      FROM RemitosDevoluciones rd
      LEFT JOIN CreditosDevoluciones cd ON cd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (cd.dts IS NULL OR cd.dts = 0)
      WHERE rd.GUIDCLIENTES = @guidCliente AND (rd.dts IS NULL OR rd.dts = 0)
        AND NOT EXISTS (SELECT 1 FROM MovimientoClientes mc3 WHERE mc3.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (mc3.dts IS NULL OR mc3.dts = 0))
        AND (cd.ESTADO IS NULL OR cd.ESTADO <> 'CONSUMIDO')
    ) sub
    WHERE 1=1 ${fechaFilterSaldo};
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

// Deuda activa: movimientos pendientes (sin GUIDFORMAPAGOS), descontando pagos parciales
async function GetDeudaActiva(guidCliente) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guidCliente', sql.Char(16), guidCliente)
    .query(`
      SELECT mc.GUID, mc.FECHA, mc.DESCRIPCION, mc.DEBE, mc.HABER,
             mc.GUIDREMITOS, mc.GUIDREMITOSDEVOLUCIONES, mc.GUIDREMITOSCAMBIOS,
             r.NOMBRE AS RemNombre, r.TOTAL AS RemTotal,
             COALESCE(f.NUMERO_FACTURA, fd.NUMERO_FACTURA) AS NUMERO_FACTURA,
             COALESCE(f.TIPO_COMPROBANTE, fd.TIPO_COMPROBANTE) AS FacturaTipo,
             ISNULL(pp.TotalParcial, 0) AS TOTALPARCIAL,
             mc.DEBE - ISNULL(pp.TotalParcial, 0) AS PENDIENTE
      FROM MovimientoClientes mc
      LEFT JOIN Remitos r ON r.GUID = mc.GUIDREMITOS AND mc.GUIDREMITOS <> ''
      LEFT JOIN Facturas f ON f.GUIDREMITOS = mc.GUIDREMITOS AND f.GUIDREMITOS <> '' AND (f.dts IS NULL OR f.dts = 0)
      LEFT JOIN RemitosDevoluciones rd ON rd.GUID = mc.GUIDREMITOSDEVOLUCIONES AND mc.GUIDREMITOSDEVOLUCIONES <> ''
      LEFT JOIN Facturas fd ON fd.GUID = rd.GUIDFACTURAS AND rd.GUIDFACTURAS <> '' AND (fd.dts IS NULL OR fd.dts = 0)
      LEFT JOIN (
        SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
        FROM PagosParcialesMovimientos
        WHERE (dts IS NULL OR dts = 0)
        GROUP BY GUIDMOVIMIENTOCLIENTES
      ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
      WHERE mc.GUIDCLIENTES = @guidCliente
        AND (mc.dts IS NULL OR mc.dts = 0)
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
        AND (mc.DEBE > 0 OR mc.HABER > 0)
      ORDER BY mc.FECHA ASC, mc.ts ASC
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
    for (const pago of pagos) {
      const guidPago = newGuid();
      const guidCaja = newGuid();

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

    // 2. Imputar comprobantes: NUNCA eliminar ni reducir DEBE
    for (const item of items) {
      if (item.esParcial) {
        // Pago parcial: registrar en PagosParcialesMovimientos (mantiene DEBE original)
        const guidParcial = newGuid();
        await tx.request()
          .input('guid', sql.Char(16), guidParcial)
          .input('guidMovCli', sql.Char(16), item.guid)
          .input('guidFP', sql.Char(16), guidCobro)
          .input('importe', sql.Decimal(13, 3), item.importe)
          .input('fecha', sql.Date, todayAR())
          .input('ts', sql.Float, ts)
          .input('sts', sql.Float, ts)
          .query(`
            INSERT INTO PagosParcialesMovimientos (GUID, GUIDMOVIMIENTOCLIENTES, GUIDFORMAPAGOS,
              IMPORTEPAGADO, FECHA, ts, sts)
            VALUES (@guid, @guidMovCli, @guidFP, @importe, @fecha, @ts, @sts)
          `);

        // Verificar si con este pago se completa el total del comprobante
        const checkRes = await tx.request()
          .input('guidMovCli', sql.Char(16), item.guid)
          .query(`
            SELECT mc.DEBE, ISNULL(SUM(pp.IMPORTEPAGADO), 0) AS TotalPagado
            FROM MovimientoClientes mc
            LEFT JOIN PagosParcialesMovimientos pp
              ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID AND (pp.dts IS NULL OR pp.dts = 0)
            WHERE mc.GUID = @guidMovCli
            GROUP BY mc.DEBE
          `);
        const row = checkRes.recordset[0];
        if (row && row.TotalPagado >= row.DEBE - 0.01) {
          // Completado: marcar como cobrado para que no aparezca en deuda activa
          await tx.request()
            .input('guid', sql.Char(16), item.guid)
            .input('guidFP', sql.Char(16), guidCobro)
            .query(`UPDATE MovimientoClientes SET GUIDFORMAPAGOS = @guidFP WHERE GUID = @guid`);
        }
      } else {
        // Pago total: marcar GUIDFORMAPAGOS (NO se toca dts ni DEBE)
        await tx.request()
          .input('guid', sql.Char(16), item.guid)
          .input('guidFP', sql.Char(16), guidCobro)
          .query(`UPDATE MovimientoClientes SET GUIDFORMAPAGOS = @guidFP WHERE GUID = @guid`);
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

    // 4. Actualizar saldo del cliente
    await tx.request()
      .input('guid', sql.Char(16), guidCliente)
      .input('importe', sql.Decimal(13, 3), total)
      .query(`UPDATE Clientes SET SALDO = ISNULL(SALDO, 0) - @importe WHERE GUID = @guid`);

    // 5. Generar factura (Recibo) si se solicitó
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

module.exports = { Create, GetAll, GetByGuid, GetCtaCte, ValidarCreditoCtaCte, GetSaldo, UpdateSaldo, RecalcularSaldos, GetMovimientos, GetFacturas, GetDeudaActiva, CobroDeuda };
