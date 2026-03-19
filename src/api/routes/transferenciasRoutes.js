const express = require('express');
const router = express.Router();
const transferenciasRepo = require('../../db/repositories/transferenciasRepo');

router.post('/', async (req, res, next) => {
  try {
    const { guidSucursalOrigen, guidSucursalDestino, items, observaciones } = req.body;
    const data = await transferenciasRepo.CreateTransferencia({ guidSucursalOrigen, guidSucursalDestino, items, observaciones });
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { desde, hasta, guidSucursal } = req.query;
    const data = await transferenciasRepo.GetTransferencias({ desde, hasta, guidSucursal });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await transferenciasRepo.GetTransferenciaDetalle(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Transferencia no encontrada' });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
