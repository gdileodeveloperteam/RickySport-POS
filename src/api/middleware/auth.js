const seguridadRepo = require('../../db/repositories/seguridadRepo');
const auditoriaRepo = require('../../db/repositories/auditoriaRepo');

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

// Evalua un spec de permisos contra los permisos del usuario.
// Devuelve { allowed: bool, reason?: string }.
//
// Specs soportados:
//   { modulo: 'X', nivel: 3 }                            — nivel minimo en un modulo
//   { especial: 'CODIGO' }                               — permiso especial
//   { any: [spec, spec, ...] }                           — OR logico
function evaluarSpec(spec, permisos) {
  if (!spec || !permisos) return { allowed: false, reason: 'Spec o permisos invalidos' };

  if (spec.modulo) {
    const nivel = permisos.modulos && permisos.modulos[spec.modulo] != null
      ? permisos.modulos[spec.modulo]
      : 0;
    if (nivel >= (spec.nivel || 1)) return { allowed: true };
    return { allowed: false, reason: `Requiere nivel ${spec.nivel} en modulo ${spec.modulo} (tiene ${nivel})` };
  }

  if (spec.especial) {
    if (permisos.especiales && permisos.especiales.includes(spec.especial)) return { allowed: true };
    return { allowed: false, reason: `Requiere permiso especial ${spec.especial}` };
  }

  if (Array.isArray(spec.any)) {
    for (const sub of spec.any) {
      const r = evaluarSpec(sub, permisos);
      if (r.allowed) return { allowed: true };
    }
    return { allowed: false, reason: 'Ninguna de las alternativas cumple' };
  }

  return { allowed: false, reason: 'Spec sin modulo, especial ni any' };
}

// Factory: devuelve un middleware que valida el spec contra req.user.permisos.
//
// Comportamiento:
//   - Sin req.user                  -> 401 USER_REQUIRED
//   - rol.tipo === 'ADMIN'          -> permite todo (shortcut). Si es permiso especial,
//                                       igual auditea como OK.
//   - permiso valido                -> next(); si es especial, audita OK
//   - permiso denegado              -> 403 PERMISSION_DENIED; si es especial, audita DENIED
//
// Auditoria: solo se registra para specs con `especial`. Los chequeos de modulo
// son alto volumen y no aportan valor de auditoria (se cubren con logs si hace falta).
function requirePermission(spec) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        if (spec.especial) {
          await auditoriaRepo.RegistrarAccion(req, spec.especial, 'DENIED');
        }
        return res.status(401).json({
          error: 'Autenticacion requerida',
          code: 'USER_REQUIRED',
        });
      }

      // Admin shortcut
      if (req.user.rol && req.user.rol.tipo === 'ADMIN') {
        if (spec.especial) {
          await auditoriaRepo.RegistrarAccion(req, spec.especial, 'OK');
        }
        return next();
      }

      const result = evaluarSpec(spec, req.user.permisos);

      if (result.allowed) {
        if (spec.especial) {
          await auditoriaRepo.RegistrarAccion(req, spec.especial, 'OK');
        }
        return next();
      }

      if (spec.especial) {
        await auditoriaRepo.RegistrarAccion(req, spec.especial, 'DENIED');
      }
      return res.status(403).json({
        error: result.reason || 'Permiso denegado',
        code: 'PERMISSION_DENIED',
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { loadUser, requirePermission };
