const express = require('express');
const router = express.Router();
const sucursalesRepo = require('../../db/repositories/sucursalesRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await sucursalesRepo.GetAll();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await sucursalesRepo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
