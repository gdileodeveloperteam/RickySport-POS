const express = require('express');
const router = express.Router();
const tcPagosRepo = require('../../db/repositories/tcPagosRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await tcPagosRepo.GetAll();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid/planes', async (req, res, next) => {
  try {
    const data = await tcPagosRepo.GetPlanes(req.params.guid);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
