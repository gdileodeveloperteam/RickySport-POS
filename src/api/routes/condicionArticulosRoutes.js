const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/condicionArticulosRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await repo.GetAll();
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
