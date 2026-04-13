const express = require('express');
const router = express.Router();
const vendedoresRepo = require('../../db/repositories/vendedoresRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/',
  requirePermission({ modulo: 'VENDEDORES', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await vendedoresRepo.GetAll();
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
