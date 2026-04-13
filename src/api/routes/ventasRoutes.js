const express = require('express');
const router = express.Router();
const ventasRepo = require('../../db/repositories/ventasRepo');
const { requirePermission } = require('../middleware/auth');

router.post('/',
  requirePermission({ modulo: 'POS', nivel: 2 }),
  async (req, res, next) => {
    try {
      const { guidCliente, guidSucursal, guidVendedor, guidUsuario, nombre, cuit, tipoOperacion, items, pagos, emitirFactura } = req.body;
      const data = await ventasRepo.CreateVenta({ guidCliente, guidSucursal, guidVendedor, guidUsuario, nombre, cuit, tipoOperacion, items, pagos, emitirFactura });
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

router.get('/',
  requirePermission({ modulo: 'VENTAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { desde, hasta, guidSucursal } = req.query;
      const data = await ventasRepo.GetVentas({ desde, hasta, guidSucursal });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/resumen/pagos',
  requirePermission({ modulo: 'VENTAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { desde, hasta, guidSucursal } = req.query;
      const data = await ventasRepo.GetResumenPagos({ desde, hasta, guidSucursal });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/resumen/sucursales',
  requirePermission({ modulo: 'VENTAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { desde, hasta } = req.query;
      const data = await ventasRepo.GetVentasPorSucursal({ desde, hasta });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/resumen/dev-cambios',
  requirePermission({ modulo: 'VENTAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { desde, hasta, guidSucursal } = req.query;
      const data = await ventasRepo.GetTotalesDevCambios({ desde, hasta, guidSucursal });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/factura/:guid',
  requirePermission({ modulo: 'VENTAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await ventasRepo.GetFacturaDetalle(req.params.guid);
      if (!data) return res.status(404).json({ error: 'Factura no encontrada' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid',
  requirePermission({ modulo: 'VENTAS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await ventasRepo.GetVentaDetalle(req.params.guid);
      if (!data) return res.status(404).json({ error: 'Venta no encontrada' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
