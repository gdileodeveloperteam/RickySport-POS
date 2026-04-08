const express = require('express');
const router = express.Router();
const configRepo = require('../../db/repositories/configRepo');
const auditoriaPreciosRepo = require('../../db/repositories/auditoriaPreciosRepo');

// Obtener el % máximo de descuento
router.get('/max-descuento', async (req, res, next) => {
  try {
    const porcentaje = await configRepo.GetMaxDescuento();
    res.json({ porcentaje });
  } catch (err) { next(err); }
});

// Actualizar el % máximo de descuento
router.put('/max-descuento', async (req, res, next) => {
  try {
    const { porcentaje } = req.body;
    if (porcentaje == null || porcentaje < 0 || porcentaje > 100) {
      return res.status(400).json({ error: 'El porcentaje debe estar entre 0 y 100' });
    }
    const data = await configRepo.SetMaxDescuento(porcentaje);
    res.json(data);
  } catch (err) { next(err); }
});

// Consultar auditoría de cambios de precio
router.get('/auditoria-precios', async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    // Convertir ISO (YYYY-MM-DD) a int (YYYYMMDD)
    const desdeInt = desde ? parseInt(desde.replace(/-/g, '')) : undefined;
    const hastaInt = hasta ? parseInt(hasta.replace(/-/g, '')) : undefined;
    const data = await auditoriaPreciosRepo.GetCambiosPrecios({ desde: desdeInt, hasta: hastaInt });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
