const express = require('express');
const router = express.Router();
const bancosConceptosRepo = require('../../db/repositories/bancosConceptosRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await bancosConceptosRepo.GetAll(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await bancosConceptosRepo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Concepto no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const result = await bancosConceptosRepo.Create(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put('/:guid', async (req, res, next) => {
  try {
    await bancosConceptosRepo.Update(req.params.guid, req.body);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/:guid', async (req, res, next) => {
  try {
    await bancosConceptosRepo.Delete(req.params.guid);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
