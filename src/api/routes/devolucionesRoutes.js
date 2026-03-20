const express = require('express');
const router = express.Router();
const devolucionesRepo = require('../../db/repositories/devolucionesRepo');

// Devolucion (reingresa mercaderia, registra en RemitosDevoluciones)
router.post('/', async (req, res, next) => {
  try {
    const { guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, items, motivo, tipoDevolucion, emitirNotaCredito } = req.body;
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ error: 'El motivo de devolucion es obligatorio' });
    }
    const data = await devolucionesRepo.CreateDevolucion({ guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, items, motivo, tipoDevolucion, emitirNotaCredito });
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// Cambio con venta (atomico: graba cambio + venta nueva + cobro automatico)
router.post('/cambio', async (req, res, next) => {
  try {
    const { guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, motivo, tipoCambio, itemsCambio, itemsVenta, pagos } = req.body;
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ error: 'El motivo del cambio es obligatorio' });
    }
    if (!itemsVenta || itemsVenta.length === 0) {
      return res.status(400).json({ error: 'Debe cargar articulos para la nueva venta' });
    }
    const data = await devolucionesRepo.CreateCambioConVenta({
      guidRemitoOriginal, guidCliente, guidSucursal, guidVendedor, nombre, motivo, tipoCambio,
      itemsCambio, itemsVenta, pagos,
    });
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// Creditos disponibles de un cliente (DEBE ir antes de /:guid)
router.get('/creditos/:guidCliente', async (req, res, next) => {
  try {
    const data = await devolucionesRepo.GetCreditosCliente(req.params.guidCliente);
    res.json(data);
  } catch (err) { next(err); }
});

// Detalle de devolucion (para comprobante PDF)
router.get('/:guid', async (req, res, next) => {
  try {
    const data = await devolucionesRepo.GetDevolucionDetalle(req.params.guid);
    if (!data.devolucion) return res.status(404).json({ error: 'Devolucion no encontrada' });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
