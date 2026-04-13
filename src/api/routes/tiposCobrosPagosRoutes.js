const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/tiposCobrosPagosRepo');
const { requirePermission } = require('../middleware/auth');

// GET — abierto: el POS los necesita para poblar el modal de pagos
router.get('/', async (req, res, next) => {
  try { res.json(await repo.GetAll(req.query.tipoMovimiento)); } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await repo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Tipo cobro/pago no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/',
  requirePermission({ especial: 'CONFIG.TIPOS_COBRO_PAGO' }),
  async (req, res, next) => {
    try { res.status(201).json(await repo.Create(req.body)); } catch (err) { next(err); }
  }
);

router.put('/:guid',
  requirePermission({ especial: 'CONFIG.TIPOS_COBRO_PAGO' }),
  async (req, res, next) => {
    try { await repo.Update(req.params.guid, req.body); res.json({ ok: true }); } catch (err) { next(err); }
  }
);

router.delete('/:guid',
  requirePermission({ especial: 'CONFIG.TIPOS_COBRO_PAGO' }),
  async (req, res, next) => {
    try { await repo.Delete(req.params.guid); res.json({ ok: true }); } catch (err) { next(err); }
  }
);

module.exports = router;
