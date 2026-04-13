const { getPool, sql } = require('../pool');
const { newGuid, tsNow } = require('../../utils/guidHelper');

// Catalogo de permisos especiales (seccion 4.2 de docs/PERMISOS.md).
// No esta en tabla porque son codigos fijos del sistema. Si se agrega uno nuevo,
// hay que sumarlo aqui Y aplicar `requirePermission({ especial })` en la ruta
// correspondiente.
const PERMISOS_ESPECIALES_CATALOGO = [
  { codigo: 'VENTA.ANULAR',                    grupo: 'VENTA',   descripcion: 'Anular una venta ya confirmada' },
  { codigo: 'VENTA.DESCUENTO_SOBRE_MAXIMO',    grupo: 'VENTA',   descripcion: 'Aplicar descuento mayor al maximo configurado' },
  { codigo: 'VENTA.CTACTE_SOBRE_LIMITE',       grupo: 'VENTA',   descripcion: 'Vender en cuenta corriente sobre el limite del cliente' },
  { codigo: 'VENTA.REIMPRIMIR',                grupo: 'VENTA',   descripcion: 'Reimprimir comprobante de una venta anterior' },
  { codigo: 'ARTICULO.AJUSTE_STOCK',           grupo: 'ARTICULO',descripcion: 'Corregir stock manualmente' },
  { codigo: 'ARTICULO.VER_COSTO',              grupo: 'ARTICULO',descripcion: 'Ver columna de precio de costo y margenes' },
  { codigo: 'CAJA.APERTURA',                   grupo: 'CAJA',    descripcion: 'Abrir caja diaria' },
  { codigo: 'CAJA.CIERRE',                     grupo: 'CAJA',    descripcion: 'Cerrar caja diaria' },
  { codigo: 'CAJA.EDITAR_MOVIMIENTO',          grupo: 'CAJA',    descripcion: 'Editar o eliminar un movimiento de caja' },
  { codigo: 'CONFIG.MAX_DESCUENTO',            grupo: 'CONFIG',  descripcion: 'Modificar el % maximo de descuento permitido' },
  { codigo: 'CONFIG.TIPOS_COBRO_PAGO',         grupo: 'CONFIG',  descripcion: 'Administrar tipos de cobro/pago y planes' },
  { codigo: 'CLIENTE.REACTIVAR',               grupo: 'CLIENTE', descripcion: 'Reactivar un cliente deshabilitado' },
  { codigo: 'CLIENTE.EDITAR_LIMITE_CREDITO',   grupo: 'CLIENTE', descripcion: 'Modificar limite de credito de un cliente' },
  { codigo: 'USUARIO.ELIMINAR',                grupo: 'USUARIO', descripcion: 'Eliminar (soft delete) un usuario' },
  { codigo: 'REPORTES.EXPORTAR',               grupo: 'REPORTES',descripcion: 'Exportar listados completos (hasta 50k filas)' },
  { codigo: 'ARCA.AUTORIZAR',                  grupo: 'ARCA',    descripcion: 'Solicitar CAE a AFIP' },
];

const CODIGOS_ESPECIALES_VALIDOS = new Set(PERMISOS_ESPECIALES_CATALOGO.map(p => p.codigo));

function GetPermisosEspecialesCatalogo() {
  return PERMISOS_ESPECIALES_CATALOGO.slice();
}

async function GetModulos() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT GUID, CODIGO, CODIGO_INTERNO, NOMBRE, ORDEN
    FROM Modulos
    WHERE dts IS NULL
    ORDER BY ORDEN, CODIGO_INTERNO
  `);
  return result.recordset.map(r => ({
    guid: (r.GUID || '').trim(),
    codigo: r.CODIGO,
    codigoInterno: (r.CODIGO_INTERNO || '').trim(),
    nombre: (r.NOMBRE || '').trim(),
    orden: r.ORDEN,
  }));
}

async function GetRoles() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT r.GUID, r.CODIGO, r.NOMBRE, r.TIPO, r.ES_SISTEMA, r.DESCRIPCION,
      (SELECT COUNT(*) FROM Usuarios u
       WHERE u.GUIDROLES = r.GUID AND (u.dts IS NULL OR u.dts = 0)) AS USUARIOS_COUNT
    FROM Roles r
    WHERE r.dts IS NULL
    ORDER BY r.CODIGO
  `);
  return result.recordset.map(mapRolRow);
}

