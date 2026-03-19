const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/proveedoresRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await repo.GetAll(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await repo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
