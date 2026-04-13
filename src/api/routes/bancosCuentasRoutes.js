const express = require('express');
const router = express.Router();
const bancosCuentasRepo = require('../../db/repositories/bancosCuentasRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/',
  requirePermission({ modulo: 'BANCOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await bancosCuentasRepo.GetAll(req.query.guidBanco);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid',
  requirePermission({ modulo: 'BANCOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await bancosCuentasRepo.GetByGuid(req.params.guid);
      if (!data) return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.post('/',
  requirePermission({ modulo: 'BANCOS', nivel: 2 }),
  async (req, res, next) => {
    try {
      const result = await bancosCuentasRepo.Create(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }
);

router.put('/:guid',
  requirePermission({ modulo: 'BANCOS', nivel: 3 }),
  async (req, res, next) => {
    try {
      await bancosCuentasRepo.Update(req.params.guid, req.body);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

router.delete('/:guid',
  requirePermission({ modulo: 'BANCOS', nivel: 4 }),
  async (req, res, next) => {
    try {
      await bancosCuentasRepo.Delete(req.params.guid);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

module.exports = router;
