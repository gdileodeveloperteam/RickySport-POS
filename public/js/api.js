const API = (function () {
  const BASE = '/api';

  async function Request(url, options = {}) {
    const res = await fetch(`${BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Error en la solicitud');
    }
    return res.json();
  }

  // Usuarios
  async function Login(id, clave) {
    return Request('/usuarios/login', { method: 'POST', body: JSON.stringify({ id, clave }) });
  }

  async function GetUsuarios() {
    return Request('/usuarios');
  }
  async function GetUsuarioByGuid(guid) { return Request(`/usuarios/${guid}`); }
  async function CreateUsuario(data) { return Request('/usuarios/crear', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateUsuario(guid, data) { return Request(`/usuarios/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteUsuario(guid) { return Request(`/usuarios/${guid}`, { method: 'DELETE' }); }

  // Artículos
  async function GetArticulos(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/articulos${q}`);
  }

  async function GetArticuloByCodigo(codigo) {
    return Request(`/articulos/codigo/${encodeURIComponent(codigo)}`);
  }

  async function GetArticuloByGuid(guid) {
    return Request(`/articulos/${guid}`);
  }

  async function GetMovimientoArticulos(guidArticulo) {
    return Request(`/articulos/${guidArticulo}/movimientos`);
  }

  // Clientes
  async function GetClientes(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/clientes${q}`);
  }

  async function CreateCliente(data) {
    return Request('/clientes', { method: 'POST', body: JSON.stringify(data) });
  }

  async function GetClienteByGuid(guid) {
    return Request(`/clientes/${guid}`);
  }

  async function UpdateClienteContacto(guid, data) {
    return Request(`/clientes/${guid}/contacto`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async function GetClienteSaldo(guid) {
    return Request(`/clientes/${guid}/saldo`);
  }
  async function GetClienteMovimientos(guid, params = {}) {
    const q = new URLSearchParams(params).toString();
    return Request(`/clientes/${guid}/movimientos${q ? '?' + q : ''}`);
  }
  async function GetClienteFacturas(guid, params = {}) {
    const q = new URLSearchParams(params).toString();
    return Request(`/clientes/${guid}/facturas${q ? '?' + q : ''}`);
  }
  async function GetClienteDeudaActiva(guid) {
    return Request(`/clientes/${guid}/deuda-activa`);
  }
  async function CobroDeuda(data) {
    return Request('/clientes/cobro-deuda', { method: 'POST', body: JSON.stringify(data) });
  }

  async function GetClientesCtaCte(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/clientes/ctacte${q}`);
  }

  async function ValidarCreditoCtaCte(guid, importe) {
    return Request(`/clientes/ctacte/${guid}/validar?importe=${importe}`);
  }

  // Sucursales
  async function GetSucursales() {
    return Request('/sucursales');
  }
  async function GetSucursalByGuid(guid) { return Request(`/sucursales/${guid}`); }
  async function CreateSucursal(data) { return Request('/sucursales', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateSucursal(guid, data) { return Request(`/sucursales/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteSucursal(guid) { return Request(`/sucursales/${guid}`, { method: 'DELETE' }); }

  // Vendedores
  async function GetVendedores() {
    return Request('/vendedores');
  }

  // TCPagos
  async function GetTCPagos() { return Request('/tcpagos'); }
  async function GetTCPagoByGuid(guid) { return Request(`/tcpagos/${guid}`); }
  async function CreateTCPago(data) { return Request('/tcpagos', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateTCPago(guid, data) { return Request(`/tcpagos/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteTCPago(guid) { return Request(`/tcpagos/${guid}`, { method: 'DELETE' }); }

  // TCPagosPlanes
  async function GetTCPagosPlanes(guid) { return Request(`/tcpagos/${guid}/planes`); }
  async function CreateTCPagoPlan(guidTcPago, data) { return Request(`/tcpagos/${guidTcPago}/planes`, { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateTCPagoPlan(guid, data) { return Request(`/tcpagos/planes/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteTCPagoPlan(guid) { return Request(`/tcpagos/planes/${guid}`, { method: 'DELETE' }); }

  // Ventas
  async function CreateVenta(data) {
    return Request('/ventas', { method: 'POST', body: JSON.stringify(data) });
  }

  async function GetVentas(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/ventas?${q.toString()}`);
  }

  async function GetVentaDetalle(guid) {
    return Request(`/ventas/${guid}`);
  }
  async function GetFacturaDetalle(guid) {
    return Request(`/ventas/factura/${guid}`);
  }

  async function GetResumenPagos(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/ventas/resumen/pagos?${q.toString()}`);
  }

  async function GetVentasPorSucursal(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    return Request(`/ventas/resumen/sucursales?${q.toString()}`);
  }

  async function GetTotalesDevCambios(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/ventas/resumen/dev-cambios?${q.toString()}`);
  }

  // Devoluciones
  async function CreateDevolucion(data) {
    return Request('/devoluciones', { method: 'POST', body: JSON.stringify(data) });
  }

  async function GetDevolucionDetalle(guid) {
    return Request(`/devoluciones/${guid}`);
  }

  async function GetCreditosCliente(guidCliente) {
    return Request(`/devoluciones/creditos/${guidCliente}`);
  }

  async function GetCreditoByDevolucion(guidDevolucion) {
    return Request(`/devoluciones/credito-by-devolucion/${guidDevolucion}`);
  }

  // Cambios de mercaderia (atomico: cambio + venta + cobro)
  async function CreateCambioConVenta(data) {
    return Request('/devoluciones/cambio', { method: 'POST', body: JSON.stringify(data) });
  }

  async function GetDevoluciones(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/devoluciones?${q.toString()}`);
  }

  async function GetCambioDetalle(guid) {
    return Request(`/devoluciones/cambios/${guid}`);
  }

  async function GetCambiosList(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/devoluciones/cambios?${q.toString()}`);
  }

  // Transferencias
  async function CreateTransferencia(data) {
    return Request('/transferencias', { method: 'POST', body: JSON.stringify(data) });
  }

  async function GetTransferencias(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/transferencias?${q.toString()}`);
  }

  async function GetTransferenciaDetalle(guid) {
    return Request(`/transferencias/${guid}`);
  }

  // Bancos
  async function GetBancos(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/bancos${q}`);
  }
  async function GetBancoByGuid(guid) { return Request(`/bancos/${guid}`); }
  async function CreateBanco(data) { return Request('/bancos', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateBanco(guid, data) { return Request(`/bancos/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteBanco(guid) { return Request(`/bancos/${guid}`, { method: 'DELETE' }); }

  // BancosConceptos
  async function GetBancosConceptos(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/bancos-conceptos${q}`);
  }
  async function GetBancoConceptoByGuid(guid) { return Request(`/bancos-conceptos/${guid}`); }
  async function CreateBancoConcepto(data) { return Request('/bancos-conceptos', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateBancoConcepto(guid, data) { return Request(`/bancos-conceptos/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteBancoConcepto(guid) { return Request(`/bancos-conceptos/${guid}`, { method: 'DELETE' }); }

  // BancosCuentas
  async function GetBancosCuentas(guidBanco) {
    const q = guidBanco ? `?guidBanco=${encodeURIComponent(guidBanco)}` : '';
    return Request(`/bancos-cuentas${q}`);
  }
  async function GetBancoCuentaByGuid(guid) { return Request(`/bancos-cuentas/${guid}`); }
  async function CreateBancoCuenta(data) { return Request('/bancos-cuentas', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateBancoCuenta(guid, data) { return Request(`/bancos-cuentas/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteBancoCuenta(guid) { return Request(`/bancos-cuentas/${guid}`, { method: 'DELETE' }); }

  // Empleados
  async function GetEmpleados(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/empleados${q}`);
  }
  async function GetEmpleadoAdelantos(guid, params = {}) {
    const q = new URLSearchParams(params).toString();
    return Request(`/empleados/${guid}/adelantos${q ? '?' + q : ''}`);
  }

  // Proveedores
  async function GetProveedores(search, guidConfiguracion) {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (guidConfiguracion) q.set('guidConfiguracion', guidConfiguracion);
    return Request(`/proveedores?${q.toString()}`);
  }

  // Gastos
  async function CreateGasto(data) {
    return Request('/gastos', { method: 'POST', body: JSON.stringify(data) });
  }
  async function CreateAdelanto(data) {
    return Request('/gastos/adelanto', { method: 'POST', body: JSON.stringify(data) });
  }
  async function GetGastos(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/gastos?${q.toString()}`);
  }

  // Condicion Articulos
  async function GetCondicionArticulos() {
    return Request('/condicion-articulos');
  }

  // Compras
  async function CreateCompra(data) {
    return Request('/compras', { method: 'POST', body: JSON.stringify(data) });
  }
  async function GetCompras(params) {
    const q = new URLSearchParams();
    if (params.desde) q.set('desde', params.desde);
    if (params.hasta) q.set('hasta', params.hasta);
    if (params.guidSucursal) q.set('guidSucursal', params.guidSucursal);
    return Request(`/compras?${q.toString()}`);
  }
  async function GetCompraDetalle(guid) {
    return Request(`/compras/${guid}`);
  }

  // TiposCobrosPagos
  async function GetTiposCobrosPagos(tipoMovimiento) {
    const q = tipoMovimiento ? `?tipoMovimiento=${encodeURIComponent(tipoMovimiento)}` : '';
    return Request(`/tipos-cobros-pagos${q}`);
  }
  async function GetTipoCobroPagoByGuid(guid) { return Request(`/tipos-cobros-pagos/${guid}`); }
  async function CreateTipoCobroPago(data) { return Request('/tipos-cobros-pagos', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateTipoCobroPago(guid, data) { return Request(`/tipos-cobros-pagos/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteTipoCobroPago(guid) { return Request(`/tipos-cobros-pagos/${guid}`, { method: 'DELETE' }); }

  // ConceptosPorBanco
  async function GetConceptosPorBanco(guidBanco) {
    const q = guidBanco ? `?guidBanco=${encodeURIComponent(guidBanco)}` : '';
    return Request(`/conceptos-por-banco${q}`);
  }
  async function GetConceptoPorBancoByGuid(guid) { return Request(`/conceptos-por-banco/${guid}`); }
  async function CreateConceptoPorBanco(data) { return Request('/conceptos-por-banco', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateConceptoPorBanco(guid, data) { return Request(`/conceptos-por-banco/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteConceptoPorBanco(guid) { return Request(`/conceptos-por-banco/${guid}`, { method: 'DELETE' }); }

  // Caja Diaria
  async function GetCajaDiaria(params = {}) {
    const q = new URLSearchParams(params).toString();
    return Request(`/caja-diaria${q ? '?' + q : ''}`);
  }
  async function GetCajaDiariaResumen(params = {}) {
    const q = new URLSearchParams(params).toString();
    return Request(`/caja-diaria/resumen${q ? '?' + q : ''}`);
  }

  return {
    Login, GetUsuarios, GetUsuarioByGuid, CreateUsuario, UpdateUsuario, DeleteUsuario,
    GetArticulos, GetArticuloByCodigo, GetArticuloByGuid, GetMovimientoArticulos,
    GetClientes, CreateCliente, UpdateClienteContacto, GetClienteByGuid, GetClienteSaldo, GetClientesCtaCte, ValidarCreditoCtaCte, GetClienteMovimientos, GetClienteFacturas, GetClienteDeudaActiva, CobroDeuda,
    GetSucursales, GetSucursalByGuid, CreateSucursal, UpdateSucursal, DeleteSucursal, GetVendedores,
    GetTCPagos, GetTCPagoByGuid, CreateTCPago, UpdateTCPago, DeleteTCPago,
    GetTCPagosPlanes, CreateTCPagoPlan, UpdateTCPagoPlan, DeleteTCPagoPlan,
    CreateVenta, GetVentas, GetVentaDetalle, GetFacturaDetalle, GetResumenPagos, GetVentasPorSucursal, GetTotalesDevCambios,
    CreateDevolucion, GetDevolucionDetalle, GetCreditosCliente, GetCreditoByDevolucion, CreateCambioConVenta, GetDevoluciones, GetCambioDetalle, GetCambiosList,
    CreateTransferencia, GetTransferencias, GetTransferenciaDetalle,
    GetEmpleados, GetEmpleadoAdelantos, GetProveedores,
    CreateGasto, CreateAdelanto, GetGastos,
    GetCondicionArticulos,
    CreateCompra, GetCompras, GetCompraDetalle,
    GetBancos, GetBancoByGuid, CreateBanco, UpdateBanco, DeleteBanco,
    GetBancosConceptos, GetBancoConceptoByGuid, CreateBancoConcepto, UpdateBancoConcepto, DeleteBancoConcepto,
    GetBancosCuentas, GetBancoCuentaByGuid, CreateBancoCuenta, UpdateBancoCuenta, DeleteBancoCuenta,
    GetConceptosPorBanco, GetConceptoPorBancoByGuid, CreateConceptoPorBanco, UpdateConceptoPorBanco, DeleteConceptoPorBanco,
    GetTiposCobrosPagos, GetTipoCobroPagoByGuid, CreateTipoCobroPago, UpdateTipoCobroPago, DeleteTipoCobroPago,
    GetCajaDiaria, GetCajaDiariaResumen,
  };
})();
