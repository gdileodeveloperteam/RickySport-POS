const express = require('express');
const router = express.Router();
const gastosRepo = require('../../db/repositories/gastosRepo');
const { requirePermission } = require('../middleware/auth');

// Crear gasto
router.post('/',
  requirePermission({ modulo: 'GASTOS', nivel: 2 }),
  async (req, res, next) => {
    try {
      const { guidSucursal, rubro, descripcion, importe, medioPago, guidProveedores, guidBancosCuentas, guidBanco, guidUsuario } = req.body;
      if (!rubro || !rubro.trim()) return res.status(400).json({ error: 'El rubro es obligatorio' });
      if (!importe || importe <= 0) return res.status(400).json({ error: 'El importe debe ser mayor a 0' });
      const data = await gastosRepo.CreateGasto({ guidSucursal, rubro, descripcion, importe, medioPago, guidProveedores, guidBancosCuentas, guidBanco, guidUsuario });
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

// Crear adelanto
router.post('/adelanto',
  requirePermission({ modulo: 'GASTOS', nivel: 2 }),
  async (req, res, next) => {
    try {
      const { guidSucursal, guidEmpleado, importe, observaciones, mesImputacion, medioPago, guidBancosCuentas, guidBanco, guidUsuario } = req.body;
      if (!guidEmpleado) return res.status(400).json({ error: 'Debe seleccionar un empleado' });
      if (!importe || importe <= 0) return res.status(400).json({ error: 'El importe debe ser mayor a 0' });
      const data = await gastosRepo.CreateAdelanto({ guidSucursal, guidEmpleado, importe, observaciones, mesImputacion, medioPago, guidBancosCuentas, guidBanco, guidUsuario });
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

// Listar gastos
router.get('/',
  requirePermission({ modulo: 'GASTOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await gastosRepo.GetGastos({
        desde: req.query.desde,
        hasta: req.query.hasta,
        guidSucursal: req.query.guidSucursal,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
