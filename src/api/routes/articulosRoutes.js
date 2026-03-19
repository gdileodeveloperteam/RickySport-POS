const express = require('express');
const router = express.Router();
const articulosRepo = require('../../db/repositories/articulosRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await articulosRepo.GetAll(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/codigo/:codigo', async (req, res, next) => {
  try {
    const data = await articulosRepo.GetByCodigo(req.params.codigo);
    if (!data) return res.status(404).json({ error: 'Articulo no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await articulosRepo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Articulo no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid/movimientos', async (req, res, next) => {
  try {
    const data = await articulosRepo.GetMovimientoArticulos(req.params.guid);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
