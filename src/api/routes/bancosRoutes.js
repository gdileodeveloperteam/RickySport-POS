const express = require('express');
const router = express.Router();
const bancosRepo = require('../../db/repositories/bancosRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await bancosRepo.GetAll(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await bancosRepo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Banco no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const result = await bancosRepo.Create(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put('/:guid', async (req, res, next) => {
  try {
    await bancosRepo.Update(req.params.guid, req.body);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/:guid', async (req, res, next) => {
  try {
    await bancosRepo.Delete(req.params.guid);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
