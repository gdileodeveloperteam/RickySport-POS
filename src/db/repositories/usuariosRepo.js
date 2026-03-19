const { getPool, sql } = require('../pool');

async function Login(id, clave) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Char(3), id)
    .input('clave', sql.Char(20), clave)
    .query(`
      SELECT u.GUID, u.CODIGO_USUARIO, u.ID, u.NOMBRE, u.NIVEL, u.MODULOS,
             u.GUIDSUCURSALES, u.CODIGOUSUARIO, u.GUIDCONFIGURACION
      FROM Usuarios u
      WHERE RTRIM(LTRIM(u.ID)) = RTRIM(LTRIM(@id))
        AND RTRIM(LTRIM(u.CLAVE)) = RTRIM(LTRIM(@clave))
        AND (u.dts IS NULL OR u.dts = 0)
    `);
  return result.recordset[0] || null;
}

async function GetAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT GUID, CODIGO_USUARIO, ID, NOMBRE, NIVEL, CODIGOUSUARIO, GUIDSUCURSALES
      FROM Usuarios
      WHERE (dts IS NULL OR dts = 0)
      ORDER BY NOMBRE
    `);
  return result.recordset;
}

module.exports = { Login, GetAll };
