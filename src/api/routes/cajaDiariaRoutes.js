const express = require('express');
const router = express.Router();
const cajaDiariaRepo = require('../../db/repositories/cajaDiariaRepo');

// Listar movimientos de caja diaria
router.get('/', async (req, res, next) => {
  try {
    const data = await cajaDiariaRepo.GetCajaDiaria({
      desde: req.query.desde,
      hasta: req.query.hasta,
      guidSucursal: req.query.guidSucursal,
      guidUsuario: req.query.guidUsuario,
    });
    res.json(data);
  } catch (err) { next(err); }
});

// Resumen agrupado por tipo de comprobante
router.get('/resumen', async (req, res, next) => {
  try {
    const data = await cajaDiariaRepo.GetCajaDiariaResumen({
      desde: req.query.desde,
      hasta: req.query.hasta,
      guidSucursal: req.query.guidSucursal,
      guidUsuario: req.query.guidUsuario,
    });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
