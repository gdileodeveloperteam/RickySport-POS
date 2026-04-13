const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/condicionArticulosRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/',
  requirePermission({ modulo: 'AJUSTES', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await repo.GetAll();
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
