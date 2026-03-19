const express = require('express');
const router = express.Router();
const vendedoresRepo = require('../../db/repositories/vendedoresRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await vendedoresRepo.GetAll();
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
