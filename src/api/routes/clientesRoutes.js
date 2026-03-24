const express = require('express');
const router = express.Router();
const clientesRepo = require('../../db/repositories/clientesRepo');

router.get('/', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetAll(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await clientesRepo.Create(req.body)); } catch (err) { next(err); }
});

router.post('/recalcular-saldos', async (req, res, next) => {
  try {
    const data = await clientesRepo.RecalcularSaldos();
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/cobro-deuda', async (req, res, next) => {
  try {
    const data = await clientesRepo.CobroDeuda(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.get('/ctacte', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetCtaCte(req.query.search);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/ctacte/:guid/validar', async (req, res, next) => {
  try {
    const importe = parseFloat(req.query.importe) || 0;
    const data = await clientesRepo.ValidarCreditoCtaCte(req.params.guid, importe);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetByGuid(req.params.guid);
    if (!data) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid/saldo', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetSaldo(req.params.guid);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid/movimientos', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetMovimientos(req.params.guid, req.query.desde, req.query.hasta);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid/facturas', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetFacturas(req.params.guid, req.query.desde, req.query.hasta);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:guid/deuda-activa', async (req, res, next) => {
  try {
    const data = await clientesRepo.GetDeudaActiva(req.params.guid);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
