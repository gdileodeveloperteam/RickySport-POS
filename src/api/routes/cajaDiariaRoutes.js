const express = require('express');
const router = express.Router();
const cajaDiariaRepo = require('../../db/repositories/cajaDiariaRepo');
const { requirePermission } = require('../middleware/auth');

// Listar movimientos de caja diaria
router.get('/',
  requirePermission({ modulo: 'CAJA', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await cajaDiariaRepo.GetCajaDiaria({
        desde: req.query.desde,
        hasta: req.query.hasta,
        guidSucursal: req.query.guidSucursal,
        guidUsuario: req.query.guidUsuario,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

// Resumen agrupado por tipo de comprobante
router.get('/resumen',
  requirePermission({ modulo: 'CAJA', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await cajaDiariaRepo.GetCajaDiariaResumen({
        desde: req.query.desde,
        hasta: req.query.hasta,
        guidSucursal: req.query.guidSucursal,
        guidUsuario: req.query.guidUsuario,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
