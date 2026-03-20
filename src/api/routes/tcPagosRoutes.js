const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/tcPagosRepo');

// ── TCPagos ────────────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try { res.json(await repo.GetAll()); } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await repo.Create(req.body)); } catch (err) { next(err); }
});

// ── TCPagosPlanes (rutas con prefijo literal antes de /:guid) ──────────────────
router.put('/planes/:guid', async (req, res, next) => {
  try { await repo.UpdatePlan(req.params.guid, req.body); res.json({ ok: true }); } catch (err) { next(err); }
});

router.delete('/planes/:guid', async (req, res, next) => {
  try { await repo.DeletePlan(req.params.guid); res.json({ ok: true }); } catch (err) { next(err); }
});

// ── TCPagos por GUID ───────────────────────────────────────────────────────────
router.get('/:guid', async (req, res, next) => {
  try {
    const data = await repo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'TCPago no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.put('/:guid', async (req, res, next) => {
  try { await repo.Update(req.params.guid, req.body); res.json({ ok: true }); } catch (err) { next(err); }
});

router.delete('/:guid', async (req, res, next) => {
  try { await repo.Delete(req.params.guid); res.json({ ok: true }); } catch (err) { next(err); }
});

// ── Planes de un TCPago ────────────────────────────────────────────────────────
router.get('/:guid/planes', async (req, res, next) => {
  try { res.json(await repo.GetPlanes(req.params.guid)); } catch (err) { next(err); }
});

router.post('/:guid/planes', async (req, res, next) => {
  try {
    req.body.guidTcPagos = req.params.guid;
    res.status(201).json(await repo.CreatePlan(req.body));
  } catch (err) { next(err); }
});

module.exports = router;
