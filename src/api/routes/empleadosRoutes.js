const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/empleadosRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await repo.GetAll(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
