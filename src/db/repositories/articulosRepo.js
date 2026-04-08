const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

const EMPTY_GUID = '';

// ============================================================================
// Listar artículos con paginación server-side
// ============================================================================
async function GetAll({ search, page = 1, limit = 30, sortBy, sortDir, guidProveedor } = {}) {
  const pool = await getPool();
  limit = Math.min(limit, 200);
  const offset = (page - 1) * limit;

  const allowedSort = ['CODIGOARTICULOREL', 'DESCRIPCION', 'PRECIOVENTA', 'PRECIOCOSTO'];
  const col = allowedSort.includes(sortBy) ? sortBy : 'DESCRIPCION';
  const dir = sortDir === 'DESC' ? 'DESC' : 'ASC';

  let where = `(a.dts IS NULL OR a.dts = 0)`;
  if (search) where += ` AND (a.CODIGOARTICULOREL LIKE @search OR a.DESCRIPCION LIKE @search OR a.CODIGOARTICULO LIKE @search)`;
  if (guidProveedor) where += ` AND a.GUIDPROVEEDORES = @guidProv`;

  const addInputs = (req) => {
    if (search) req.input('search', sql.VarChar, `%${search.toUpperCase()}%`);
    if (guidProveedor) req.input('guidProv', sql.Char(16), guidProveedor);
    return req;
  };

  const countResult = await addInputs(pool.request()).query(`SELECT COUNT(*) AS total FROM Articulos a WHERE ${where}`);
  const total = countResult.recordset[0].total;

  const dataReq = addInputs(pool.request());
  dataReq.input('offset', sql.Int, offset);
  dataReq.input('limit', sql.Int, limit);
  const dataResult = await dataReq.query(`
    SELECT a.GUID, a.CODIGOARTICULO, a.CODIGOARTICULOREL, a.DESCRIPCION,
           a.PRECIOCOSTO, a.PRECIOVENTA, a.UTILIDAD,
           a.TALLEDESDE, a.TALLEHASTA, a.COLOR, a.TIPO,
           a.GUIDGRUPOS, a.GUIDPROVEEDORES, a.CostoDolar, a.VentaDolar,
           RTRIM(p.NOMBRE) AS ProveedorNombre
    FROM Articulos a
    LEFT JOIN Proveedores p ON p.GUID = a.GUIDPROVEEDORES
    WHERE ${where}
    ORDER BY a.${col} ${dir}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return {
    data: dataResult.recordset,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

// ============================================================================
// Obtener artículo por GUID
// ============================================================================
async function GetByGuid(guid) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`
      SELECT a.*, RTRIM(p.NOMBRE) AS ProveedorNombre
      FROM Articulos a
      LEFT JOIN Proveedores p ON p.GUID = a.GUIDPROVEEDORES
      WHERE a.GUID = @guid AND (a.dts IS NULL OR a.dts = 0)
    `);
  return result.recordset[0] || null;
}

// ============================================================================
// Obtener artículo por código
// ============================================================================
async function GetByCodigo(codigo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('codigo', sql.VarChar, codigo)
    .query(`
      SELECT a.GUID, a.CODIGOARTICULO, a.CODIGOARTICULOREL, a.DESCRIPCION, a.PRECIOCOSTO, a.PRECIOVENTA,
             a.TALLEDESDE, a.TALLEHASTA, a.COLOR, a.UTILIDAD, a.TIPO,
             a.GUIDGRUPOS, a.GUIDPROVEEDORES
      FROM Articulos a
      WHERE a.CODIGOARTICULOREL = @codigo
        AND (a.dts IS NULL OR a.dts = 0)
    `);
  return result.recordset[0] || null;
}

// ============================================================================
// Obtener movimientos (talles/colores) de un artículo
// ============================================================================
async function GetMovimientoArticulos(guidArticulo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('guidArticulo', sql.Char(16), guidArticulo)
    .query(`
      SELECT GUID, GUIDARTICULOS, CODIGOARTICULO, NUMERO, COLOR
      FROM MovimientoArticulos
      WHERE GUIDARTICULOS = @guidArticulo
      ORDER BY NUMERO, COLOR
    `);
  return result.recordset;
}

// ============================================================================
// Crear artículo
// ============================================================================
async function Create({ codigoArticulo, codigoArticuloRel, descripcion, precioCosto, precioVenta,
  talleDesde, talleHasta, color, utilidad, tipo, guidGrupos, guidProveedores,
  costoDolar, ventaDolar, movimientos }) {

  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();
    const guid = newGuid();

    await tx.request()
      .input('guid', sql.Char(16), guid)
      .input('codigoArticulo', sql.VarChar(255), (codigoArticulo || '').toUpperCase())
      .input('codigoArticuloRel', sql.VarChar(255), (codigoArticuloRel || '').toUpperCase())
      .input('codigoOriginal', sql.VarChar(255), (codigoArticuloRel || '').toUpperCase())
      .input('descripcion', sql.VarChar(1023), (descripcion || '').toUpperCase())
      .input('precioCosto', sql.Decimal(13, 2), precioCosto || 0)
      .input('precioVenta', sql.Decimal(13, 2), precioVenta || 0)
      .input('utilidad', sql.Decimal(13, 2), utilidad || 0)
      .input('talleDesde', sql.Decimal(7, 2), talleDesde || 0)
      .input('talleHasta', sql.Decimal(7, 2), talleHasta || 0)
      .input('color', sql.VarChar(255), (color || '').toUpperCase())
      .input('tipo', sql.Char(2), tipo || '')
      .input('guidGrupos', sql.Char(16), guidGrupos || EMPTY_GUID)
      .input('guidProveedores', sql.Char(16), guidProveedores || EMPTY_GUID)
      .input('costoDolar', sql.Decimal(13, 2), costoDolar || 0)
      .input('ventaDolar', sql.Decimal(13, 2), ventaDolar || 0)
      .input('ts', sql.Float, ts)
      .input('sts', sql.Float, ts)
      .query(`
        INSERT INTO Articulos (GUID, CODIGOARTICULO, CODIGOARTICULOREL, CODIGOORIGINAL, DESCRIPCION,
          PRECIOCOSTO, PRECIOVENTA, UTILIDAD, TALLEDESDE, TALLEHASTA, COLOR, TIPO,
          GUIDGRUPOS, GUIDPROVEEDORES, CostoDolar, VentaDolar, ts, sts)
        VALUES (@guid, @codigoArticulo, @codigoArticuloRel, @codigoOriginal, @descripcion,
          @precioCosto, @precioVenta, @utilidad, @talleDesde, @talleHasta, @color, @tipo,
          @guidGrupos, @guidProveedores, @costoDolar, @ventaDolar, @ts, @sts)
      `);

    // Crear movimientos (talles/colores)
    if (movimientos && movimientos.length > 0) {
      for (const mov of movimientos) {
        const guidMov = newGuid();
        await tx.request()
          .input('guid', sql.Char(16), guidMov)
          .input('guidArticulo', sql.Char(16), guid)
          .input('codigoArticulo', sql.VarChar(255), (codigoArticuloRel || '').toUpperCase())
          .input('numero', sql.Decimal(7, 2), mov.numero || 0)
          .input('color', sql.VarChar(255), (mov.color || '').toUpperCase())
          .input('guidProveedores', sql.Char(16), guidProveedores || EMPTY_GUID)
          .query(`
            INSERT INTO MovimientoArticulos (GUID, GUIDARTICULOS, CODIGOARTICULO, NUMERO, COLOR, GUIDPROVEEDORES)
            VALUES (@guid, @guidArticulo, @codigoArticulo, @numero, @color, @guidProveedores)
          `);
      }
    }

    await tx.commit();
    return { guid };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// ============================================================================
// Actualizar artículo
// ============================================================================
async function Update(guid, { codigoArticulo, codigoArticuloRel, descripcion, precioCosto, precioVenta,
  talleDesde, talleHasta, color, utilidad, tipo, guidGrupos, guidProveedores,
  costoDolar, ventaDolar, movimientos }) {

  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();

  try {
    const ts = tsNow();

    await tx.request()
      .input('guid', sql.Char(16), guid)
      .input('codigoArticulo', sql.VarChar(255), (codigoArticulo || '').toUpperCase())
      .input('codigoArticuloRel', sql.VarChar(255), (codigoArticuloRel || '').toUpperCase())
      .input('descripcion', sql.VarChar(1023), (descripcion || '').toUpperCase())
      .input('precioCosto', sql.Decimal(13, 2), precioCosto || 0)
      .input('precioVenta', sql.Decimal(13, 2), precioVenta || 0)
      .input('utilidad', sql.Decimal(13, 2), utilidad || 0)
      .input('talleDesde', sql.Decimal(7, 2), talleDesde || 0)
      .input('talleHasta', sql.Decimal(7, 2), talleHasta || 0)
      .input('color', sql.VarChar(255), (color || '').toUpperCase())
      .input('tipo', sql.Char(2), tipo || '')
      .input('guidGrupos', sql.Char(16), guidGrupos || EMPTY_GUID)
      .input('guidProveedores', sql.Char(16), guidProveedores || EMPTY_GUID)
      .input('costoDolar', sql.Decimal(13, 2), costoDolar || 0)
      .input('ventaDolar', sql.Decimal(13, 2), ventaDolar || 0)
      .input('sts', sql.Float, ts)
      .query(`
        UPDATE Articulos SET
          CODIGOARTICULO = @codigoArticulo, CODIGOARTICULOREL = @codigoArticuloRel,
          DESCRIPCION = @descripcion, PRECIOCOSTO = @precioCosto, PRECIOVENTA = @precioVenta,
          UTILIDAD = @utilidad, TALLEDESDE = @talleDesde, TALLEHASTA = @talleHasta,
          COLOR = @color, TIPO = @tipo, GUIDGRUPOS = @guidGrupos, GUIDPROVEEDORES = @guidProveedores,
          CostoDolar = @costoDolar, VentaDolar = @ventaDolar, sts = @sts,
          FECHAULTIMAACTUALIZACION = GETDATE()
        WHERE GUID = @guid AND (dts IS NULL OR dts = 0)
      `);

    // Sync movimientos: delete removed, update existing, add new
    if (movimientos !== undefined) {
      const existingMovs = await tx.request()
        .input('guidArt', sql.Char(16), guid)
        .query(`SELECT GUID FROM MovimientoArticulos WHERE GUIDARTICULOS = @guidArt`);
      const existingGuids = new Set(existingMovs.recordset.map(r => r.GUID.trim()));
      const incomingGuids = new Set();

      for (const mov of (movimientos || [])) {
        const movGuid = (mov.guid || '').trim();
        if (movGuid && existingGuids.has(movGuid)) {
          // Update existing
          incomingGuids.add(movGuid);
          await tx.request()
            .input('guid', sql.Char(16), movGuid)
            .input('numero', sql.Decimal(7, 2), mov.numero || 0)
            .input('color', sql.VarChar(255), (mov.color || '').toUpperCase())
            .input('codigoArticulo', sql.VarChar(255), (codigoArticuloRel || '').toUpperCase())
            .query(`UPDATE MovimientoArticulos SET NUMERO = @numero, COLOR = @color, CODIGOARTICULO = @codigoArticulo WHERE GUID = @guid`);
        } else {
          // Insert new
          const newMovGuid = newGuid();
          incomingGuids.add(newMovGuid);
          await tx.request()
            .input('guid', sql.Char(16), newMovGuid)
            .input('guidArticulo', sql.Char(16), guid)
            .input('codigoArticulo', sql.VarChar(255), (codigoArticuloRel || '').toUpperCase())
            .input('numero', sql.Decimal(7, 2), mov.numero || 0)
            .input('color', sql.VarChar(255), (mov.color || '').toUpperCase())
            .input('guidProveedores', sql.Char(16), guidProveedores || EMPTY_GUID)
            .query(`
              INSERT INTO MovimientoArticulos (GUID, GUIDARTICULOS, CODIGOARTICULO, NUMERO, COLOR, GUIDPROVEEDORES)
              VALUES (@guid, @guidArticulo, @codigoArticulo, @numero, @color, @guidProveedores)
            `);
        }
      }

      // Delete removed movimientos
      for (const eg of existingGuids) {
        if (!incomingGuids.has(eg)) {
          await tx.request()
            .input('guid', sql.Char(16), eg)
            .query(`DELETE FROM MovimientoArticulos WHERE GUID = @guid`);
        }
      }
    }

    await tx.commit();
    return { guid };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// ============================================================================
// Eliminar artículo (soft delete)
// ============================================================================
async function Delete(guid) {
  const pool = await getPool();
  const ts = tsNow();
  await pool.request()
    .input('guid', sql.Char(16), guid)
    .input('dts', sql.Float, ts)
    .query(`UPDATE Articulos SET dts = @dts WHERE GUID = @guid AND (dts IS NULL OR dts = 0)`);
  return { ok: true };
}

module.exports = { GetAll, GetByGuid, GetByCodigo, GetMovimientoArticulos, Create, Update, Delete };
