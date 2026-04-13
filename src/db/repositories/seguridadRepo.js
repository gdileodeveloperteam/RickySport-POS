const { getPool, sql } = require('../pool');

// Resuelve el rol del usuario + matriz de permisos efectivos.
// Devuelve null si el usuario no existe o esta soft-deleted.
//
// Estructura devuelta:
//   {
//     guid, id, nombre, codigoUsuario, nivelLegacy, guidSucursal, guidConfiguracion,
//     rol: { guid, nombre, tipo } | null,
//     permisos: {
//       modulos: { VENTAS: 3, ARTICULOS: 4, ... },   // codigo_interno -> nivel (0..4)
//       especiales: ['VENTA.ANULAR', ...],
//     }
//   }
async function GetUsuarioConPermisos(guid) {
  const pool = await getPool();

  // 1. Usuario + rol (LEFT JOIN por si el usuario aun no tiene rol asignado)
  const userResult = await pool.request()
    .input('guid', sql.Char(16), guid)
    .query(`
      SELECT
        u.GUID, u.ID, u.NOMBRE, u.CODIGOUSUARIO, u.NIVEL,
        u.GUIDSUCURSALES, u.GUIDCONFIGURACION, u.GUIDROLES,
        r.NOMBRE AS RolNombre,
        r.TIPO   AS RolTipo
      FROM Usuarios u
      LEFT JOIN Roles r ON r.GUID = u.GUIDROLES
      WHERE u.GUID = @guid
        AND (u.dts IS NULL OR u.dts = 0)
    `);

  if (userResult.recordset.length === 0) return null;
  const u = userResult.recordset[0];

  const base = {
    guid: (u.GUID || '').trim(),
    id: (u.ID || '').trim(),
    nombre: (u.NOMBRE || '').trim(),
    codigoUsuario: u.CODIGOUSUARIO,
    nivelLegacy: u.NIVEL,
    guidSucursal: (u.GUIDSUCURSALES || '').trim(),
    guidConfiguracion: (u.GUIDCONFIGURACION || '').trim(),
  };

  // Usuario sin rol: devolvemos sin permisos (tratado como Usuario sin acceso)
  if (!u.GUIDROLES || !(u.GUIDROLES || '').trim()) {
    return {
      ...base,
      rol: null,
      permisos: { modulos: {}, especiales: [] },
    };
  }

  const guidRol = u.GUIDROLES.trim();

  // 2. Matriz de modulos del rol
  const modulosResult = await pool.request()
    .input('guidRol', sql.Char(16), guidRol)
    .query(`
      SELECT m.CODIGO_INTERNO, rm.NIVEL
      FROM Roles_Modulos rm
      INNER JOIN Modulos m ON m.CODIGO = rm.CODIGO_MODULO
      WHERE rm.GUIDROLES = @guidRol
    `);

  const modulos = {};
  for (const row of modulosResult.recordset) {
    modulos[(row.CODIGO_INTERNO || '').trim()] = row.NIVEL;
  }

  // 3. Permisos especiales del rol
  const especialesResult = await pool.request()
    .input('guidRol', sql.Char(16), guidRol)
    .query(`
      SELECT CODIGO
      FROM Roles_PermisosEspeciales
      WHERE GUIDROLES = @guidRol
    `);

  const especiales = especialesResult.recordset.map(r => (r.CODIGO || '').trim());

  return {
    ...base,
    rol: {
      guid: guidRol,
      nombre: (u.RolNombre || '').trim(),
      tipo: (u.RolTipo || '').trim(),
    },
    permisos: { modulos, especiales },
  };
}

module.exports = { GetUsuarioConPermisos };
