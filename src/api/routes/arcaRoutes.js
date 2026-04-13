const express = require('express');
const router = express.Router();
const arcaRepo = require('../../db/repositories/arcaRepo');
const { requirePermission } = require('../middleware/auth');

// POST /api/arca/autorizar
// Gated por permiso especial ARCA.AUTORIZAR (auditado en AuditoriaAcciones).
// No se chequea el modulo ARCA: la autorizacion a AFIP es una accion puntual
// que se delega via permiso especial — mismo patron que USUARIO.ELIMINAR.
router.post('/autorizar',
  requirePermission({ especial: 'ARCA.AUTORIZAR' }),
  async (req, res, next) => {
    try {
      const { guidFactura } = req.body;
      if (!guidFactura) return res.status(400).json({ error: 'guidFactura es requerido' });

      const result = await arcaRepo.AutorizarFactura(guidFactura);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
