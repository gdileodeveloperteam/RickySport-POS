const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/usuariosRepo');

router.post('/login', async (req, res, next) => {
  try {
    const { id, clave } = req.body;
    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }
    const usuario = await repo.Login(id.trim(), clave || '');
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o clave incorrectos' });
    }
    res.json(usuario);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const usuarios = await repo.GetAll();
    res.json(usuarios);
  } catch (err) { next(err); }
});

module.exports = router;
