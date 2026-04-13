const express = require('express');
const router = express.Router();
const articulosRepo = require('../../db/repositories/articulosRepo');
const { requirePermission } = require('../middleware/auth');

// Listar artículos con paginación
router.get('/',
  requirePermission({ modulo: 'ARTICULOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { search, page, limit, sortBy, sortDir, guidProveedor } = req.query;
      const data = await articulosRepo.GetAll({
        search, page: parseInt(page) || 1, limit: parseInt(limit) || 30,
        sortBy, sortDir, guidProveedor,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

// Obtener por código
router.get('/codigo/:codigo',
  requirePermission({ modulo: 'ARTICULOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await articulosRepo.GetByCodigo(req.params.codigo);
      if (!data) return res.status(404).json({ error: 'Articulo no encontrado' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

// Obtener por GUID
router.get('/:guid',
  requirePermission({ modulo: 'ARTICULOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await articulosRepo.GetByGuid(req.params.guid);
      if (!data) return res.status(404).json({ error: 'Articulo no encontrado' });
      res.json(data);
    } catch (err) { next(err); }
  }
);

// Movimientos (talles/colores) de un artículo
router.get('/:guid/movimientos',
  requirePermission({ modulo: 'ARTICULOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const data = await articulosRepo.GetMovimientoArticulos(req.params.guid);
      res.json(data);
    } catch (err) { next(err); }
  }
);

// Crear artículo
router.post('/',
  requirePermission({ modulo: 'ARTICULOS', nivel: 2 }),
  async (req, res, next) => {
    try {
      const { codigoArticulo, codigoArticuloRel, descripcion, precioCosto, precioVenta,
        talleDesde, talleHasta, color, utilidad, tipo, guidGrupos, guidProveedores,
        costoDolar, ventaDolar, movimientos } = req.body;
      if (!descripcion || !descripcion.trim()) {
        return res.status(400).json({ error: 'La descripción es obligatoria' });
      }
      const data = await articulosRepo.Create({
        codigoArticulo, codigoArticuloRel, descripcion, precioCosto, precioVenta,
        talleDesde, talleHasta, color, utilidad, tipo, guidGrupos, guidProveedores,
        costoDolar, ventaDolar, movimientos,
      });
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

// Actualizar artículo
router.put('/:guid',
  requirePermission({ modulo: 'ARTICULOS', nivel: 3 }),
  async (req, res, next) => {
    try {
      const { codigoArticulo, codigoArticuloRel, descripcion, precioCosto, precioVenta,
        talleDesde, talleHasta, color, utilidad, tipo, guidGrupos, guidProveedores,
        costoDolar, ventaDolar, movimientos } = req.body;
      const data = await articulosRepo.Update(req.params.guid, {
        codigoArticulo, codigoArticuloRel, descripcion, precioCosto, precioVenta,
        talleDesde, talleHasta, color, utilidad, tipo, guidGrupos, guidProveedores,
        costoDolar, ventaDolar, movimientos,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

// Eliminar artículo (soft delete)
router.delete('/:guid',
  requirePermission({ modulo: 'ARTICULOS', nivel: 4 }),
  async (req, res, next) => {
    try {
      const data = await articulosRepo.Delete(req.params.guid);
      res.json(data);
    } catch (err) { next(err); }
  }
);

module.exports = router;
