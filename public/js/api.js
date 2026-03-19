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

  async function GetClienteByGuid(guid) {
    return Request(`/clientes/${guid}`);
  }

  async function GetClienteSaldo(guid) {
    return Request(`/clientes/${guid}/saldo`);
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

  // Vendedores
  async function GetVendedores() {
    return Request('/vendedores');
  }

  // TCPagos
  async function GetTCPagos() {
    return Request('/tcpagos');
  }

  async function GetTCPagosPlanes(guid) {
    return Request(`/tcpagos/${guid}/planes`);
  }

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

  // Cambios de mercaderia (atomico: cambio + venta + cobro)
  async function CreateCambioConVenta(data) {
    return Request('/devoluciones/cambio', { method: 'POST', body: JSON.stringify(data) });
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

  // Proveedores
  async function GetProveedores(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return Request(`/proveedores${q}`);
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

  // ConceptosPorBanco
  async function GetConceptosPorBanco(guidBanco) {
    const q = guidBanco ? `?guidBanco=${encodeURIComponent(guidBanco)}` : '';
    return Request(`/conceptos-por-banco${q}`);
  }
  async function GetConceptoPorBancoByGuid(guid) { return Request(`/conceptos-por-banco/${guid}`); }
  async function CreateConceptoPorBanco(data) { return Request('/conceptos-por-banco', { method: 'POST', body: JSON.stringify(data) }); }
  async function UpdateConceptoPorBanco(guid, data) { return Request(`/conceptos-por-banco/${guid}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async function DeleteConceptoPorBanco(guid) { return Request(`/conceptos-por-banco/${guid}`, { method: 'DELETE' }); }

  return {
    Login, GetUsuarios,
    GetArticulos, GetArticuloByCodigo, GetArticuloByGuid, GetMovimientoArticulos,
    GetClientes, GetClienteByGuid, GetClienteSaldo, GetClientesCtaCte, ValidarCreditoCtaCte,
    GetSucursales, GetVendedores,
    GetTCPagos, GetTCPagosPlanes,
    CreateVenta, GetVentas, GetVentaDetalle, GetResumenPagos, GetVentasPorSucursal, GetTotalesDevCambios,
    CreateDevolucion, CreateCambioConVenta,
    CreateTransferencia, GetTransferencias, GetTransferenciaDetalle,
    GetEmpleados, GetProveedores,
    CreateGasto, CreateAdelanto, GetGastos,
    CreateCompra, GetCompras, GetCompraDetalle,
    GetBancos, GetBancoByGuid, CreateBanco, UpdateBanco, DeleteBanco,
    GetBancosConceptos, GetBancoConceptoByGuid, CreateBancoConcepto, UpdateBancoConcepto, DeleteBancoConcepto,
    GetBancosCuentas, GetBancoCuentaByGuid, CreateBancoCuenta, UpdateBancoCuenta, DeleteBancoCuenta,
    GetConceptosPorBanco, GetConceptoPorBancoByGuid, CreateConceptoPorBanco, UpdateConceptoPorBanco, DeleteConceptoPorBanco,
  };
})();
