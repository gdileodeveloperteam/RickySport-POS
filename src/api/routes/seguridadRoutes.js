const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/seguridadAdminRepo');
const auditSeg = require('../../db/repositories/auditoriaSeguridadRepo');
const { requirePermission } = require('../middleware/auth');

// Todas las rutas de /api/seguridad requieren acceso al modulo SEGURIDAD.
// Por diseno (ver docs/PERMISOS.md), solo el rol Admin lo tiene.
const requireSeguridad = requirePermission({ modulo: 'SEGURIDAD', nivel: 1 });

// ── Catalogos ─────────────────────────────────────────────────────────────────
router.get('/modulos', requireSeguridad, async (req, res, next) => {
  try {
    res.json({ success: true, data: await repo.GetModulos() });
  } catch (err) { next(err); }
});

router.get('/permisos-especiales', requireSeguridad, async (req, res, next) => {
  try {
    res.json({ success: true, data: repo.GetPermisosEspecialesCatalogo() });
  } catch (err) { next(err); }
});

// ── Roles ─────────────────────────────────────────────────────────────────────
router.get('/roles', requireSeguridad, async (req, res, next) => {
  try {
    res.json({ success: true, data: await repo.GetRoles() });
  } catch (err) { next(err); }
});

router.get('/roles/:guid', requireSeguridad, async (req, res, next) => {
  try {
    const detalle = await repo.GetRolDetalle(req.params.guid);
    if (!detalle) return res.status(404).json({ success: false, error: 'Rol no encontrado' });
    res.json({ success: true, data: detalle });
  } catch (err) { next(err); }
});

router.put('/roles/:guid/modulos', requireSeguridad, async (req, res, next) => {
  try {
    const { modulos } = req.body;
    if (!Array.isArray(modulos)) {
      return res.status(400).json({ success: false, error: 'Body debe incluir array `modulos`' });
    }
    const diff = await repo.SetRolModulos(req.params.guid, modulos);

    // Una fila de auditoria por cada modulo que cambio
    for (const c of diff.cambios) {
      await auditSeg.Registrar(req, {
        entidad: 'ROL_MODULO',
        guidEntidad: req.params.guid,
        accion: 'EDITAR',
        antesJson: { codigoInterno: c.codigoInterno, nivel: c.anterior },
        despuesJson: { codigoInterno: c.codigoInterno, nivel: c.nuevo },
      });
    }
    res.json({ success: true, data: diff });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
});

router.put('/roles/:guid/permisos', requireSeguridad, async (req, res, next) => {
  try {
    const { especiales } = req.body;
    if (!Array.isArray(especiales)) {
      return res.status(400).json({ success: false, error: 'Body debe incluir array `especiales`' });
    }
    const diff = await repo.SetRolEspeciales(req.params.guid, especiales);

    for (const codigo of diff.agregados) {
      await auditSeg.Registrar(req, {
        entidad: 'ROL_PERMISO', guidEntidad: req.params.guid, accion: 'CREAR',
        antesJson: null, despuesJson: { codigo },
      });
    }
    for (const codigo of diff.eliminados) {
      await auditSeg.Registrar(req, {
        entidad: 'ROL_PERMISO', guidEntidad: req.params.guid, accion: 'ELIMINAR',
        antesJson: { codigo }, despuesJson: null,
      });
    }
    res.json({ success: true, data: diff });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
});

router.post('/roles/:guid/copiar-desde', requireSeguridad, async (req, res, next) => {
  try {
    const { guidOrigen } = req.body;
    if (!guidOrigen) {
      return res.status(400).json({ success: false, error: '`guidOrigen` requerido' });
    }
    const diff = await repo.CopiarPermisos(req.params.guid, guidOrigen);
    await auditSeg.Registrar(req, {
      entidad: 'ROL', guidEntidad: req.params.guid, accion: 'COPIAR',
      antesJson: diff.antes,
      despuesJson: { ...diff.nuevo, origen: guidOrigen },
    });
    res.json({ success: true, data: diff });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
});

// ── Asignacion de rol a usuarios ──────────────────────────────────────────────
router.get('/usuarios-rol', requireSeguridad, async (req, res, next) => {
  try {
    res.json({ success: true, data: await repo.GetUsuariosConRol(req.query.search) });
  } catch (err) { next(err); }
});

router.put('/usuarios-rol/:guidUsuario', requireSeguridad, async (req, res, next) => {
  try {
    const { guidRol } = req.body;
    if (!guidRol) return res.status(400).json({ success: false, error: '`guidRol` requerido' });
    const result = await repo.AsignarRolUsuario(req.params.guidUsuario, guidRol);
    await auditSeg.Registrar(req, {
      entidad: 'USUARIO_ROL',
      guidEntidad: result.usuario.guid,
      accion: 'ASIGNAR',
      antesJson: result.rolAnterior,
      despuesJson: result.rolNuevo,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
});

// ── Auditorias ────────────────────────────────────────────────────────────────
router.get('/auditoria', requireSeguridad, async (req, res, next) => {
  try {
    const { desde, hasta, guidUsuario, entidad, accion, limit } = req.query;
    res.json({
      success: true,
      data: await auditSeg.GetCambios({ desde, hasta, guidUsuario, entidad, accion, limit }),
    });
  } catch (err) { next(err); }
});

router.get('/auditoria-acciones', requireSeguridad, async (req, res, next) => {
  try {
    const { desde, hasta, guidUsuario, codigoPermiso, resultado, limit } = req.query;
    res.json({
      success: true,
      data: await auditSeg.GetAcciones({ desde, hasta, guidUsuario, codigoPermiso, resultado, limit }),
    });
  } catch (err) { next(err); }
});

module.exports = router;
