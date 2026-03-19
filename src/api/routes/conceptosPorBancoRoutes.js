const express = require('express');
const router = express.Router();
const conceptosPorBancoRepo = require('../../db/repositories/conceptosPorBancoRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await conceptosPorBancoRepo.GetAll(req.query.guidBanco);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await conceptosPorBancoRepo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Concepto por banco no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const result = await conceptosPorBancoRepo.Create(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put('/:guid', async (req, res, next) => {
  try {
    await conceptosPorBancoRepo.Update(req.params.guid, req.body);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/:guid', async (req, res, next) => {
  try {
    await conceptosPorBancoRepo.Delete(req.params.guid);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
