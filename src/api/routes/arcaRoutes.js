const express = require('express');
const router = express.Router();
const arcaRepo = require('../../db/repositories/arcaRepo');

// POST /api/arca/autorizar
router.post('/autorizar', async (req, res, next) => {
  try {
    const { guidFactura } = req.body;
    if (!guidFactura) return res.status(400).json({ error: 'guidFactura es requerido' });

    const result = await arcaRepo.AutorizarFactura(guidFactura);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
