require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/usuarios', require('./api/routes/usuariosRoutes'));
app.use('/api/articulos', require('./api/routes/articulosRoutes'));
app.use('/api/clientes', require('./api/routes/clientesRoutes'));
app.use('/api/sucursales', require('./api/routes/sucursalesRoutes'));
app.use('/api/vendedores', require('./api/routes/vendedoresRoutes'));
app.use('/api/tcpagos', require('./api/routes/tcPagosRoutes'));
app.use('/api/ventas', require('./api/routes/ventasRoutes'));
app.use('/api/devoluciones', require('./api/routes/devolucionesRoutes'));
app.use('/api/transferencias', require('./api/routes/transferenciasRoutes'));
app.use('/api/bancos', require('./api/routes/bancosRoutes'));
app.use('/api/bancos-conceptos', require('./api/routes/bancosConceptosRoutes'));
app.use('/api/bancos-cuentas', require('./api/routes/bancosCuentasRoutes'));
app.use('/api/conceptos-por-banco', require('./api/routes/conceptosPorBancoRoutes'));
app.use('/api/empleados', require('./api/routes/empleadosRoutes'));
app.use('/api/proveedores', require('./api/routes/proveedoresRoutes'));
app.use('/api/gastos', require('./api/routes/gastosRoutes'));
app.use('/api/compras', require('./api/routes/comprasRoutes'));
app.use('/api/condicion-articulos', require('./api/routes/condicionArticulosRoutes'));

// SPA fallback
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`RickySport POS corriendo en http://localhost:${PORT}`);
});
