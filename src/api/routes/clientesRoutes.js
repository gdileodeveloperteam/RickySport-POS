const express = require('express');
const router = express.Router();
const clientesRepo = require('../../db/repositories/clientesRepo');
const { requirePermission } = require('../middleware/auth');

router.get('/',
  requirePermission({ modulo: 'CLIENTES', nivel: 1 }),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 30, 200);
      const inactivos = req.query.inactivos === '1';
      const data = await clientesRepo.GetAll(req.query.search, page, limit, inactivos);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.post('/',
  requirePermission({ modulo: 'CLIENTES', nivel: 2 }),
  async (req, res, next) => {
    try { res.status(201).json(await clientesRepo.Create(req.body)); } catch (err) { next(err); }
  }
);

router.patch('/:guid/contacto',
  requirePermission({ modulo: 'CLIENTES', nivel: 3 }),
  async (req, res, next) => {
    try {
      const { email, celular } = req.body;
      await clientesRepo.UpdateContacto(req.params.guid, { email, celular });
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

router.post('/recalcular-saldos',
  requirePermission({ modulo: 'CTACTE', nivel: 3 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.RecalcularSaldos();
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.post('/cobro-deuda',
  requirePermission({ modulo: 'CTACTE', nivel: 2 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.CobroDeuda(req.body);
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

router.get('/ctacte',
  requirePermission({ modulo: 'CTACTE', nivel: 1 }),
  async (req, res, next) => {
    try {
      await clientesRepo.RecalcularSaldos();
      const data = await clientesRepo.GetCtaCte(req.query.search);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/ctacte/:guid/validar',
  requirePermission({ modulo: 'CTACTE', nivel: 1 }),
  async (req, res, next) => {
    try {
      const importe = parseFloat(req.query.importe) || 0;
      const data = await clientesRepo.ValidarCreditoCtaCte(req.params.guid, importe);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.put('/:guid',
  requirePermission({ modulo: 'CLIENTES', nivel: 3 }),
  async (req, res, next) => {
    try {
      await clientesRepo.UpdateCliente(req.params.guid, req.body);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

router.delete('/:guid',
  requirePermission({ modulo: 'CLIENTES', nivel: 4 }),
  async (req, res, next) => {
    try {
      await clientesRepo.DisableCliente(req.params.guid);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

router.post('/:guid/reactivar',
  requirePermission({ especial: 'CLIENTE.REACTIVAR' }),
  async (req, res, next) => {
    try {
      await clientesRepo.EnableCliente(req.params.guid);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

router.get('/:guid',
  requirePermission({ modulo: 'CLIENTES', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.GetByGuid(req.params.guid);
      if (!data) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid/saldo',
  requirePermission({ modulo: 'CTACTE', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.GetSaldo(req.params.guid);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid/movimientos',
  requirePermission({ modulo: 'CTACTE', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.GetMovimientos(req.params.guid, req.query.desde, req.query.hasta);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid/facturas',
  requirePermission({ modulo: 'CTACTE', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.GetFacturas(req.params.guid, req.query.desde, req.query.hasta);
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid/deuda-activa',
  requirePermission({ modulo: 'CTACTE', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await clientesRepo.GetDeudaActiva(req.params.guid);
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
