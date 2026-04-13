const express = require('express');
const router = express.Router();
const repo = require('../../db/repositories/usuariosRepo');
const seguridadRepo = require('../../db/repositories/seguridadRepo');
const { requirePermission } = require('../middleware/auth');

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

    // Resolver rol + permisos efectivos desde la matriz de seguridad (Fase 2).
    // Si por alguna razon falla (usuario sin rol, etc.), se retornan permisos vacios
    // para no romper el login — la UI actua como si el usuario no tuviera accesos.
    const perfil = await seguridadRepo.GetUsuarioConPermisos((usuario.GUID || '').trim());

    res.json({
      ...usuario,
      rol: perfil ? perfil.rol : null,
      permisos: perfil ? perfil.permisos : { modulos: {}, especiales: [] },
    });
  } catch (err) { next(err); }
});

router.get('/',
  requirePermission({ modulo: 'USUARIOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const { search, page, limit, sortBy, sortDir } = req.query;
      const data = await repo.GetAll({
        search, page: parseInt(page) || 1, limit: parseInt(limit) || 30,
        sortBy, sortDir,
      });
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get('/:guid',
  requirePermission({ modulo: 'USUARIOS', nivel: 1 }),
  async (req, res, next) => {
    try {
      const usuario = await repo.GetByGuid(req.params.guid);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (err) { next(err); }
  }
);

router.post('/crear',
  requirePermission({ modulo: 'USUARIOS', nivel: 2 }),
  async (req, res, next) => {
    try { res.status(201).json(await repo.Create(req.body)); } catch (err) { next(err); }
  }
);

router.put('/:guid',
  requirePermission({ modulo: 'USUARIOS', nivel: 3 }),
  async (req, res, next) => {
    try { res.json(await repo.Update(req.params.guid, req.body)); } catch (err) { next(err); }
  }
);

router.delete('/:guid',
  requirePermission({ especial: 'USUARIO.ELIMINAR' }),
  async (req, res, next) => {
    try { res.json(await repo.Delete(req.params.guid)); } catch (err) { next(err); }
  }
);

module.exports = router;
