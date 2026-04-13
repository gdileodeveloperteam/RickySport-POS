const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/empleadosRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/',
  requirePermission({ modulo: 'EMPLEADOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { search, desde, hasta } = req.query;
      if (desde || hasta) {
        const data = await repo.GetAllConAdelantos(search, desde, hasta);
        res.json(data);
      } else {
        const data = await repo.GetAll(search);
        res.json(data);
      }
    } catch (err) { next(err); }
  }
);

router.get('/:guid/adelantos',
  requirePermission({ modulo: 'EMPLEADOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await repo.GetAdelantos(req.params.guid, req.query.desde, req.query.hasta);
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
