const { getPool, sql } = require('../pool');
const { getMysqlPool } = require('../mysqlPool');
const { newGuid, tsNow, dateToInt, timeToInt } = require('../../utils/guidHelper');

/**
 * Autorizar factura en ARCA: busca/crea cliente en MySQL y carga factura + movimientos
 */
async function AutorizarFactura(guidFactura) {
  const pool = await getPool();
  const mysql = getMysqlPool();

  // 1. Traer factura completa desde SQL Server
  const facResult = await pool.request()
    .input('guid', sql.Char(16), guidFactura)
    .query(`
      SELECT f.*, RTRIM(c.GUID) AS GuidClienteApp
      FROM Facturas f
      LEFT JOIN Clientes c ON RTRIM(c.GUID) = RTRIM(f.GUIDCLIENTES)
      WHERE RTRIM(f.GUID) = @guid
    `);

  const factura = facResult.recordset[0];
  if (!factura) throw new Error('Factura no encontrada');

  // Traer items del remito vinculado
  const guidRemito = (factura.GUIDREMITOS || '').trim();
  let items = [];
  if (guidRemito) {
    const itemsResult = await pool.request()
      .input('guidRemito', sql.Char(16), guidRemito)
      .query(`
        SELECT ARTICULO, DESCRIPCION, NUMERO, CANTIDAD, NETO, SUBTOTAL, TOTAL
        FROM MovimientoRemitos
        WHERE GUIDREMITOS = @guidRemito AND (dts IS NULL OR dts = 0)
      `);
    items = itemsResult.recordset;
  }

  // 2. Preparar CUIT: solo números (sin puntos ni guiones)
  const cuitRaw = (factura.CUIT || '').trim().replace(/[.\-]/g, '');
  const nombre = (factura.NOMBRE || '').trim();
  const guidClienteApp = (factura.GuidClienteApp || '').trim();

  // 3. Buscar cliente en MySQL por CUIT
  let guidClienteMySQL = null;

  // Determinar tipo IVA y código documento AFIP desde la factura
  const tipoIva = (factura.TIPO_IVA || '').trim();
  const tipoIvaUpper = tipoIva.toUpperCase();
  let tipoIvaFinal;
  let codigoIva = 5; // default Consumidor Final
  let idComp = 0;
  if (!tipoIva || tipoIvaUpper.includes('CONSUMIDOR') || tipoIvaUpper === 'C') {
    tipoIvaFinal = 'CONS.FINAL';
    codigoIva = 5;
  } else if (tipoIvaUpper.includes('INSCRIPTO') || tipoIvaUpper === 'I' || tipoIvaUpper === 'INS') {
    tipoIvaFinal = 'RESP.INSCRIPTO';
    codigoIva = 1;
  } else if (tipoIvaUpper.includes('EXENTO') || tipoIvaUpper === 'E') {
    tipoIvaFinal = tipoIva;
    codigoIva = 4;
  } else if (tipoIvaUpper.includes('MONOTRIBUTO') || tipoIvaUpper === 'M') {
    tipoIvaFinal = tipoIva;
    codigoIva = 6;
  } else {
    tipoIvaFinal = tipoIva;
  }
  let codDocAfip = 99;
  let descDocAfip = 'Doc. Unico';

  if (tipoIvaUpper.includes('INSCRIPTO') || tipoIvaUpper === 'I' || tipoIvaUpper === 'INS') {
    codDocAfip = 80;
    descDocAfip = 'CUIT';
  } else if (tipoIvaUpper.includes('EXENTO') || tipoIvaUpper === 'E') {
    codDocAfip = 80;
    descDocAfip = 'CUIT';
  } else if (tipoIvaUpper.includes('MONOTRIBUTO') || tipoIvaUpper === 'M') {
    codDocAfip = 80;
    descDocAfip = 'CUIT';
  }

  // Traer datos extra del cliente en SQL Server
  let direccion = (factura.DIRECCION || '').trim();
  let email = '';
  let celular = '';
  let provincia = '';
  let localidad = '';
  let codigoPostal = '';
  let telefono = '';

  if (guidClienteApp) {
    const cliResult = await pool.request()
      .input('guid', sql.Char(16), guidClienteApp)
      .query(`
        SELECT RTRIM(DIRECCION) AS DIRECCION, RTRIM(EMAIL) AS EMAIL,
               RTRIM(PROVINCIA) AS PROVINCIA, RTRIM(LOCALIDAD) AS LOCALIDAD,
               RTRIM(CODIGO_POSTAL) AS CODIGO_POSTAL, RTRIM(TELEFONO) AS TELEFONO,
               RTRIM(CELULAR) AS CELULAR
        FROM Clientes WHERE GUID = @guid
      `);
    const cli = cliResult.recordset[0];
    if (cli) {
      direccion = cli.DIRECCION || direccion;
      email = cli.EMAIL || '';
      celular = cli.CELULAR || '';
      provincia = cli.PROVINCIA || '';
      localidad = cli.LOCALIDAD || '';
      codigoPostal = cli.CODIGO_POSTAL || '';
      telefono = cli.TELEFONO || '';
    }
  }

  // 3. Buscar cliente en MySQL por CUIT
  if (cuitRaw) {
    const [rows] = await mysql.execute(
      `SELECT Guid, NOMBRE, TIPO_IVA, CODIGO_DOCUMENTO_AFIP,
              DIRECCION, EMAIL, EMAIL_FACTURACION, CELULAR, PROVINCIA, LOCALIDAD, CODIGO_POSTAL, TELEFONO
       FROM clientes
       WHERE REPLACE(REPLACE(CUIT, "-", ""), ".", "") = ? AND (dts IS NULL OR dts = 0)
       ORDER BY ts DESC LIMIT 1`,
      [cuitRaw]
    );
    if (rows.length > 0) {
      const existing = rows[0];
      const existNombre = (existing.NOMBRE || '').trim();
      const existTipoIva = (existing.TIPO_IVA || '').trim();
      const existCodDoc = existing.CODIGO_DOCUMENTO_AFIP;
      const mismoGuid = existing.Guid === guidClienteApp;
      const difiereTipoIvaODoc = existTipoIva !== tipoIvaFinal || existCodDoc !== codDocAfip;

      if (difiereTipoIvaODoc && !mismoGuid) {
        // TIPO_IVA o CODIGO_DOCUMENTO_AFIP difieren y no es el mismo guid => insertar nuevo
        guidClienteMySQL = null;
      } else {
        // Mismo guid o solo difiere nombre => actualizar existente
        guidClienteMySQL = existing.Guid;
        const updates = [];
        const params = [];

        if (existNombre !== nombre && nombre) { updates.push('NOMBRE = ?'); params.push(nombre); }
        if (difiereTipoIvaODoc) {
          // Solo llega acá si mismoGuid = true
          updates.push('TIPO_IVA = ?, CODIGO_IVA = ?'); params.push(tipoIvaFinal, codigoIva);
          updates.push('CODIGO_DOCUMENTO_AFIP = ?, DESCRIPCION_DOCUMENTO_AFIP = ?'); params.push(codDocAfip, descDocAfip);
        }
        if (!existing.DIRECCION && direccion) { updates.push('DIRECCION = ?'); params.push(direccion); }
        if (!existing.EMAIL && email) { updates.push('EMAIL = ?'); params.push(email); }
        if (!existing.EMAIL_FACTURACION && email) { updates.push('EMAIL_FACTURACION = ?'); params.push(email); }
        if (!existing.CELULAR && celular) { updates.push('CELULAR = ?'); params.push(celular); }
        if (!existing.PROVINCIA && provincia) { updates.push('PROVINCIA = ?'); params.push(provincia); }
        if (!existing.LOCALIDAD && localidad) { updates.push('LOCALIDAD = ?'); params.push(localidad); }
        if (!existing.CODIGO_POSTAL && codigoPostal) { updates.push('CODIGO_POSTAL = ?'); params.push(codigoPostal); }
        if (!existing.TELEFONO && telefono) { updates.push('TELEFONO = ?'); params.push(telefono); }

        if (updates.length > 0) {
          params.push(guidClienteMySQL);
          await mysql.execute(
            `UPDATE clientes SET ${updates.join(', ')} WHERE Guid = ?`,
            params
          );
        }
      }
    }
  }

  // 4. Si no existe o difiere tipo_iva/cod_doc, insertar nuevo cliente en MySQL
  if (!guidClienteMySQL) {
    let candidateGuid = guidClienteApp || newGuid();
    const [existingGuid] = await mysql.execute(
      'SELECT Guid FROM clientes WHERE Guid = ? LIMIT 1',
      [candidateGuid]
    );
    if (existingGuid.length > 0) {
      candidateGuid = newGuid();
    }
    guidClienteMySQL = candidateGuid;
    const tsClient = tsNow();

    // Obtener próximo CODIGO_CONFIGURACION disponible para este CUIT
    const [maxConfig] = await mysql.execute(
      'SELECT IFNULL(MAX(CODIGO_CONFIGURACION), 0) + 1 AS nextConfig FROM clientes WHERE REPLACE(REPLACE(CUIT, "-", ""), ".", "") = ?',
      [cuitRaw]
    );
    const codConfig = maxConfig[0].nextConfig || 1;

    await mysql.execute(
      `INSERT INTO clientes (Guid, ts, sts, CODIGO_CONFIGURACION, NOMBRE, CUIT, DIRECCION,
        TIPO_IVA, CODIGO_DOCUMENTO_AFIP, DESCRIPCION_DOCUMENTO_AFIP,
        CODIGO_IVA, IDCOMP, ENVIAFACTURA,
        EMAIL, EMAIL_FACTURACION, CELULAR, PROVINCIA, LOCALIDAD, CODIGO_POSTAL, TELEFONO, TIPO_FACTURA, FECHA_ALTA,
        DATEADDED, TIMEADDED, USERADDED, DATECHANGED, TIMECHANGED, USERCHANGED)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, 0, ?, ?, 0)`,
      [
        guidClienteMySQL, tsClient, tsClient, codConfig, nombre, cuitRaw, direccion,
        tipoIvaFinal, codDocAfip, descDocAfip,
        codigoIva, idComp, 0,
        email, email, celular, provincia, localidad, codigoPostal, telefono,
        factura.TIPO_FACTURA || 'B',
        dateToInt(), timeToInt(), dateToInt(), timeToInt()
      ]
    );
  }

  // 5. Verificar que la factura no esté ya cargada en MySQL
  const [existing] = await mysql.execute(
    'SELECT Guid FROM facturas WHERE Guid = ? LIMIT 1',
    [guidFactura.trim()]
  );
  if (existing.length > 0) {
    throw new Error('Esta factura ya fue autorizada en ARCA');
  }

  // 6. Obtener próximo CODIGO_FACTURA
  const [maxCode] = await mysql.execute(
    'SELECT IFNULL(MAX(CODIGO_FACTURA), 0) + 1 AS nextCode FROM facturas'
  );
  const codigoFactura = maxCode[0].nextCode;

  // 7. Insertar factura en MySQL
  const guidFacturaTrimmed = guidFactura.trim();
  const ts = tsNow();
  const fechaInt = factura.FECHA || dateToInt(); // Clarion date or YYYYMMDD

  // Mapear TIPO_COMPROBANTE a Codigo_ComprobanteAfip
  const tipoComp = (factura.TIPO_COMPROBANTE || '').trim();
  let codCompAfip = 6; // Factura B default
  if (tipoComp === 'FCA') codCompAfip = 1;
  else if (tipoComp === 'FCB') codCompAfip = 6;
  else if (tipoComp === 'NCA') codCompAfip = 3;
  else if (tipoComp === 'NCB') codCompAfip = 8;

  await mysql.execute(
    `INSERT INTO facturas (
      Guid, GuidClientes, GuidConfiguracion, ts, sts,
      CODIGO_CONFIGURACION, CODIGO_FACTURA, CODIGO_CLIENTE,
      CODIGO_DOCUMENTO_AFIP, CODIGO_CONCEPTO_AFIP, IDCOMP,
      NUMERO_FACTURA, PUNTOVENTA, NUMERO, NUMEROHASTA, NUMEROCIERREZ,
      TIPO_COMPROBANTE, TIPO_FACTURA, TIPO_IVA,
      FECHA, FECHA_VENCIMIENTO, FECHASERVDESDE, FECHASERVHASTA,
      NOMBRE, DIRECCION, CUIT,
      TOTAL, TOTAL_NETO21, TOTAL_IVA21, TOTAL_NETO0, TOTAL_IVA0,
      TOTAL_IVA105, TOTAL_NETO105,
      TOTAL_IVA25, TOTAL_NETO25,
      TOTAL_IVA27, TOTAL_NETO27,
      TOTAL_IVA5, TOTAL_NETO5,
      TOTAL_EXENTO, TOTAL_SUJETO, TOTAL_IMPUESTOSINTERNOS, TOTAL_NOGRAVADO,
      RETENCION_BRUTOS, RETENCION_GANANCIA, MONTO_BRUTOS, MONTO_GANANCIA,
      BONIFICACION, RECARGO, DESCUENTO,
      PENDIENTE, PROCESADAAFIP, Codigo_ComprobanteAfip,
      DATEADDED, TIMEADDED, USERADDED, DATECHANGED, TIMECHANGED, USERCHANGED
    ) VALUES (
      ?, ?, ?, ?, ?,
      1, ?, 0,
      ?, ?, ?,
      ?, ?, ?, ?, 0,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      ?, 0, 0, ?,
      0, 0, 0, 0,
      0, 0, 0,
      1, 0, ?,
      ?, ?, 0, ?, ?, 0
    )`,
    [
      guidFacturaTrimmed, guidClienteMySQL, factura.GUIDCONFIGURACION?.trim() || '', ts, ts,
      codigoFactura,
      factura.CODIGO_DOCUMENTO_AFIP || 99, factura.CODIGO_CONCEPTO_AFIP || 1, factura.IDCOMP || 6,
      (factura.NUMERO_FACTURA || '').trim(), factura.PUNTOVENTA || 1, factura.NUMERO || 0, factura.NUMEROHASTA || factura.NUMERO || 0,
      tipoComp, (factura.TIPO_FACTURA || 'B').trim(), (factura.TIPO_IVA || '').trim(),
      fechaInt, factura.FECHA_VENCIMIENTO || null, factura.FECHASERVDESDE || null, factura.FECHASERVHASTA || null,
      nombre, (factura.DIRECCION || '').trim(), cuitRaw,
      factura.TOTAL || 0, factura.TOTAL_NETO21 || 0, factura.TOTAL_IVA21 || 0, factura.TOTAL_NETO0 || 0, factura.TOTAL_IVA0 || 0,
      factura.TOTAL_EXENTO || 0, factura.TOTAL_NOGRAVADO || 0,
      codCompAfip,
      dateToInt(), timeToInt(), dateToInt(), timeToInt()
    ]
  );

  // 8. Insertar items en movimiento_factuas
  for (const item of items) {
    const guidMov = newGuid();
    const cantidad = item.CANTIDAD || 1;
    const neto = item.NETO || 0;
    const total = item.TOTAL || 0;

    // Calcular IVA 21% si factura A
    let iva21 = 0;
    const tipoFact = (factura.TIPO_FACTURA || '').trim();
    if (tipoFact === 'A') {
      iva21 = Math.round(neto * 0.21 * 100) / 100;
    }

    await mysql.execute(
      `INSERT INTO movimiento_factuas (
        GUID, GUIDFACTURAS, CODIGO_FACTURA,
        ARTICULO, DETALLE, CANTIDAD,
        P_UNITARIO, P_TOTAL, PORCENTAJE_IVA,
        IVA25, IVA5, IVA105, IVA21, IVA27,
        SERVICIO, Recargo, Descuento, Impuestos,
        ts, sts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guidMov, guidFacturaTrimmed, codigoFactura,
        (item.ARTICULO || '').trim(), (item.DESCRIPCION || '').trim(), cantidad,
        neto, total, 21.00,
        0, 0, 0, iva21, 0,
        0, 0, 0, 0,
        ts, ts
      ]
    );
  }

  // 9. Actualizar Codigo_ComprobanteAfip en SQL Server para marcar como autorizada
  await pool.request()
    .input('guid', sql.Char(16), guidFacturaTrimmed)
    .input('codCompAfip', sql.Int, codCompAfip)
    .query(`UPDATE Facturas SET Codigo_ComprobanteAfip = @codCompAfip WHERE GUID = @guid`);

  return {
    ok: true,
    guidFactura: guidFacturaTrimmed,
    guidCliente: guidClienteMySQL,
    codigoFactura,
    codCompAfip,
    items: items.length
  };
}

module.exports = { AutorizarFactura };
