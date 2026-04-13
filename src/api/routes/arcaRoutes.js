const express = require('express');
const router = express.Router();
const arcaRepo = require('../../db/repositories/arcaRepo');
const { requirePermission } = require('../middleware/auth');

// POST /api/arca/autorizar
// NOTA: ademas del nivel de modulo ARCA, en Fase 3c se aplicara el permiso
// especial ARCA.AUTORIZAR sobre este mismo endpoint.
router.post('/autorizar',
  requirePermission({ modulo: 'ARCA', nivel: 2 }),
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
