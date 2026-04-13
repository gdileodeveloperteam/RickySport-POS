const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/proveedoresRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/',
  requirePermission({ modulo: 'PROVEEDORES', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await repo.GetAll(req.query.search, req.query.guidConfiguracion);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid',
  requirePermission({ modulo: 'PROVEEDORES', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await repo.GetByGuid(req.params.guid);
      if (!data) return res.status(404).json({ error: 'Proveedor no encontrado' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
