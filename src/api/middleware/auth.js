const seguridadRepo = require('../../db/repositories/seguridadRepo');

// Rutas publicas que no requieren cargar usuario (relativas al mount point /api)
const BYPASS_PATHS = new Set([
  '/version',
  '/usuarios/login',
]);

// Middleware loadUser — resuelve req.user a partir del guid enviado por el cliente.
//
// Fuentes del guidUsuario (en orden de prioridad):
//   1. Header `X-User-Guid` (recomendado)
//   2. Body `guidUsuario` (fallback; ya lo usa el front en algunas rutas de mutacion)
//
// Comportamiento (Fase 2 — TOLERANTE):
//   - Si no viene guidUsuario: sigue sin bloquear, con req.user = null.
//     Esto permite que el front actual (que aun no envia el header) no se rompa.
//     En Fase 3, los endpoints sensibles usaran `requirePermission` y recien ahi
//     se bloquean los requests sin usuario.
//   - Si viene guidUsuario y es valido: setea req.user con rol + permisos resueltos.
//   - Si viene guidUsuario pero el usuario no existe o esta deshabilitado: 401.
//
// En Fase 6 (JWT), esta misma funcion leera el token en vez del header/body y
// el resto del sistema (requirePermission, auditorias) no necesita cambiar.
async function loadUser(req, res, next) {
  try {
    if (BYPASS_PATHS.has(req.path)) {
      req.user = null;
      return next();
    }

    const rawGuid =
      req.get('X-User-Guid') ||
      (req.body && typeof req.body === 'object' ? req.body.guidUsuario : null) ||
      null;

    const guidUsuario = rawGuid ? String(rawGuid).trim() : null;

    if (!guidUsuario) {
      req.user = null;
      return next();
    }

    const usuario = await seguridadRepo.GetUsuarioConPermisos(guidUsuario);
    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado o deshabilitado',
        code: 'USER_INVALID',
      });
    }

    req.user = usuario;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { loadUser };