async function GetRolDetalle(guidRol) {
  const pool = await getPool();
  const rolResult = await pool.request()
    .input('guid', sql.Char(16), guidRol)
    .query(`SELECT GUID, CODIGO, NOMBRE, TIPO, ES_SISTEMA, DESCRIPCION
            FROM Roles WHERE GUID = @guid AND dts IS NULL`);
  if (rolResult.recordset.length === 0) return null;
  const rol = mapRolRow(rolResult.recordset[0]);

  const modulosResult = await pool.request()
    .input('guidRol', sql.Char(16), guidRol)
    .query(`
      SELECT m.GUID AS moduloGuid, m.CODIGO AS moduloCodigo, m.CODIGO_INTERNO, m.NOMBRE, m.ORDEN,
             ISNULL(rm.NIVEL, 0) AS NIVEL
      FROM Modulos m
      LEFT JOIN Roles_Modulos rm
        ON rm.CODIGO_MODULO = m.CODIGO AND rm.GUIDROLES = @guidRol
      WHERE m.dts IS NULL
      ORDER BY m.ORDEN, m.CODIGO_INTERNO
    `);

  const modulos = modulosResult.recordset.map(r => ({
    moduloGuid: (r.moduloGuid || '').trim(),
    codigoInterno: (r.CODIGO_INTERNO || '').trim(),
    nombre: (r.NOMBRE || '').trim(),
    orden: r.ORDEN,
    nivel: r.NIVEL,
  }));

  const especialesResult = await pool.request()
    .input('guidRol', sql.Char(16), guidRol)
    .query(`SELECT CODIGO FROM Roles_PermisosEspeciales WHERE GUIDROLES = @guidRol`);
  const especiales = especialesResult.recordset.map(r => (r.CODIGO || '').trim());

  return { rol, modulos, especiales };
}

