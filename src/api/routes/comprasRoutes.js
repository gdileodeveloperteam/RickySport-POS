const express = require('express');
const router = express.Router();
const comprasRepo = require('../../db/repositories/comprasRepo');
const { requirePermission } = require('../middleware/auth');

router.post('/',
  requirePermission({ modulo: 'COMPRAS', nivel: 2 }),
  async (req, res, next) => {
    try {
      const { guidProveedor, nombreProveedor, guidSucursal, items, observaciones } = req.body;
      if (!items || items.length === 0) return res.status(400).json({ error: 'Debe agregar al menos un artículo' });
      if (!guidProveedor) return res.status(400).json({ error: 'Debe seleccionar un proveedor' });
      const data = await comprasRepo.CreateCompra({ guidProveedor, nombreProveedor, guidSucursal, items, observaciones });
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

router.get('/',
  requirePermission({ modulo: 'COMPRAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await comprasRepo.GetCompras({
        desde: req.query.desde,
        hasta: req.query.hasta,
        guidSucursal: req.query.guidSucursal,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid',
  requirePermission({ modulo: 'COMPRAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await comprasRepo.GetCompraDetalle(req.params.guid);
      if (!data.compra) return res.status(404).json({ error: 'Compra no encontrada' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
