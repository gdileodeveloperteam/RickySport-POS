const express = require('express');
const router = express.Router();
const sucursalesRepo = require('../../db/repositories/sucursalesRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const data = await sucursalesRepo.GetAll();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/configuraciones', async (req, res, next) => {
  try {
    const data = await sucursalesRepo.GetConfiguraciones();
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

router.post('/',
  requirePermission({ modulo: 'SUCURSALES', nivel: 2 }),
  async (req, res, next) => {
    try { res.status(201).json(await sucursalesRepo.Create(req.body)); } catch (err) { next(err); }
  }
);

router.put('/:guid',
  requirePermission({ modulo: 'SUCURSALES', nivel: 3 }),
  async (req, res, next) => {
    try { res.json(await sucursalesRepo.Update(req.params.guid, req.body)); } catch (err) { next(err); }
  }
);

router.delete('/:guid',
  requirePermission({ modulo: 'SUCURSALES', nivel: 4 }),
  async (req, res, next) => {
    try { res.json(await sucursalesRepo.Delete(req.params.guid)); } catch (err) { next(err); }
  }
);

module.exports = router;