// Reemplaza la matriz de modulos del rol. Devuelve el diff { anterior: {codigo: nivel}, nuevo: {codigo: nivel}, cambios: [{codigoInterno, anterior, nuevo}] }
async function SetRolModulos(guidRol, modulosInput) {
  if (!Array.isArray(modulosInput)) throw new Error('modulos debe ser un array');

  const pool = await getPool();

  // Validar rol y que no sea de sistema
  const rolInfo = await pool.request()
    .input('guid', sql.Char(16), guidRol)
    .query(`SELECT GUID, NOMBRE, TIPO, ES_SISTEMA FROM Roles WHERE GUID = @guid AND dts IS NULL`);
  if (rolInfo.recordset.length === 0) {
    const err = new Error('Rol no encontrado');
    err.status = 404;
    throw err;
  }
  if (rolInfo.recordset[0].ES_SISTEMA) {
    const err = new Error('No se pueden modificar los permisos de un rol de sistema (Usuario / Admin)');
    err.status = 400;
    throw err;
  }

  // Mapa de codigoInterno -> {codigo, codigoInterno}
  const modsResult = await pool.request().query(`SELECT CODIGO, CODIGO_INTERNO FROM Modulos WHERE dts IS NULL`);
  const codigoInternoToCodigo = new Map();
  for (const m of modsResult.recordset) {
    codigoInternoToCodigo.set((m.CODIGO_INTERNO || '').trim(), m.CODIGO);
  }

  // Estado anterior
  const anteriorResult = await pool.request()
    .input('guidRol', sql.Char(16), guidRol)
    .query(`
      SELECT m.CODIGO_INTERNO, rm.NIVEL
      FROM Roles_Modulos rm
      INNER JOIN Modulos m ON m.CODIGO = rm.CODIGO_MODULO
      WHERE rm.GUIDROLES = @guidRol
    `);
  const anterior = {};
  for (const r of anteriorResult.recordset) {
    anterior[(r.CODIGO_INTERNO || '').trim()] = r.NIVEL;
  }

  // Normalizar input y validar
  const nuevo = {};
  for (const m of modulosInput) {
    const codigoInterno = String(m.codigoInterno || '').trim();
    const nivel = Number(m.nivel);
    if (!codigoInterno || !codigoInternoToCodigo.has(codigoInterno)) continue;
    if (!Number.isInteger(nivel) || nivel < 0 || nivel > 4) {
      const err = new Error(`Nivel invalido para modulo ${codigoInterno}: ${m.nivel} (debe ser 0..4)`);
      err.status = 400;
      throw err;
    }
    nuevo[codigoInterno] = nivel;
  }

  // Detectar cambios
  const cambios = [];
  for (const codigoInterno of new Set([...Object.keys(anterior), ...Object.keys(nuevo)])) {
    const ant = anterior[codigoInterno] ?? 0;
    const nue = nuevo[codigoInterno] ?? 0;
    if (ant !== nue) cambios.push({ codigoInterno, anterior: ant, nuevo: nue });
  }

  // Aplicar cambios via transaccion: borrar + insertar los no-cero
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await new sql.Request(transaction)
      .input('guidRol', sql.Char(16), guidRol)
      .query(`DELETE FROM Roles_Modulos WHERE GUIDROLES = @guidRol`);

    for (const [codigoInterno, nivel] of Object.entries(nuevo)) {
      if (nivel === 0) continue;
      const codigoModulo = codigoInternoToCodigo.get(codigoInterno);
      if (codigoModulo == null) continue;
      await new sql.Request(transaction)
        .input('guid', sql.Char(16), newGuid())
        .input('guidRol', sql.Char(16), guidRol)
        .input('codigoModulo', sql.Int, codigoModulo)
        .input('nivel', sql.TinyInt, nivel)
        .input('ts', sql.Float, tsNow())
        .input('sts', sql.Float, tsNow())
        .query(`
          INSERT INTO Roles_Modulos (GUID, GUIDROLES, CODIGO_MODULO, NIVEL, ts, sts)
          VALUES (@guid, @guidRol, @codigoModulo, @nivel, @ts, @sts)
        `);
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return { anterior, nuevo, cambios };
}

async function SetRolEspeciales(guidRol, especialesInput) {
  if (!Array.isArray(especialesInput)) throw new Error('especiales debe ser un array');

  const pool = await getPool();

  const rolInfo = await pool.request()
    .input('guid', sql.Char(16), guidRol)
    .query(`SELECT GUID, NOMBRE, TIPO, ES_SISTEMA FROM Roles WHERE GUID = @guid AND dts IS NULL`);
  if (rolInfo.recordset.length === 0) {
    const err = new Error('Rol no encontrado'); err.status = 404; throw err;
  }
  const rol = rolInfo.recordset[0];
  if (rol.ES_SISTEMA) {
    const err = new Error('No se pueden modificar los permisos de un rol de sistema (Usuario / Admin)');
    err.status = 400;
    throw err;
  }
  if (rol.TIPO === 'USUARIO') {
    const err = new Error('El rol Usuario no admite permisos especiales');
    err.status = 400;
    throw err;
  }

  // Validar codigos contra catalogo
  const nuevoSet = new Set();
  for (const codigo of especialesInput) {
    const c = String(codigo || '').trim();
    if (!c) continue;
    if (!CODIGOS_ESPECIALES_VALIDOS.has(c)) {
      const err = new Error(`Permiso especial desconocido: ${c}`);
      err.status = 400;
      throw err;
    }
    nuevoSet.add(c);
  }

  const anteriorResult = await pool.request()
    .input('guidRol', sql.Char(16), guidRol)
    .query(`SELECT CODIGO FROM Roles_PermisosEspeciales WHERE GUIDROLES = @guidRol`);
  const anteriorSet = new Set(anteriorResult.recordset.map(r => (r.CODIGO || '').trim()));

  const agregados = [...nuevoSet].filter(c => !anteriorSet.has(c));
  const eliminados = [...anteriorSet].filter(c => !nuevoSet.has(c));

  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await new sql.Request(transaction)
      .input('guidRol', sql.Char(16), guidRol)
      .query(`DELETE FROM Roles_PermisosEspeciales WHERE GUIDROLES = @guidRol`);

    for (const codigo of nuevoSet) {
      await new sql.Request(transaction)
        .input('guid', sql.Char(16), newGuid())
        .input('guidRol', sql.Char(16), guidRol)
        .input('codigo', sql.NVarChar(64), codigo)
        .input('ts', sql.Float, tsNow())
        .input('sts', sql.Float, tsNow())
        .query(`
          INSERT INTO Roles_PermisosEspeciales (GUID, GUIDROLES, CODIGO, ts, sts)
          VALUES (@guid, @guidRol, @codigo, @ts, @sts)
        `);
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return {
    anterior: [...anteriorSet].sort(),
    nuevo: [...nuevoSet].sort(),
    agregados, eliminados,
  };
}

async function CopiarPermisos(guidRolDestino, guidRolOrigen) {
  if (guidRolDestino === guidRolOrigen) {
    const err = new Error('El rol origen y destino no pueden ser el mismo'); err.status = 400; throw err;
  }
  const pool = await getPool();
  const destInfo = await pool.request()
    .input('guid', sql.Char(16), guidRolDestino)
    .query(`SELECT GUID, ES_SISTEMA FROM Roles WHERE GUID = @guid AND dts IS NULL`);
  if (destInfo.recordset.length === 0) { const e = new Error('Rol destino no encontrado'); e.status = 404; throw e; }
  if (destInfo.recordset[0].ES_SISTEMA) {
    const e = new Error('No se puede modificar un rol de sistema'); e.status = 400; throw e;
  }
  const origInfo = await pool.request()
    .input('guid', sql.Char(16), guidRolOrigen)
    .query(`SELECT GUID FROM Roles WHERE GUID = @guid AND dts IS NULL`);
  if (origInfo.recordset.length === 0) { const e = new Error('Rol origen no encontrado'); e.status = 404; throw e; }

  // Snapshot destino (antes) + origen (despues)
  const [destModulos, destEspeciales, origModulos, origEspeciales] = await Promise.all([
    pool.request().input('g', sql.Char(16), guidRolDestino).query(`
      SELECT m.CODIGO_INTERNO, rm.NIVEL FROM Roles_Modulos rm
      INNER JOIN Modulos m ON m.CODIGO = rm.CODIGO_MODULO
      WHERE rm.GUIDROLES = @g`),
    pool.request().input('g', sql.Char(16), guidRolDestino).query(`
      SELECT CODIGO FROM Roles_PermisosEspeciales WHERE GUIDROLES = @g`),
    pool.request().input('g', sql.Char(16), guidRolOrigen).query(`
      SELECT m.CODIGO, m.CODIGO_INTERNO, rm.NIVEL FROM Roles_Modulos rm
      INNER JOIN Modulos m ON m.CODIGO = rm.CODIGO_MODULO
      WHERE rm.GUIDROLES = @g`),
    pool.request().input('g', sql.Char(16), guidRolOrigen).query(`
      SELECT CODIGO FROM Roles_PermisosEspeciales WHERE GUIDROLES = @g`),
  ]);

  const antesModulos = {};
  for (const r of destModulos.recordset) antesModulos[(r.CODIGO_INTERNO || '').trim()] = r.NIVEL;
  const antesEspeciales = destEspeciales.recordset.map(r => (r.CODIGO || '').trim()).sort();

  const nuevoModulos = {};
  for (const r of origModulos.recordset) nuevoModulos[(r.CODIGO_INTERNO || '').trim()] = r.NIVEL;
  const nuevoEspeciales = origEspeciales.recordset.map(r => (r.CODIGO || '').trim()).sort();

  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await new sql.Request(transaction)
      .input('g', sql.Char(16), guidRolDestino)
      .query(`DELETE FROM Roles_Modulos WHERE GUIDROLES = @g`);
    await new sql.Request(transaction)
      .input('g', sql.Char(16), guidRolDestino)
      .query(`DELETE FROM Roles_PermisosEspeciales WHERE GUIDROLES = @g`);

    for (const r of origModulos.recordset) {
      if (!r.NIVEL) continue;
      await new sql.Request(transaction)
        .input('guid', sql.Char(16), newGuid())
        .input('guidRol', sql.Char(16), guidRolDestino)
        .input('codigoModulo', sql.Int, r.CODIGO)
        .input('nivel', sql.TinyInt, r.NIVEL)
        .input('ts', sql.Float, tsNow())
        .input('sts', sql.Float, tsNow())
        .query(`INSERT INTO Roles_Modulos (GUID, GUIDROLES, CODIGO_MODULO, NIVEL, ts, sts)
                VALUES (@guid, @guidRol, @codigoModulo, @nivel, @ts, @sts)`);
    }
    for (const codigo of nuevoEspeciales) {
      await new sql.Request(transaction)
        .input('guid', sql.Char(16), newGuid())
        .input('guidRol', sql.Char(16), guidRolDestino)
        .input('codigo', sql.NVarChar(64), codigo)
        .input('ts', sql.Float, tsNow())
        .input('sts', sql.Float, tsNow())
        .query(`INSERT INTO Roles_PermisosEspeciales (GUID, GUIDROLES, CODIGO, ts, sts)
                VALUES (@guid, @guidRol, @codigo, @ts, @sts)`);
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return {
    antes:  { modulos: antesModulos,  especiales: antesEspeciales },
    nuevo:  { modulos: nuevoModulos,  especiales: nuevoEspeciales },
  };
}

async function GetUsuariosConRol(search) {
  const pool = await getPool();
  const searchParam = search ? `%${search.trim()}%` : null;
  const request = pool.request();
  let where = `WHERE (u.dts IS NULL OR u.dts = 0)`;
  if (searchParam) {
    request.input('search', sql.NVarChar(256), searchParam);
    where += ` AND (u.ID LIKE @search OR u.NOMBRE LIKE @search)`;
  }
  const result = await request.query(`
    SELECT u.GUID, u.ID, u.NOMBRE, u.CODIGOUSUARIO, u.GUIDROLES,
           r.NOMBRE AS RolNombre, r.TIPO AS RolTipo, r.ES_SISTEMA AS RolEsSistema
    FROM Usuarios u
    LEFT JOIN Roles r ON r.GUID = u.GUIDROLES
    ${where}
    ORDER BY u.NOMBRE
  `);
  return result.recordset.map(u => ({
    guid: (u.GUID || '').trim(),
    id: (u.ID || '').trim(),
    nombre: (u.NOMBRE || '').trim(),
    codigoUsuario: u.CODIGOUSUARIO,
    rolGuid: (u.GUIDROLES || '').trim() || null,
    rolNombre: (u.RolNombre || '').trim() || null,
    rolTipo: (u.RolTipo || '').trim() || null,
    rolEsSistema: !!u.RolEsSistema,
  }));
}

async function AsignarRolUsuario(guidUsuario, guidRolNuevo) {
  const pool = await getPool();

  const usuarioResult = await pool.request()
    .input('guid', sql.Char(16), guidUsuario)
    .query(`
      SELECT u.GUID, u.ID, u.NOMBRE, u.GUIDROLES,
             r.NOMBRE AS RolNombre, r.TIPO AS RolTipo
      FROM Usuarios u
      LEFT JOIN Roles r ON r.GUID = u.GUIDROLES
      WHERE u.GUID = @guid AND (u.dts IS NULL OR u.dts = 0)
    `);
  if (usuarioResult.recordset.length === 0) {
    const e = new Error('Usuario no encontrado'); e.status = 404; throw e;
  }
  const u = usuarioResult.recordset[0];
  const rolAnterior = {
    guid: (u.GUIDROLES || '').trim() || null,
    nombre: (u.RolNombre || '').trim() || null,
    tipo: (u.RolTipo || '').trim() || null,
  };

  // No se permite cambiar DESDE Admin
  if (rolAnterior.tipo === 'ADMIN') {
    const e = new Error('No se puede modificar el rol de un Admin desde la UI (solo via SQL)');
    e.status = 400;
    throw e;
  }

  const rolNuevoResult = await pool.request()
    .input('guid', sql.Char(16), guidRolNuevo)
    .query(`SELECT GUID, NOMBRE, TIPO FROM Roles WHERE GUID = @guid AND dts IS NULL`);
  if (rolNuevoResult.recordset.length === 0) {
    const e = new Error('Rol no encontrado'); e.status = 404; throw e;
  }
  const rolNuevo = rolNuevoResult.recordset[0];

  // No se permite asignar Admin desde la UI
  if ((rolNuevo.TIPO || '').trim() === 'ADMIN') {
    const e = new Error('No se puede asignar el rol Admin desde la UI (solo via SQL)');
    e.status = 400;
    throw e;
  }

  await pool.request()
    .input('guidUsuario', sql.Char(16), guidUsuario)
    .input('guidRol', sql.Char(16), guidRolNuevo)
    .input('sts', sql.Float, tsNow())
    .query(`UPDATE Usuarios SET GUIDROLES = @guidRol, sts = @sts WHERE GUID = @guidUsuario`);

  return {
    usuario: {
      guid: (u.GUID || '').trim(),
      id: (u.ID || '').trim(),
      nombre: (u.NOMBRE || '').trim(),
    },
    rolAnterior,
    rolNuevo: {
      guid: (rolNuevo.GUID || '').trim(),
      nombre: (rolNuevo.NOMBRE || '').trim(),
      tipo: (rolNuevo.TIPO || '').trim(),
    },
  };
}

function mapRolRow(r) {
  return {
    guid: (r.GUID || '').trim(),
    codigo: r.CODIGO,
    nombre: (r.NOMBRE || '').trim(),
    tipo: (r.TIPO || '').trim(),
    esSistema: !!r.ES_SISTEMA,
    descripcion: (r.DESCRIPCION || '').trim(),
    usuariosCount: r.USUARIOS_COUNT != null ? r.USUARIOS_COUNT : undefined,
  };
}

module.exports = {
  PERMISOS_ESPECIALES_CATALOGO,
  GetPermisosEspecialesCatalogo,
  GetModulos,
  GetRoles,
  GetRolDetalle,
  SetRolModulos,
  SetRolEspeciales,
  CopiarPermisos,
  GetUsuariosConRol,
  AsignarRolUsuario,
};
