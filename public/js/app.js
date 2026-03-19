/* ============================================================================
   RickySport POS — Main Application
   SPA vanilla JS con Bootstrap 5
   ============================================================================ */

// ── Estado global ──────────────────────────────────────────────────────────────
const State = {
  sucursales: [],
  vendedores: [],
  tcPagos: [],
  bancosCuentas: [],
  sucursalActual: null,
  currentSection: 'pos',
  usuario: null,
};

// ── Utilidades ─────────────────────────────────────────────────────────────────
function FormatMoney(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);
}

function FormatFechaInt(f) {
  if (!f) return '-';
  // Clarion date: días desde 1800-12-28
  const base = new Date(1800, 11, 28);
  base.setDate(base.getDate() + f);
  const d = base.getDate().toString().padStart(2, '0');
  const m = (base.getMonth() + 1).toString().padStart(2, '0');
  const y = base.getFullYear();
  return `${d}/${m}/${y}`;
}

function FormatHoraInt(h) {
  if (!h) return '';
  const s = String(h).padStart(6, '0');
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

function ShowToast(title, body, type) {
  const el = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const colors = { success: 'bi-check-circle-fill text-success', error: 'bi-x-circle-fill text-danger', info: 'bi-info-circle-fill text-primary' };
  icon.className = `bi me-2 ${colors[type] || colors.info}`;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent = body;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 4000 }).show();
}

function Debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

function TodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function Days30AgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function GetCuentaCajaSucursal() {
  const sucActual = State.sucursales.find(s => s.GUID === State.sucursalActual);
  if (!sucActual) return null;
  const sucNombre = (sucActual.NOMBRE || '').trim().toUpperCase();
  const cuenta = State.bancosCuentas.find(c =>
    (c.TIPOCUENTA || '').trim().toUpperCase().startsWith('CAJA') &&
    (c.SUCURSAL || '').trim().toUpperCase() === sucNombre
  ) || null;
  return cuenta;
}

// ── Sortable Tables ───────────────────────────────────────────────────────────
// Auto-init: cualquier <table> con clase "table-hover" dentro de #mainContent
// se convierte en sortable automaticamente al renderizarse.
// Para excluir un <th> del sort, agregar clase "no-sort".
// Para excluir toda la tabla, agregar clase "no-sort-table".

function MakeSortable(tableOrSelector) {
  const table = typeof tableOrSelector === 'string'
    ? document.querySelector(tableOrSelector) : tableOrSelector;
  if (!table || table.dataset.sortable) return;
  if (table.classList.contains('no-sort-table')) return;
  table.dataset.sortable = '1';
  const thead = table.querySelector('thead');
  if (!thead) return;
  const ths = thead.querySelectorAll('th');

  ths.forEach((th, colIdx) => {
    if (th.classList.contains('no-sort') || th.querySelector('input,button')) return;
    if (th.textContent.trim() === '') return;
    th.classList.add('sortable');
    th.addEventListener('click', () => {
      const tbody = table.querySelector('tbody');
      if (!tbody) return;
      const rows = Array.from(tbody.querySelectorAll('tr'));
      if (rows.length <= 1) return;

      const asc = !th.classList.contains('sort-asc');
      ths.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      th.classList.add(asc ? 'sort-asc' : 'sort-desc');

      rows.sort((a, b) => {
        const cellA = a.children[colIdx];
        const cellB = b.children[colIdx];
        if (!cellA || !cellB) return 0;
        const va = (cellA.textContent || '').trim();
        const vb = (cellB.textContent || '').trim();

        const na = ParseSortNumber(va);
        const nb = ParseSortNumber(vb);
        if (!isNaN(na) && !isNaN(nb)) {
          return asc ? na - nb : nb - na;
        }
        return asc ? va.localeCompare(vb, 'es') : vb.localeCompare(va, 'es');
      });

      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

function ParseSortNumber(str) {
  // Fechas dd/mm/yyyy → yyyymmdd para orden correcto
  const fechaMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (fechaMatch) {
    return parseInt(fechaMatch[3] + fechaMatch[2] + fechaMatch[1], 10);
  }
  // Horas hh:mm → hhmm
  const horaMatch = str.match(/^(\d{2}):(\d{2})$/);
  if (horaMatch) {
    return parseInt(horaMatch[1] + horaMatch[2], 10);
  }
  // Moneda / numeros: "$ 1.234,56" → 1234.56
  const cleaned = str.replace(/[$ ]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
}

// Auto-init: observar cambios en #mainContent y aplicar sort a tablas nuevas
function InitSortableObserver() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  const apply = () => {
    main.querySelectorAll('table.table-hover:not([data-sortable])').forEach(MakeSortable);
  };
  new MutationObserver(apply).observe(main, { childList: true, subtree: true });
}
document.addEventListener('DOMContentLoaded', InitSortableObserver);

// ── Inicialización ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar pantalla de login, esperar autenticación
  document.getElementById('loginForm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); App.Login(); }
  });
  document.getElementById('loginUsuario').focus();
});

async function InitApp() {
  try {
    const [sucursales, vendedores, tcPagos] = await Promise.all([
      API.GetSucursales(),
      API.GetVendedores(),
      API.GetTCPagos(),
    ]);

    // BancosCuentas se carga aparte para no bloquear si falla
    let bancosCuentas = [];
    try { bancosCuentas = await API.GetBancosCuentas(); } catch (e) {
      console.warn('No se pudieron cargar cuentas bancarias:', e.message);
    }
    State.sucursales = sucursales;
    State.vendedores = vendedores;
    State.tcPagos = tcPagos;
    State.bancosCuentas = bancosCuentas;

    const sel = document.getElementById('selectSucursal');
    sel.innerHTML = '';
    sucursales.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.GUID;
      opt.textContent = (s.NOMBRE || '').trim();
      sel.appendChild(opt);
    });

    // Pre-seleccionar sucursal del usuario si tiene asignada
    const guidSucUsuario = (State.usuario.GUIDSUCURSALES || '').trim();
    const sucUsuario = sucursales.find(s => s.GUID.trim() === guidSucUsuario);
    if (sucUsuario) {
      sel.value = sucUsuario.GUID;
      State.sucursalActual = sucUsuario.GUID;
    } else if (sucursales.length > 0) {
      State.sucursalActual = sucursales[0].GUID;
    }
    sel.addEventListener('change', () => { State.sucursalActual = sel.value; });

    document.getElementById('navUsuarioNombre').textContent = (State.usuario.NOMBRE || '').trim();

    App.Navigate('pos');
  } catch (err) {
    ShowToast('Error', 'No se pudo conectar con el servidor: ' + err.message, 'error');
  }
}

// ── App / Navegación ───────────────────────────────────────────────────────────
const App = {
  async Login() {
    const id = document.getElementById('loginUsuario').value.trim();
    const clave = document.getElementById('loginClave').value;
    const errorDiv = document.getElementById('loginError');
    const btn = document.getElementById('btnLogin');

    if (!id) {
      errorDiv.textContent = 'Ingrese el ID de usuario';
      errorDiv.classList.remove('d-none');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';
    errorDiv.classList.add('d-none');

    try {
      const usuario = await API.Login(id, clave);
      State.usuario = usuario;

      // Ocultar login, mostrar app
      document.getElementById('loginScreen').classList.add('d-none');
      document.getElementById('appContainer').classList.remove('d-none');

      // InitApp se maneja con su propio try/catch (ShowToast)
      await InitApp();
    } catch (err) {
      // Solo errores de autenticacion llegan aqui
      errorDiv.textContent = err.message || 'Usuario o clave incorrectos';
      errorDiv.classList.remove('d-none');
      // Revertir si falló
      document.getElementById('appContainer').classList.add('d-none');
      document.getElementById('loginScreen').classList.remove('d-none');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Ingresar';
    }
  },

  Logout() {
    State.usuario = null;
    State.sucursales = [];
    State.vendedores = [];
    State.tcPagos = [];
    State.bancosCuentas = [];
    State.sucursalActual = null;
    State.currentSection = 'pos';

    document.getElementById('appContainer').classList.add('d-none');
    document.getElementById('loginScreen').classList.remove('d-none');
    document.getElementById('loginUsuario').value = '';
    document.getElementById('loginClave').value = '';
    document.getElementById('loginError').classList.add('d-none');
    document.getElementById('loginUsuario').focus();
  },

  Navigate(section) {
    State.currentSection = section;
    document.querySelectorAll('.sidebar .nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.section === section);
    });
    const main = document.getElementById('mainContent');
    switch (section) {
      case 'pos': RenderPOS(main); break;
      case 'ventas': RenderVentas(main); break;
      case 'devoluciones': RenderDevoluciones(main); break;
      case 'cambios': RenderCambios(main); break;
      case 'transferencias': RenderTransferencias(main); break;
      case 'compras': RenderCompras(main); break;
      case 'gastos': RenderGastos(main); break;
      case 'bancos': RenderBancos(main); break;
    }
  },
};

// ============================================================================
// SECCIÓN: POS — Nueva Venta
// ============================================================================
const POS = {
  items: [],
  pagos: [],
  cliente: null,
  vendedor: null,

  Reset() {
    POS.items = [];
    POS.pagos = [];
    POS.cliente = null;
    POS.vendedor = null;
    POS.emitirFactura = false;
  },

  GetTotal() {
    return POS.items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);
  },

  GetTotalPagos() {
    return POS.pagos.reduce((sum, p) => sum + p.importe, 0);
  },

  async BuscarArticulo(texto) {
    if (!texto) return;
    try {
      // 1. Intentar match exacto por CODIGOARTICULOREL
      let art = null;
      try { art = await API.GetArticuloByCodigo(texto); } catch (_) {}

      if (art) {
        const movs = await API.GetMovimientoArticulos(art.GUID);
        if (movs.length === 0) {
          POS.AgregarItem(art, null);
        } else {
          RenderTallesSelector(art, movs);
        }
        return;
      }

      // 2. Si no hay match exacto, buscar por descripción/código parcial
      const resultados = await API.GetArticulos(texto);
      if (resultados.length === 0) {
        ShowToast('Aviso', 'No se encontraron artículos', 'info');
        return;
      }
      if (resultados.length === 1) {
        const unico = resultados[0];
        const movs = await API.GetMovimientoArticulos(unico.GUID);
        if (movs.length === 0) {
          POS.AgregarItem(unico, null);
        } else {
          RenderTallesSelector(unico, movs);
        }
        return;
      }
      // Múltiples resultados: mostrar lista
      RenderArticulosSugeridos(resultados);
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    }
  },

  AgregarItem(art, mov) {
    const existing = POS.items.find(i =>
      i.guidArticulo === art.GUID &&
      i.guidMovimientoArticulo === (mov ? mov.GUID : '')
    );
    if (existing) {
      existing.cantidad++;
    } else {
      POS.items.push({
        guidArticulo: art.GUID,
        guidMovimientoArticulo: mov ? mov.GUID : '',
        codigoArticulo: (art.CODIGOARTICULOREL || art.CODIGOARTICULO || '').trim(),
        descripcion: (art.DESCRIPCION || '').trim(),
        talle: mov ? mov.NUMERO : 0,
        color: mov ? (mov.COLOR || '').trim() : (art.COLOR || '').trim(),
        cantidad: 1,
        precioUnitario: art.PRECIOVENTA || 0,
        precioCosto: art.PRECIOCOSTO || 0,
      });
    }
    RenderPOSItems();
    document.getElementById('posSearch').value = '';
    document.getElementById('posSearch').focus();
  },

  QuitarItem(idx) {
    POS.items.splice(idx, 1);
    RenderPOSItems();
  },

  CambiarCantidad(idx, delta) {
    POS.items[idx].cantidad += delta;
    if (POS.items[idx].cantidad <= 0) POS.items.splice(idx, 1);
    RenderPOSItems();
  },

  AbrirPagos() {
    if (POS.items.length === 0) {
      ShowToast('Aviso', 'Agregue artículos primero', 'info');
      return;
    }
    if (!POS.vendedor) {
      const sel = document.getElementById('posVendedor');
      sel.focus();
      sel.size = sel.options.length > 8 ? 8 : sel.options.length;
      sel.classList.add('is-invalid');
      const handler = () => {
        sel.size = 1;
        sel.classList.remove('is-invalid');
        sel.removeEventListener('change', handler);
        sel.removeEventListener('blur', handler);
      };
      sel.addEventListener('change', handler);
      sel.addEventListener('blur', handler);
      ShowToast('Aviso', 'Seleccione un vendedor antes de cobrar', 'error');
      return;
    }
    POS.pagos = [];
    RenderPagosModal();
    new bootstrap.Modal(document.getElementById('modalPagos')).show();
  },

  emitirFactura: false,

  RequiereCliente() {
    return POS.pagos.some(p => p.tipo !== 'EFECTIVO');
  },

  RequiereFactura() {
    return POS.pagos.some(p => p.tipo !== 'EFECTIVO' && p.tipo !== 'CTA_CTE');
  },

  SoloEfectivoOCtaCte() {
    return POS.pagos.length > 0 && POS.pagos.every(p => p.tipo === 'EFECTIVO' || p.tipo === 'CTA_CTE');
  },

  OnTipoPagoChange() {
    RenderPagosModal();
  },

  AgregarPago() {
    const tipo = document.getElementById('pagoTipo').value;
    const importe = parseFloat(document.getElementById('pagoImporte').value) || 0;
    if (importe <= 0) { ShowToast('Aviso', 'Ingrese un importe válido', 'info'); return; }

    const restante = GetTotalACobrar() - POS.GetTotalPagos();
    if (importe > restante + 0.01) {
      ShowToast('Aviso', 'El importe excede el restante', 'info');
      return;
    }

    if (tipo === 'CTA_CTE' && !POS.cliente) {
      ShowToast('Aviso', 'Seleccione un cliente para Cuenta Corriente', 'info');
      return;
    }

    const pago = { tipo, importe, descripcion: tipo, guidBanco: '', guidBancosCuentas: '' };

    // Auto-asignar cuenta caja para EFECTIVO
    if (tipo === 'EFECTIVO') {
      const cuentaCaja = GetCuentaCajaSucursal();
      if (cuentaCaja) {
        pago.guidBancosCuentas = cuentaCaja.GUID.trim();
        pago.guidBanco = (cuentaCaja.GUIDBANCOS || '').trim();
      }
    }

    if (tipo === 'TARJETA') {
      const selTarjeta = document.getElementById('pagoTarjeta');
      const selPlan = document.getElementById('pagoPlan');
      if (selTarjeta.value) {
        pago.descripcion = selTarjeta.options[selTarjeta.selectedIndex].text;
        pago.guidBanco = '';
        if (selPlan.value) {
          const planData = JSON.parse(selPlan.value);
          pago.cuotas = planData.cuotas;
          pago.interes = planData.interes;
          pago.descripcion += ` ${planData.cuotas} cuotas`;
        }
      }
    }

    POS.pagos.push(pago);
    document.getElementById('pagoImporte').value = '';

    // Si el pago requiere factura, activarla automáticamente
    if (tipo !== 'EFECTIVO' && tipo !== 'CTA_CTE') {
      POS.emitirFactura = true;
    }

    RenderPagosModal();
  },

  QuitarPago(idx) {
    POS.pagos.splice(idx, 1);
    // Recalcular si aún se requiere factura obligatoria
    if (!POS.RequiereFactura()) {
      POS.emitirFactura = false;
    }
    RenderPagosModal();
  },

  ToggleFactura() {
    if (POS.RequiereFactura()) return; // no se puede desactivar si es obligatoria
    POS.emitirFactura = !POS.emitirFactura;
    if (POS.emitirFactura && !POS.cliente) {
      // Si activa factura con efectivo, preguntar consumidor final o cliente
      POS.MostrarOpcionesFacturaEfectivo();
      return;
    }
    RenderPagosModal();
  },

  MostrarOpcionesFacturaEfectivo() {
    const zona = document.getElementById('pagoFacturaZona');
    zona.innerHTML = `
      <div class="card border-primary">
        <div class="card-body">
          <h6 class="card-title"><i class="bi bi-receipt me-2"></i>Emitir factura a:</h6>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" onclick="POS.FacturaConsumidorFinal()">
              <i class="bi bi-person me-1"></i>Consumidor Final
            </button>
            <button class="btn btn-primary" onclick="AbrirModalClientePago()">
              <i class="bi bi-person-lines-fill me-1"></i>Seleccionar Cliente
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async FacturaConsumidorFinal() {
    try {
      const clientes = await API.GetClientes('CONSUMIDOR FINAL');
      const cf = clientes.find(c => (c.DOCUMENTO || '').trim() === '0');
      if (cf) {
        POS.cliente = cf;
      }
    } catch (_) {}
    POS.emitirFactura = true;
    RenderPagosModal();
  },

  async ConfirmarVenta() {
    // Si estamos en modo cambio con diferencia, redirigir a ConfirmarCambioConVenta
    if (POS._cambioData && POS._cambioData.diferencia > 0) {
      const totalACobrar = POS._cambioData.diferencia;
      const totalPagos = POS.GetTotalPagos();
      if (Math.abs(totalACobrar - totalPagos) > 0.01) {
        ShowToast('Aviso', 'El total de pagos no coincide con la diferencia a cobrar', 'info');
        return;
      }
      const btn = document.getElementById('btnConfirmarVenta');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Procesando cambio...';
      try {
        bootstrap.Modal.getInstance(document.getElementById('modalPagos')).hide();
        await ConfirmarCambioConVenta();
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar Venta';
      }
      return;
    }

    const total = POS.GetTotal();
    const totalPagos = POS.GetTotalPagos();
    if (Math.abs(total - totalPagos) > 0.01) {
      ShowToast('Aviso', 'El total de pagos no coincide con el total de la venta', 'info');
      return;
    }
    if (!State.sucursalActual) {
      ShowToast('Aviso', 'Seleccione una sucursal', 'info');
      return;
    }

    // Validar: si hay pagos que requieren cliente, verificar que haya cliente
    if (POS.RequiereCliente() && !POS.cliente) {
      ShowToast('Aviso', 'Debe seleccionar un cliente para este tipo de pago', 'error');
      return;
    }

    // Validar crédito si hay pago CTA_CTE
    const pagoCtaCte = POS.pagos.find(p => p.tipo === 'CTA_CTE');
    if (pagoCtaCte && POS.cliente) {
      try {
        const validacion = await API.ValidarCreditoCtaCte(POS.cliente.GUID, pagoCtaCte.importe);
        if (!validacion.ok) {
          ShowToast('Crédito excedido', validacion.mensaje, 'error');
          return;
        }
      } catch (err) {
        ShowToast('Error', 'No se pudo validar el crédito: ' + err.message, 'error');
        return;
      }
    }

    const btn = document.getElementById('btnConfirmarVenta');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Procesando...';

    try {
      const data = {
        guidCliente: POS.cliente ? POS.cliente.GUID : null,
        guidSucursal: State.sucursalActual,
        guidVendedor: POS.vendedor || null,
        nombre: POS.cliente ? (POS.cliente.NOMBRE || '').trim() : 'CONSUMIDOR FINAL',
        cuit: POS.cliente ? (POS.cliente.CUIT || '').trim() : '',
        tipoOperacion: 'VENTA',
        items: POS.items,
        pagos: POS.pagos,
        emitirFactura: POS.emitirFactura,
      };
      const result = await API.CreateVenta(data);
      bootstrap.Modal.getInstance(document.getElementById('modalPagos')).hide();

      let msg = `Total: ${FormatMoney(result.total)}`;
      if (result.factura) msg += ` | Factura: ${result.factura}`;

      ShowToast('Venta exitosa', msg, 'success');
      POS.Reset();
      RenderPOS(document.getElementById('mainContent'));
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar Venta';
    }
  },

  SeleccionarCliente(cliente) {
    POS.cliente = cliente;
    bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
    const el = document.getElementById('posClienteInfo');
    if (el) {
      el.innerHTML = `
        <span class="badge bg-primary badge-lg me-2"><i class="bi bi-person-fill me-1"></i>${(cliente.NOMBRE || '').trim()}</span>
        <small class="text-muted">CUIT: ${(cliente.CUIT || '').trim()} | Saldo: ${FormatMoney(cliente.SALDO)}</small>
        <button class="btn btn-sm btn-outline-danger ms-2" onclick="POS.cliente = null; document.getElementById('posClienteInfo').innerHTML = '<em class=\\'text-muted\\'>Consumidor Final</em>';">
          <i class="bi bi-x"></i>
        </button>
      `;
    }
  },
};

// ── Render POS ─────────────────────────────────────────────────────────────────
function RenderPOS(container) {
  POS.Reset();
  container.innerHTML = `
    <div class="fade-in">
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="input-group">
            <span class="input-group-text bg-primary text-white"><i class="bi bi-upc-scan"></i></span>
            <input type="text" id="posSearch" class="form-control pos-search"
              placeholder="Escanear código o buscar artículo..." autofocus>
            <button class="btn btn-outline-primary" onclick="POS.BuscarArticulo(document.getElementById('posSearch').value)">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div class="col-md-4 d-flex gap-2">
          <select id="posVendedor" class="form-select" onchange="POS.vendedor = this.value || null">
            <option value="">Vendedor...</option>
          </select>
          <button class="btn btn-outline-secondary" onclick="AbrirModalCliente()">
            <i class="bi bi-person-plus"></i>
          </button>
        </div>
      </div>

      <div id="posClienteInfo" class="mb-2"><em class="text-muted">Consumidor Final</em></div>

      <div id="tallesContainer" class="mb-3"></div>

      <div class="card shadow-sm mb-3">
        <div class="table-responsive">
          <table class="table table-hover mb-0 no-sort-table">
            <thead class="table-light">
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Talle</th>
                <th>Color</th>
                <th class="text-center">Cant.</th>
                <th class="text-end">Precio</th>
                <th class="text-end">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="posItemsBody">
              <tr><td colspan="8" class="text-center text-muted py-4">
                <i class="bi bi-cart3 fs-1 d-block mb-2 opacity-50"></i>Escanee o busque un artículo para comenzar
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row g-3 align-items-center">
        <div class="col-md-4">
          <span class="text-muted" id="posItemCount">0 artículos</span>
        </div>
        <div class="col-md-4 text-center">
          <div class="pos-total-bar" id="posTotalBar">TOTAL: ${FormatMoney(0)}</div>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-success btn-lg" id="btnCobrar" onclick="POS.AbrirPagos()" disabled>
            <i class="bi bi-cash-stack me-2"></i>Cobrar
          </button>
        </div>
      </div>
    </div>
  `;

  // Vendedores dropdown
  const selVend = document.getElementById('posVendedor');
  State.vendedores.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.GUID;
    opt.textContent = (v.NOMBRE || '').trim();
    selVend.appendChild(opt);
  });

  // Search on Enter
  document.getElementById('posSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      POS.BuscarArticulo(e.target.value.trim());
    }
  });

  // Live search articles (debounced)
  const searchInput = document.getElementById('posSearch');
  searchInput.addEventListener('input', Debounce(async (e) => {
    const val = e.target.value.trim();
    if (val.length < 2) { document.getElementById('tallesContainer').innerHTML = ''; return; }
    try {
      const arts = await API.GetArticulos(val);
      if (arts.length === 0) return;
      if (arts.length === 1) {
        // Auto-load first result
        return;
      }
      RenderArticulosSugeridos(arts);
    } catch (_) {}
  }, 400));
}

function RenderArticulosSugeridos(arts) {
  const container = document.getElementById('tallesContainer');
  const limitedArts = arts.slice(0, 20);
  // Guardar artículos en variable temporal para acceder desde onclick
  window._artsSugeridos = limitedArts;
  container.innerHTML = `
    <div class="card shadow-sm">
      <div class="list-group list-group-flush" style="max-height:300px; overflow-y:auto;">
        ${limitedArts.map((a, i) => `
          <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
             onclick="event.preventDefault(); SeleccionarArticuloSugerido(${i});">
            <div>
              <code class="me-2">${(a.CODIGOARTICULOREL || a.CODIGOARTICULO || '').trim()}</code>
              <span>${(a.DESCRIPCION || '').trim()}</span>
            </div>
            <span class="badge bg-success">${FormatMoney(a.PRECIOVENTA)}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

async function SeleccionarArticuloSugerido(idx) {
  const art = window._artsSugeridos[idx];
  if (!art) return;
  document.getElementById('tallesContainer').innerHTML = '';
  document.getElementById('posSearch').value = '';
  try {
    const movs = await API.GetMovimientoArticulos(art.GUID);
    if (movs.length === 0) {
      POS.AgregarItem(art, null);
    } else {
      RenderTallesSelector(art, movs);
    }
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

function RenderTallesSelector(art, movs) {
  const container = document.getElementById('tallesContainer');
  container.innerHTML = `
    <div class="card shadow-sm p-3">
      <h6 class="mb-2"><i class="bi bi-rulers me-1"></i>${(art.DESCRIPCION || '').trim()} — Seleccione talle:</h6>
      <div class="d-flex flex-wrap gap-1">
        ${movs.map(m => `
          <button class="btn btn-outline-primary talle-btn" onclick="POS.AgregarItem(${JSON.stringify(art).replace(/"/g, '&quot;')}, ${JSON.stringify(m).replace(/"/g, '&quot;')}); document.getElementById('tallesContainer').innerHTML='';">
            ${m.NUMERO}${m.COLOR ? `<br><small>${(m.COLOR || '').trim()}</small>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function RenderPOSItems() {
  const body = document.getElementById('posItemsBody');
  if (POS.items.length === 0) {
    body.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">
      <i class="bi bi-cart3 fs-1 d-block mb-2 opacity-50"></i>Sin artículos
    </td></tr>`;
  } else {
    body.innerHTML = POS.items.map((item, i) => `
      <tr class="pos-item-row">
        <td><code>${item.codigoArticulo}</code></td>
        <td>${item.descripcion}</td>
        <td>${item.talle || '-'}</td>
        <td>${item.color || '-'}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" onclick="POS.CambiarCantidad(${i}, -1)"><i class="bi bi-dash"></i></button>
            <span class="btn btn-outline-secondary disabled">${item.cantidad}</span>
            <button class="btn btn-outline-secondary" onclick="POS.CambiarCantidad(${i}, 1)"><i class="bi bi-plus"></i></button>
          </div>
        </td>
        <td class="text-end">${FormatMoney(item.precioUnitario)}</td>
        <td class="text-end fw-bold">${FormatMoney(item.cantidad * item.precioUnitario)}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="POS.QuitarItem(${i})"><i class="bi bi-trash"></i></button></td>
      </tr>
    `).join('');
  }

  const total = POS.GetTotal();
  const cantTotal = POS.items.reduce((s, i) => s + i.cantidad, 0);
  document.getElementById('posTotalBar').textContent = `TOTAL: ${FormatMoney(total)}`;
  document.getElementById('posItemCount').textContent = `${cantTotal} artículo${cantTotal !== 1 ? 's' : ''}`;
  const btnCobrar = document.getElementById('btnCobrar');
  if (btnCobrar) {
    btnCobrar.disabled = POS.items.length === 0;
    if (POS._cambioData) {
      btnCobrar.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Confirmar Cambio';
      btnCobrar.className = 'btn btn-warning btn-lg';
    } else {
      btnCobrar.innerHTML = '<i class="bi bi-cash-stack me-2"></i>Cobrar';
      btnCobrar.className = 'btn btn-success btn-lg';
    }
  }
}

function GetTotalACobrar() {
  if (POS._cambioData && POS._cambioData.diferencia > 0) return POS._cambioData.diferencia;
  return POS.GetTotal();
}

function RenderPagosModal() {
  const total = GetTotalACobrar();
  const totalPagos = POS.GetTotalPagos();
  const restante = total - totalPagos;
  const tipoActual = document.getElementById('pagoTipo').value;
  const reqCliente = POS.RequiereCliente();
  const reqFactura = POS.RequiereFactura();
  const soloEfectivo = POS.SoloEfectivoOCtaCte();
  const esNoEfectivo = tipoActual !== 'EFECTIVO';
  const esCtaCte = tipoActual === 'CTA_CTE';

  // Indicar si es cobro de diferencia por cambio
  const lblTotal = document.getElementById('pagoTotalVenta');
  lblTotal.textContent = FormatMoney(total);
  const cambioInfoEl = document.getElementById('cambioInfoPagos');
  if (POS._cambioData && POS._cambioData.diferencia > 0) {
    if (!cambioInfoEl) {
      const info = document.createElement('div');
      info.id = 'cambioInfoPagos';
      info.className = 'alert alert-warning py-1 px-2 mb-2 small';
      info.innerHTML = `<i class="bi bi-arrow-repeat me-1"></i>Cobro de diferencia: Venta <strong>${FormatMoney(POS.GetTotal())}</strong> - Cambio <strong>${FormatMoney(POS._cambioData.totalCambio)}</strong> = <strong>${FormatMoney(POS._cambioData.diferencia)}</strong>`;
      lblTotal.parentElement.insertBefore(info, lblTotal.parentElement.firstChild);
    }
  } else if (cambioInfoEl) {
    cambioInfoEl.remove();
  }
  document.getElementById('pagoRestante').textContent = FormatMoney(restante);
  document.getElementById('pagoRestante').className = restante > 0.01 ? 'text-danger fw-bold fs-4' : 'text-success fw-bold fs-4';
  document.getElementById('pagoImporte').value = restante > 0 ? restante.toFixed(2) : '';

  // ── Tarjeta fields ──
  const isTarjeta = tipoActual === 'TARJETA';
  document.getElementById('divTarjetaOpciones').classList.toggle('d-none', !isTarjeta);
  document.getElementById('divCuotas').classList.toggle('d-none', !isTarjeta);

  const selTarjeta = document.getElementById('pagoTarjeta');
  selTarjeta.innerHTML = '<option value="">Seleccione...</option>';
  State.tcPagos.forEach(tc => {
    const opt = document.createElement('option');
    opt.value = tc.GUID;
    opt.textContent = (tc.TIPO_COMPROBANTE || '').trim();
    selTarjeta.appendChild(opt);
  });
  selTarjeta.onchange = async () => {
    const selPlan = document.getElementById('pagoPlan');
    selPlan.innerHTML = '<option value="">Sin plan</option>';
    if (selTarjeta.value) {
      try {
        const planes = await API.GetTCPagosPlanes(selTarjeta.value);
        planes.forEach(p => {
          const opt = document.createElement('option');
          opt.value = JSON.stringify({ cuotas: p.CUOTAS, interes: p.INTERES, coeficiente: p.COEFICIENTE });
          opt.textContent = `${(p.NOMBRECOMPROBANTEPAGO || '').trim()} - ${p.CUOTAS} cuotas (${p.INTERES}%)`;
          selPlan.appendChild(opt);
        });
      } catch (_) {}
    }
  };

  // ── PASO 2: Cliente (condicional según tipo de pago seleccionado) ──
  const zonaCliente = document.getElementById('pagoClienteZona');
  if (esNoEfectivo) {
    // No es efectivo → obligar cliente
    if (POS.cliente) {
      const saldo = POS.cliente.SALDO || 0;
      const limite = POS.cliente.LIMITE_CREDITO || 0;
      const limiteTexto = limite < 0 ? 'Sin límite' : FormatMoney(limite);

      let clienteHTML = `
        <div class="card border-primary mb-0">
          <div class="card-body py-2">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-person-fill text-primary me-1"></i>
                <strong>${(POS.cliente.NOMBRE || '').trim()}</strong>
                <small class="text-muted ms-2">CUIT: ${(POS.cliente.CUIT || '').trim()}</small>
              </div>
              <button class="btn btn-sm btn-outline-danger" onclick="POS.cliente = null; RenderPagosModal();">
                <i class="bi bi-x me-1"></i>Cambiar
              </button>
            </div>
      `;

      if (esCtaCte) {
        const totalVentaCtaCte = restante > 0 ? restante : total;
        const nuevoSaldo = saldo + totalVentaCtaCte;
        const excede = limite > 0 && nuevoSaldo > limite;

        clienteHTML += `
            <div class="row mt-2 g-2">
              <div class="col-md-4">
                <small class="text-muted d-block">Saldo Cta. Cte.</small>
                <span class="fw-bold ${saldo > 0 ? 'text-danger' : 'text-success'}">${FormatMoney(saldo)}</span>
              </div>
              <div class="col-md-4">
                <small class="text-muted d-block">Esta venta</small>
                <span class="fw-bold">${FormatMoney(totalVentaCtaCte)}</span>
              </div>
              <div class="col-md-4">
                <small class="text-muted d-block">Límite Crédito</small>
                <span class="fw-bold">${limiteTexto}</span>
              </div>
            </div>
        `;

        if (excede) {
          clienteHTML += `
          </div>
        </div>
        <div class="alert alert-danger border-danger mt-2 mb-0 py-3" style="border-width:2px !important;">
          <div class="d-flex align-items-start">
            <i class="bi bi-exclamation-octagon-fill fs-3 me-3 text-danger"></i>
            <div>
              <h5 class="alert-heading mb-1 text-danger fw-bold" style="font-size:1.15rem;">CRÉDITO EXCEDIDO</h5>
              <p class="mb-1" style="font-size:1.05rem;">
                El nuevo saldo sería <strong class="text-danger" style="font-size:1.2rem;">${FormatMoney(nuevoSaldo)}</strong>
                y supera el límite de <strong>${FormatMoney(limite)}</strong>.
              </p>
              <p class="mb-0 fw-semibold" style="font-size:1.05rem;">
                <i class="bi bi-shield-lock me-1"></i>Debe solicitar la ampliación del límite de crédito con el responsable correspondiente para continuar con esta venta en cuenta corriente.
              </p>
            </div>
          </div>
        </div>
          `;
        } else {
          clienteHTML += `</div></div>`;
        }
      } else {
        clienteHTML += `</div></div>`;
      }

      zonaCliente.innerHTML = clienteHTML;
    } else {
      // Sin cliente seleccionado → mostrar botón obligatorio
      zonaCliente.innerHTML = `
        <div class="alert alert-warning py-3 mb-0 d-flex align-items-center justify-content-between">
          <div>
            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <strong>Debe seleccionar un cliente</strong>
            <span class="ms-1">${esCtaCte ? 'para Cuenta Corriente' : tipoActual === 'TARJETA' ? 'para pago con Tarjeta' : 'para pago con Transferencia'}</span>
          </div>
          <button class="btn btn-primary" onclick="AbrirModalClientePago()">
            <i class="bi bi-person-plus me-1"></i>Seleccionar Cliente
          </button>
        </div>
      `;
    }
  } else {
    // Efectivo → cliente opcional
    if (POS.cliente) {
      zonaCliente.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-0">
          <span class="fw-semibold">Cliente:</span>
          <span class="badge bg-primary badge-lg"><i class="bi bi-person-fill me-1"></i>${(POS.cliente.NOMBRE || '').trim()}</span>
          <small class="text-muted">CUIT: ${(POS.cliente.CUIT || '').trim()}</small>
          <button class="btn btn-sm btn-outline-danger" onclick="POS.cliente = null; RenderPagosModal();">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;
    } else {
      zonaCliente.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-0">
          <span class="fw-semibold">Cliente:</span>
          <em class="text-muted">Consumidor Final</em>
          <button class="btn btn-sm btn-outline-primary" onclick="AbrirModalClientePago()">
            <i class="bi bi-person-plus me-1"></i>Seleccionar
          </button>
        </div>
      `;
    }
  }

  // ── Deshabilitar agregar pago si requiere cliente y no tiene ──
  const bloqueaAgregar = esNoEfectivo && !POS.cliente;
  document.getElementById('btnAgregarPago').disabled = bloqueaAgregar;

  // Si es CTA_CTE con crédito excedido, también bloquear
  const alertaCredito = document.getElementById('pagoCreditoAlerta');
  alertaCredito.className = 'd-none mb-3';
  alertaCredito.innerHTML = '';
  let creditoExcedido = false;
  if (esCtaCte && POS.cliente) {
    const limite = POS.cliente.LIMITE_CREDITO || 0;
    const saldo = POS.cliente.SALDO || 0;
    const totalVentaCtaCte = restante > 0 ? restante : total;
    const nuevoSaldo = saldo + totalVentaCtaCte;
    if (limite > 0 && nuevoSaldo > limite) {
      creditoExcedido = true;
      document.getElementById('btnAgregarPago').disabled = true;
    }
  }

  // ── Pagos table ──
  const tbody = document.getElementById('tablaPagos');
  if (POS.pagos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin pagos registrados</td></tr>';
  } else {
    tbody.innerHTML = POS.pagos.map((p, i) => `
      <tr>
        <td><span class="badge bg-${p.tipo === 'EFECTIVO' ? 'success' : p.tipo === 'TARJETA' ? 'primary' : p.tipo === 'TRANSFERENCIA' ? 'info' : 'warning'}">${p.tipo}</span></td>
        <td>${p.descripcion}${p.cuotas > 1 ? ` (${p.cuotas} cuotas)` : ''}</td>
        <td class="text-end fw-bold">${FormatMoney(p.importe)}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="POS.QuitarPago(${i})"><i class="bi bi-trash"></i></button></td>
      </tr>
    `).join('');
  }

  // ── Zona de Factura ──
  const zonaFactura = document.getElementById('pagoFacturaZona');
  if (reqFactura) {
    POS.emitirFactura = true;
    zonaFactura.innerHTML = `
      <div class="alert alert-info py-2 d-flex align-items-center mb-0">
        <i class="bi bi-receipt-cutoff me-2 fs-5"></i>
        <div>
          <strong>Factura obligatoria</strong> — Se generará automáticamente.
          ${POS.cliente ? `<br><small>A nombre de: <strong>${(POS.cliente.NOMBRE || '').trim()}</strong></small>` : ''}
        </div>
      </div>
    `;
  } else if (POS.pagos.length > 0 && soloEfectivo) {
    if (POS.emitirFactura) {
      zonaFactura.innerHTML = `
        <div class="alert alert-success py-2 d-flex align-items-center justify-content-between mb-0">
          <div>
            <i class="bi bi-receipt-cutoff me-2 fs-5"></i><strong>Factura activada</strong>
            ${POS.cliente ? ` — ${(POS.cliente.NOMBRE || '').trim()}` : ' — Consumidor Final'}
          </div>
          <button class="btn btn-sm btn-outline-danger" onclick="POS.emitirFactura = false; RenderPagosModal();">
            <i class="bi bi-x me-1"></i>Cancelar
          </button>
        </div>
      `;
    } else {
      zonaFactura.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary" onclick="POS.ToggleFactura()">
            <i class="bi bi-receipt me-1"></i>Generar Factura
          </button>
          <small class="text-muted">Opcional para pagos en efectivo</small>
        </div>
      `;
    }
  } else {
    zonaFactura.innerHTML = '';
  }

  // ── Enable/disable confirmar ──
  const bloqueado = Math.abs(restante) > 0.01 || (reqCliente && !POS.cliente);
  document.getElementById('btnConfirmarVenta').disabled = bloqueado;
}

function AbrirModalClientePago() {
  const tipoActual = document.getElementById('pagoTipo')?.value || '';
  const esCtaCte = tipoActual === 'CTA_CTE' || POS.pagos.some(p => p.tipo === 'CTA_CTE');

  const modalPagosEl = document.getElementById('modalPagos');
  const modalPagosInst = bootstrap.Modal.getInstance(modalPagosEl);
  if (modalPagosInst) modalPagosInst.hide();

  document.getElementById('searchCliente').value = '';
  document.getElementById('listaClientes').innerHTML = esCtaCte
    ? '<div class="alert alert-warning py-2 mb-2"><i class="bi bi-info-circle me-1"></i>Solo clientes con cuenta corriente habilitada (límite de crédito asignado)</div>'
    : '';

  const modalCliente = new bootstrap.Modal(document.getElementById('modalCliente'));
  modalCliente.show();
  window._clienteCallbackPago = true;

  const input = document.getElementById('searchCliente');
  input.oninput = Debounce(async () => {
    const val = input.value.trim();
    if (val.length < 2) { document.getElementById('listaClientes').innerHTML = ''; return; }
    try {
      const clientes = esCtaCte ? await API.GetClientesCtaCte(val) : await API.GetClientes(val);

      if (clientes.length === 0) {
        document.getElementById('listaClientes').innerHTML = esCtaCte
          ? '<div class="alert alert-warning py-2"><i class="bi bi-info-circle me-1"></i>No se encontraron clientes con cuenta corriente habilitada</div>'
          : '<div class="alert alert-info py-2">No se encontraron clientes</div>';
        return;
      }

      const totalVenta = POS.GetTotal();

      document.getElementById('listaClientes').innerHTML = clientes.slice(0, 20).map(c => {
        const saldo = c.SALDO || 0;
        const limite = c.LIMITE_CREDITO || 0;
        const limiteTexto = limite < 0 ? 'Sin límite' : FormatMoney(limite);
        const nuevoSaldo = saldo + totalVenta;
        const excede = esCtaCte && limite > 0 && nuevoSaldo > limite;

        return `
          <a href="#" class="list-group-item list-group-item-action ${excede ? 'list-group-item-danger' : ''}"
             onclick="event.preventDefault(); SeleccionarClienteDesdeModal(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            <div class="d-flex justify-content-between align-items-center">
              <strong>${(c.NOMBRE || '').trim()}</strong>
              ${excede ? '<span class="badge bg-danger">EXCEDE LÍMITE</span>' : ''}
            </div>
            <small class="text-muted">CUIT: ${(c.CUIT || '').trim()} | Tel: ${(c.TELEFONO || '').trim()}</small>
            ${esCtaCte ? `
              <div class="d-flex gap-3 mt-1">
                <small><strong>Saldo:</strong> <span class="${saldo > 0 ? 'text-danger fw-bold' : 'text-success'}">${FormatMoney(saldo)}</span></small>
                <small><strong>+ Comprobante:</strong> ${FormatMoney(totalVenta)}</small>
                <small><strong>Límite:</strong> ${limiteTexto}</small>
                ${excede ? `<small class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i>Nuevo saldo: ${FormatMoney(nuevoSaldo)}</small>` : ''}
              </div>
            ` : ''}
          </a>
        `;
      }).join('');
    } catch (_) {}
  }, 300);
  setTimeout(() => input.focus(), 300);
}

function SeleccionarClienteDesdeModal(cliente) {
  POS.cliente = cliente;
  bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();

  // Actualizar info en POS principal
  const elPOS = document.getElementById('posClienteInfo');
  if (elPOS) {
    elPOS.innerHTML = `
      <span class="badge bg-primary badge-lg me-2"><i class="bi bi-person-fill me-1"></i>${(cliente.NOMBRE || '').trim()}</span>
      <small class="text-muted">CUIT: ${(cliente.CUIT || '').trim()} | Saldo: ${FormatMoney(cliente.SALDO)}</small>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="POS.cliente = null; document.getElementById('posClienteInfo').innerHTML = '<em class=\\'text-muted\\'>Consumidor Final</em>';">
        <i class="bi bi-x"></i>
      </button>
    `;
  }

  if (window._clienteCallbackPago) {
    window._clienteCallbackPago = false;
    if (POS.pagos.length > 0 && POS.SoloEfectivoOCtaCte()) {
      POS.emitirFactura = true;
    }
    setTimeout(() => {
      RenderPagosModal();
      new bootstrap.Modal(document.getElementById('modalPagos')).show();
    }, 300);
  }
}

// ── Modal Cliente ──────────────────────────────────────────────────────────────
function AbrirModalCliente() {
  document.getElementById('searchCliente').value = '';
  document.getElementById('listaClientes').innerHTML = '';
  new bootstrap.Modal(document.getElementById('modalCliente')).show();

  const input = document.getElementById('searchCliente');
  input.oninput = Debounce(async () => {
    const val = input.value.trim();
    if (val.length < 2) { document.getElementById('listaClientes').innerHTML = ''; return; }
    try {
      const clientes = await API.GetClientes(val);
      document.getElementById('listaClientes').innerHTML = clientes.slice(0, 20).map(c => `
        <a href="#" class="list-group-item list-group-item-action" onclick="event.preventDefault(); POS.SeleccionarCliente(${JSON.stringify(c).replace(/"/g, '&quot;')})">
          <div class="d-flex justify-content-between">
            <strong>${(c.NOMBRE || '').trim()}</strong>
            <span class="badge bg-${(c.SALDO || 0) > 0 ? 'danger' : 'success'}">${FormatMoney(c.SALDO)}</span>
          </div>
          <small class="text-muted">CUIT: ${(c.CUIT || '').trim()} | Tel: ${(c.TELEFONO || '').trim()}</small>
        </a>
      `).join('');
    } catch (_) {}
  }, 300);
  setTimeout(() => input.focus(), 300);
}

// ============================================================================
// SECCIÓN: Ventas (Historial)
// ============================================================================
function RenderVentas(container) {
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-receipt me-2"></i>Historial de Ventas</h4>
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label fw-semibold">Desde</label>
              <input type="date" id="ventasDesde" class="form-control" value="${TodayISO()}">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Hasta</label>
              <input type="date" id="ventasHasta" class="form-control" value="${TodayISO()}">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Sucursal</label>
              <select id="ventasSucursal" class="form-select">
                <option value="">Todas</option>
                ${State.sucursales.map(s => `<option value="${s.GUID}" ${s.GUID === State.sucursalActual ? 'selected' : ''}>${(s.NOMBRE || '').trim()}</option>`).join('')}
              </select>
            </div>
            <div class="col-md-3">
              <button class="btn btn-primary w-100" onclick="BuscarVentas()"><i class="bi bi-search me-1"></i>Buscar</button>
            </div>
          </div>
        </div>
      </div>
      <div id="ventasResultados"></div>
    </div>
  `;
  BuscarVentas();
}

async function BuscarVentas() {
  const desde = document.getElementById('ventasDesde').value;
  const hasta = document.getElementById('ventasHasta').value;
  const guidSucursal = document.getElementById('ventasSucursal').value;
  const div = document.getElementById('ventasResultados');
  div.innerHTML = '<div class="text-center py-4"><div class="spinner-border"></div></div>';

  try {
    const [ventas, devCambios] = await Promise.all([
      API.GetVentas({ desde, hasta, guidSucursal }),
      API.GetTotalesDevCambios({ desde, hasta, guidSucursal }),
    ]);
    if (ventas.length === 0 && devCambios.devoluciones.Cantidad === 0 && devCambios.cambios.Cantidad === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron ventas en el período seleccionado.</div>';
      return;
    }

    const totalVentas = ventas.reduce((s, v) => s + (v.TOTAL || 0), 0);
    const totalDev = devCambios.devoluciones.Total || 0;
    const totalCambios = devCambios.cambios.Total || 0;
    const cantDev = devCambios.devoluciones.Cantidad || 0;
    const cantCambios = devCambios.cambios.Cantidad || 0;
    const totalNeto = totalVentas - totalDev - totalCambios;

    div.innerHTML = `
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card stat-card bg-success text-white p-3">
            <div class="d-flex justify-content-between"><span>Ventas</span><i class="bi bi-graph-up-arrow fs-4"></i></div>
            <h3>${FormatMoney(totalVentas)}</h3>
            <small>${ventas.length} operaciones</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card bg-danger text-white p-3">
            <div class="d-flex justify-content-between"><span>Devoluciones</span><i class="bi bi-arrow-return-left fs-4"></i></div>
            <h3>-${FormatMoney(totalDev)}</h3>
            <small>${cantDev} operaciones</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card bg-warning text-dark p-3">
            <div class="d-flex justify-content-between"><span>Cambios</span><i class="bi bi-arrow-left-right fs-4"></i></div>
            <h3>-${FormatMoney(totalCambios)}</h3>
            <small>${cantCambios} operaciones</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card bg-primary text-white p-3">
            <div class="d-flex justify-content-between"><span>Neto</span><i class="bi bi-cash-coin fs-4"></i></div>
            <h3>${FormatMoney(totalNeto)}</h3>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-header bg-white fw-semibold"><i class="bi bi-pie-chart me-2"></i>Formas de Pago</div>
            <div class="card-body d-flex justify-content-center" style="height:280px;">
              <canvas id="chartPagos"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-header bg-white fw-semibold"><i class="bi bi-pie-chart me-2"></i>Ventas por Sucursal</div>
            <div class="card-body d-flex justify-content-center" style="height:280px;">
              <canvas id="chartSucursales"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-header bg-white fw-semibold"><i class="bi bi-pie-chart me-2"></i>Dev. + Cambios vs Ventas</div>
            <div class="card-body d-flex justify-content-center" style="height:280px;">
              <canvas id="chartDevoluciones"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Sucursal</th><th>Tipo</th><th class="text-end">Total</th><th></th></tr>
            </thead>
            <tbody>
              ${ventas.map(v => `
                <tr>
                  <td>${FormatFechaInt(v.FECHA)}</td>
                  <td>${FormatHoraInt(v.HORA)}</td>
                  <td>${(v.NOMBRE || 'Consumidor Final').trim()}</td>
                  <td>${(v.Sucursal || '').trim()}</td>
                  <td><span class="badge bg-${v.TIPOOPERACION === 'VENTA' || v.TIPOOPERACION === '' || !v.TIPOOPERACION ? 'success' : 'danger'}">${v.TIPOOPERACION || 'VENTA'}</span></td>
                  <td class="text-end fw-bold">${FormatMoney(v.TOTAL)}</td>
                  <td><button class="btn btn-sm btn-outline-info" onclick="VerDetalleVenta('${v.GUID}')"><i class="bi bi-eye"></i></button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Cargar gráficos
    RenderCharts(desde, hasta, guidSucursal, totalVentas, totalDev + totalCambios);
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

const CHART_COLORS = ['#198754', '#0d6efd', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0', '#fd7e14', '#20c997', '#6610f2', '#d63384'];

async function RenderCharts(desde, hasta, guidSucursal, totalVentas, totalDev) {
  try {
    const [pagosData, sucursalesData] = await Promise.all([
      API.GetResumenPagos({ desde, hasta, guidSucursal }),
      API.GetVentasPorSucursal({ desde, hasta }),
    ]);

    // Gráfico Formas de Pago
    const ctxPagos = document.getElementById('chartPagos');
    if (ctxPagos && pagosData.length > 0) {
      new Chart(ctxPagos, {
        type: 'pie',
        data: {
          labels: pagosData.map(p => p.TipoPago || 'Sin tipo'),
          datasets: [{
            data: pagosData.map(p => p.Total || 0),
            backgroundColor: CHART_COLORS.slice(0, pagosData.length),
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${FormatMoney(ctx.raw)} (${ctx.dataset.data.reduce((a, b) => a + b, 0) > 0 ? ((ctx.raw / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) : 0}%)`
              }
            }
          },
        },
      });
    } else if (ctxPagos) {
      ctxPagos.parentElement.innerHTML = '<p class="text-muted text-center py-5">Sin datos de pagos</p>';
    }

    // Gráfico Ventas por Sucursal
    const ctxSuc = document.getElementById('chartSucursales');
    if (ctxSuc && sucursalesData.length > 0) {
      new Chart(ctxSuc, {
        type: 'pie',
        data: {
          labels: sucursalesData.map(s => s.Sucursal || 'Sin sucursal'),
          datasets: [{
            data: sucursalesData.map(s => s.Total || 0),
            backgroundColor: CHART_COLORS.slice(0, sucursalesData.length).reverse(),
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${FormatMoney(ctx.raw)} (${ctx.dataset.data.reduce((a, b) => a + b, 0) > 0 ? ((ctx.raw / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) : 0}%)`
              }
            }
          },
        },
      });
    } else if (ctxSuc) {
      ctxSuc.parentElement.innerHTML = '<p class="text-muted text-center py-5">Sin datos de sucursales</p>';
    }

    // Gráfico Devoluciones+Cambios vs Ventas
    const ctxDev = document.getElementById('chartDevoluciones');
    const ventasNetas = totalVentas - totalDev;
    if (ctxDev && (totalVentas > 0 || totalDev > 0)) {
      const pctDev = totalVentas > 0 ? ((totalDev / totalVentas) * 100).toFixed(1) : 0;
      new Chart(ctxDev, {
        type: 'doughnut',
        data: {
          labels: [`Ventas Netas (${(100 - pctDev).toFixed(1)}%)`, `Dev. + Cambios (${pctDev}%)`],
          datasets: [{
            data: [ventasNetas, totalDev],
            backgroundColor: ['#198754', '#dc3545'],
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
          plugins: {
            legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${FormatMoney(ctx.raw)}`
              }
            }
          },
        },
        plugins: [{
          id: 'centerText',
          afterDraw(chart) {
            const { ctx: c, width, height } = chart;
            c.save();
            c.font = 'bold 22px Segoe UI';
            c.fillStyle = totalDev > 0 ? '#dc3545' : '#198754';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(`${pctDev}%`, width / 2, height / 2 - 10);
            c.font = '12px Segoe UI';
            c.fillStyle = '#6c757d';
            c.fillText('devoluciones', width / 2, height / 2 + 12);
            c.restore();
          }
        }],
      });
    } else if (ctxDev) {
      ctxDev.parentElement.innerHTML = '<p class="text-muted text-center py-5">Sin datos</p>';
    }
  } catch (err) {
    console.error('Error al cargar gráficos:', err);
  }
}

async function VerDetalleVenta(guid) {
  try {
    const det = await API.GetVentaDetalle(guid);
    const body = document.getElementById('detalleVentaBody');
    const r = det.remito;
    body.innerHTML = `
      <div class="row mb-3">
        <div class="col-md-6">
          <p><strong>Cliente:</strong> ${(r.NOMBRE || 'Consumidor Final').trim()}</p>
          <p><strong>Fecha:</strong> ${FormatFechaInt(r.FECHA)} ${FormatHoraInt(r.HORA)}</p>
        </div>
        <div class="col-md-6 text-end">
          <p><strong>Tipo:</strong> <span class="badge bg-${r.TIPOOPERACION === 'VENTA' ? 'success' : 'danger'}">${r.TIPOOPERACION}</span></p>
          <p class="fs-4 fw-bold text-success">${FormatMoney(r.TOTAL)}</p>
        </div>
      </div>
      <h6>Artículos</h6>
      <table class="table table-sm">
        <thead class="table-light">
          <tr><th>Código</th><th>Descripción</th><th>Talle</th><th class="text-center">Cant.</th><th class="text-end">Precio</th><th class="text-end">Subtotal</th></tr>
        </thead>
        <tbody>
          ${det.items.map(i => `
            <tr>
              <td><code>${(i.ARTICULO || '').trim()}</code></td>
              <td>${(i.DESCRIPCION || '').trim()}</td>
              <td>${i.NUMERO || '-'}</td>
              <td class="text-center">${i.CANTIDAD}</td>
              <td class="text-end">${FormatMoney(i.NETO)}</td>
              <td class="text-end">${FormatMoney(i.TOTAL)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h6>Pagos</h6>
      <table class="table table-sm">
        <thead class="table-light">
          <tr><th>Tipo</th><th>Descripción</th><th class="text-end">Importe</th></tr>
        </thead>
        <tbody>
          ${det.pagos.map(p => `
            <tr>
              <td><span class="badge bg-secondary">${(p.TIPOCOMPROBANTE || '').trim()}</span></td>
              <td>${(p.DESCRIPCION || '').trim()}</td>
              <td class="text-end">${FormatMoney(p.IMPORTE)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    new bootstrap.Modal(document.getElementById('modalDetalleVenta')).show();
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// ============================================================================
// Helper: Expandir detalle de items en browse de devoluciones/cambios
// ============================================================================
async function ToggleDetalleRemito(guid, rowId) {
  const existing = document.getElementById('detalle-' + rowId);
  if (existing) { existing.remove(); return; }
  const tr = document.getElementById(rowId);
  const colspan = tr.children.length;
  const detailRow = document.createElement('tr');
  detailRow.id = 'detalle-' + rowId;
  detailRow.innerHTML = `<td colspan="${colspan}" class="p-0"><div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div></td>`;
  tr.after(detailRow);
  try {
    const det = await API.GetVentaDetalle(guid);
    const items = det.items;
    detailRow.innerHTML = `
      <td colspan="${colspan}" class="p-0">
        <table class="table table-sm table-bordered mb-0 bg-light">
          <thead>
            <tr class="table-secondary">
              <th>Codigo</th><th>Descripcion</th><th>Talle</th>
              <th class="text-center">Cant. Original</th>
              <th class="text-center">Dev/Camb</th>
              <th class="text-center">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => {
              const devuelto = i.CANTIDAD - i.RESTANTE;
              const saldoClass = i.RESTANTE <= 0 ? 'text-danger' : 'text-success';
              return `
                <tr>
                  <td><code>${(i.ARTICULO || '').trim()}</code></td>
                  <td>${(i.DESCRIPCION || '').trim()}</td>
                  <td>${i.NUMERO || '-'}</td>
                  <td class="text-center">${i.CANTIDAD}</td>
                  <td class="text-center">${devuelto > 0 ? '<span class="text-danger">' + devuelto + '</span>' : '0'}</td>
                  <td class="text-center fw-bold ${saldoClass}">${i.RESTANTE}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </td>`;
  } catch (err) {
    detailRow.innerHTML = `<td colspan="${colspan}"><div class="alert alert-danger mb-0 py-1">${err.message}</div></td>`;
  }
}

// ============================================================================
// SECCIÓN: Devoluciones
// ============================================================================
function RenderDevoluciones(container) {
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-arrow-return-left me-2"></i>Devoluciones</h4>
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h6>Buscar venta original</h6>
          <div class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Desde</label>
              <input type="date" id="devDesde" class="form-control" value="${Days30AgoISO()}" min="${Days30AgoISO()}" max="${TodayISO()}">
            </div>
            <div class="col-md-3">
              <label class="form-label">Hasta</label>
              <input type="date" id="devHasta" class="form-control" value="${TodayISO()}" min="${Days30AgoISO()}" max="${TodayISO()}">
            </div>
            <div class="col-md-3">
              <button class="btn btn-primary w-100" onclick="BuscarVentasParaDev()"><i class="bi bi-search me-1"></i>Buscar Ventas</button>
            </div>
          </div>
        </div>
      </div>
      <div id="devVentasLista"></div>
      <div id="devFormulario" class="d-none"></div>
    </div>
  `;
  BuscarVentasParaDev();
}

async function BuscarVentasParaDev() {
  const desde = document.getElementById('devDesde').value;
  const hasta = document.getElementById('devHasta').value;
  const div = document.getElementById('devVentasLista');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';

  try {
    const ventas = await API.GetVentas({ desde, hasta, guidSucursal: State.sucursalActual });
    const soloVentas = ventas;
    if (soloVentas.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron ventas.</div>';
      return;
    }
    div.innerHTML = `
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th></th><th>Fecha</th><th>Cliente</th><th class="text-end">Total</th><th></th></tr>
            </thead>
            <tbody>
              ${soloVentas.map((v, idx) => `
                <tr id="devRow${idx}">
                  <td><button class="btn btn-sm btn-outline-secondary" onclick="ToggleDetalleRemito('${v.GUID}','devRow${idx}')"><i class="bi bi-eye"></i></button></td>
                  <td>${FormatFechaInt(v.FECHA)} ${FormatHoraInt(v.HORA)}</td>
                  <td>${(v.NOMBRE || 'Consumidor Final').trim()}</td>
                  <td class="text-end fw-bold">${FormatMoney(v.TOTAL)}</td>
                  <td><button class="btn btn-sm btn-danger" onclick="SeleccionarVentaDev('${v.GUID}')"><i class="bi bi-arrow-return-left me-1"></i>Devolver</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function SeleccionarVentaDev(guid) {
  try {
    _devCambioCliente = null;
    const det = await API.GetVentaDetalle(guid);
    const r = det.remito;
    const itemsDisponibles = det.items.filter(item => item.RESTANTE > 0);
    if (itemsDisponibles.length === 0) {
      ShowToast('Aviso', 'Este remito ya fue devuelto/cambiado en su totalidad', 'info');
      return;
    }
    const esCF = EsConsumidorFinal(r.NOMBRE, r.GUIDCLIENTES);
    const form = document.getElementById('devFormulario');
    form.classList.remove('d-none');
    form.innerHTML = `
      <div class="card shadow-sm border-danger">
        <div class="card-header bg-danger text-white"><h6 class="mb-0"><i class="bi bi-arrow-return-left me-2"></i>Seleccione articulos a devolver</h6></div>
        <div class="card-body">
          ${esCF ? RenderClienteSelectorHTML('dev') : ''}
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Tipo de devolucion <span class="text-danger">*</span></label>
              <select id="devTipo" class="form-select">
                <option value="">Seleccione...</option>
                <option value="DEFECTO">Defecto en el articulo</option>
                <option value="PREFERENCIA">Devolucion por preferencia</option>
              </select>
              <div class="invalid-feedback">Seleccione el tipo de devolucion</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Motivo de la devolucion <span class="text-danger">*</span></label>
              <input type="text" id="devMotivo" class="form-control" placeholder="Describa el motivo de la devolucion..." required>
              <div class="invalid-feedback">El motivo es obligatorio</div>
            </div>
          </div>
          <table class="table table-sm">
            <thead class="table-light">
              <tr><th><input type="checkbox" id="devCheckAll" onchange="ToggleAllDev(this.checked)"></th><th>Codigo</th><th>Descripcion</th><th>Talle</th><th class="text-center">Cant. Disponible</th><th class="text-center">Cant. Devolver</th></tr>
            </thead>
            <tbody>
              ${itemsDisponibles.map((item, i) => `
                <tr>
                  <td><input type="checkbox" class="devCheck" data-idx="${i}"></td>
                  <td><code>${(item.ARTICULO || '').trim()}</code></td>
                  <td>${(item.DESCRIPCION || '').trim()}</td>
                  <td>${item.NUMERO || '-'}</td>
                  <td class="text-center">${item.RESTANTE}</td>
                  <td class="text-center"><input type="number" class="form-control form-control-sm qty-input devQty" data-idx="${i}" value="${item.RESTANTE}" min="1" max="${item.RESTANTE}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="btn btn-danger" onclick="ConfirmarDevolucion('${guid}', ${JSON.stringify(itemsDisponibles).replace(/"/g, '&quot;')}, '${(r.GUIDCLIENTES || '').trim()}', '${(r.NOMBRE || '').trim().replace(/'/g, "\\'")}')">
            <i class="bi bi-check-circle me-1"></i>Confirmar Devolucion
          </button>
        </div>
      </div>
    `;
    if (esCF) InitClienteSelectorEvents('dev');
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// Cliente seleccionado para devolucion/cambio cuando el original es Consumidor Final
let _devCambioCliente = null;

function EsConsumidorFinal(nombre, guidCliente) {
  const n = (nombre || '').trim().toUpperCase();
  return !guidCliente || guidCliente.trim() === '' || n === 'CONSUMIDOR FINAL' || n === '';
}

function RenderClienteSelectorHTML(idPrefix) {
  return `
    <div class="card border-warning mb-3" id="${idPrefix}ClienteZona">
      <div class="card-body">
        <h6 class="card-title text-warning"><i class="bi bi-exclamation-triangle me-2"></i>Cliente requerido</h6>
        <p class="small text-muted mb-2">La venta original es de Consumidor Final. Debe asignar un cliente para esta operacion.</p>
        <div class="input-group mb-2">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input type="text" id="${idPrefix}BuscarCliente" class="form-control" placeholder="Buscar cliente por nombre o CUIT...">
        </div>
        <div id="${idPrefix}ListaClientes" class="list-group mb-2" style="max-height:200px; overflow-y:auto;"></div>
        <div id="${idPrefix}ClienteSeleccionado" class="d-none">
          <div class="alert alert-success py-2 mb-0">
            <i class="bi bi-person-check me-1"></i><strong id="${idPrefix}ClienteNombre"></strong>
            <button class="btn btn-sm btn-outline-danger ms-2" onclick="LimpiarClienteDevCambio('${idPrefix}')"><i class="bi bi-x"></i></button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function InitClienteSelectorEvents(idPrefix) {
  const input = document.getElementById(`${idPrefix}BuscarCliente`);
  if (!input) return;
  input.oninput = Debounce(async () => {
    const val = input.value.trim();
    const lista = document.getElementById(`${idPrefix}ListaClientes`);
    if (val.length < 2) { lista.innerHTML = ''; return; }
    try {
      const clientes = await API.GetClientes(val);
      if (clientes.length === 0) {
        lista.innerHTML = '<div class="alert alert-info py-2">No se encontraron clientes</div>';
        return;
      }
      lista.innerHTML = clientes.slice(0, 10).map(c => `
        <a href="#" class="list-group-item list-group-item-action py-2"
           onclick="event.preventDefault(); SeleccionarClienteDevCambio('${idPrefix}', ${JSON.stringify(c).replace(/"/g, '&quot;')})">
          <strong>${(c.NOMBRE || '').trim()}</strong>
          <small class="text-muted ms-2">CUIT: ${(c.CUIT || '').trim()}</small>
        </a>
      `).join('');
    } catch (_) {}
  }, 300);
}

function SeleccionarClienteDevCambio(idPrefix, cliente) {
  _devCambioCliente = cliente;
  document.getElementById(`${idPrefix}ListaClientes`).innerHTML = '';
  document.getElementById(`${idPrefix}BuscarCliente`).closest('.input-group').classList.add('d-none');
  const sel = document.getElementById(`${idPrefix}ClienteSeleccionado`);
  sel.classList.remove('d-none');
  document.getElementById(`${idPrefix}ClienteNombre`).textContent = (cliente.NOMBRE || '').trim();
}

function LimpiarClienteDevCambio(idPrefix) {
  _devCambioCliente = null;
  document.getElementById(`${idPrefix}BuscarCliente`).closest('.input-group').classList.remove('d-none');
  document.getElementById(`${idPrefix}BuscarCliente`).value = '';
  document.getElementById(`${idPrefix}ClienteSeleccionado`).classList.add('d-none');
  document.getElementById(`${idPrefix}ListaClientes`).innerHTML = '';
}

function ToggleAllDev(checked) {
  document.querySelectorAll('.devCheck').forEach(cb => { cb.checked = checked; });
}

async function ConfirmarDevolucion(guidRemitoOriginal, originalItems, guidCliente, nombre) {
  // Validar cliente si el original es Consumidor Final
  if (EsConsumidorFinal(nombre, guidCliente)) {
    if (!_devCambioCliente) {
      ShowToast('Aviso', 'Debe seleccionar un cliente para la devolucion', 'error');
      return;
    }
    guidCliente = _devCambioCliente.GUID;
    nombre = (_devCambioCliente.NOMBRE || '').trim();
  }

  const checks = document.querySelectorAll('.devCheck:checked');
  if (checks.length === 0) {
    ShowToast('Aviso', 'Seleccione al menos un articulo', 'info');
    return;
  }

  const tipoDevolucion = document.getElementById('devTipo').value;
  if (!tipoDevolucion) {
    document.getElementById('devTipo').classList.add('is-invalid');
    ShowToast('Aviso', 'Debe seleccionar el tipo de devolucion', 'error');
    return;
  }
  document.getElementById('devTipo').classList.remove('is-invalid');

  const motivoTexto = (document.getElementById('devMotivo').value || '').trim();
  if (!motivoTexto) {
    document.getElementById('devMotivo').classList.add('is-invalid');
    ShowToast('Aviso', 'Debe ingresar el motivo de la devolucion', 'error');
    return;
  }
  document.getElementById('devMotivo').classList.remove('is-invalid');

  const motivo = `[${tipoDevolucion}] ${motivoTexto}`;

  const items = [];
  checks.forEach(cb => {
    const idx = parseInt(cb.dataset.idx);
    const qty = parseInt(document.querySelectorAll('.devQty')[idx].value) || 1;
    const orig = originalItems[idx];
    items.push({
      guidArticulo: orig.GUIDARTICULOS || '',
      guidMovimientoArticulo: orig.GUIDMOVIMIENTOARTICULOS || '',
      codigoArticulo: (orig.ARTICULO || '').trim(),
      descripcion: (orig.DESCRIPCION || '').trim(),
      talle: orig.NUMERO || 0,
      color: '',
      cantidad: qty,
      precioUnitario: orig.NETO || 0,
      precioCosto: orig.COSTO || 0,
    });
  });

  try {
    const result = await API.CreateDevolucion({
      guidRemitoOriginal,
      guidCliente,
      guidSucursal: State.sucursalActual,
      guidVendedor: null,
      nombre,
      items,
      motivo,
      tipoDevolucion,
    });
    _devCambioCliente = null;
    ShowToast('Devolucion exitosa', `Total devuelto: ${FormatMoney(result.total)}`, 'success');
    RenderDevoluciones(document.getElementById('mainContent'));
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// ============================================================================
// SECCION: Cambios de Mercaderia
// ============================================================================
function RenderCambios(container) {
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-arrow-repeat me-2"></i>Cambios de Mercaderia</h4>
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h6>Buscar venta original</h6>
          <div class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Desde</label>
              <input type="date" id="cambDesde" class="form-control" value="${Days30AgoISO()}" min="${Days30AgoISO()}" max="${TodayISO()}">
            </div>
            <div class="col-md-3">
              <label class="form-label">Hasta</label>
              <input type="date" id="cambHasta" class="form-control" value="${TodayISO()}" min="${Days30AgoISO()}" max="${TodayISO()}">
            </div>
            <div class="col-md-3">
              <button class="btn btn-primary w-100" onclick="BuscarVentasParaCambio()"><i class="bi bi-search me-1"></i>Buscar Ventas</button>
            </div>
          </div>
        </div>
      </div>
      <div id="cambVentasLista"></div>
      <div id="cambFormulario" class="d-none"></div>
    </div>
  `;
  BuscarVentasParaCambio();
}

async function BuscarVentasParaCambio() {
  const desde = document.getElementById('cambDesde').value;
  const hasta = document.getElementById('cambHasta').value;
  const div = document.getElementById('cambVentasLista');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';

  try {
    const ventas = await API.GetVentas({ desde, hasta, guidSucursal: State.sucursalActual });
    const soloVentas = ventas;
    if (soloVentas.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron ventas.</div>';
      return;
    }
    div.innerHTML = `
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th></th><th>Fecha</th><th>Cliente</th><th class="text-end">Total</th><th></th></tr>
            </thead>
            <tbody>
              ${soloVentas.map((v, idx) => `
                <tr id="cambRow${idx}">
                  <td><button class="btn btn-sm btn-outline-secondary" onclick="ToggleDetalleRemito('${v.GUID}','cambRow${idx}')"><i class="bi bi-eye"></i></button></td>
                  <td>${FormatFechaInt(v.FECHA)} ${FormatHoraInt(v.HORA)}</td>
                  <td>${(v.NOMBRE || 'Consumidor Final').trim()}</td>
                  <td class="text-end fw-bold">${FormatMoney(v.TOTAL)}</td>
                  <td><button class="btn btn-sm btn-warning" onclick="SeleccionarVentaCambio('${v.GUID}')"><i class="bi bi-arrow-repeat me-1"></i>Cambiar</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function SeleccionarVentaCambio(guid) {
  try {
    _devCambioCliente = null;
    const det = await API.GetVentaDetalle(guid);
    const r = det.remito;
    const itemsDisponibles = det.items.filter(item => item.RESTANTE > 0);
    if (itemsDisponibles.length === 0) {
      ShowToast('Aviso', 'Este remito ya fue devuelto/cambiado en su totalidad', 'info');
      return;
    }
    const esCF = EsConsumidorFinal(r.NOMBRE, r.GUIDCLIENTES);
    const form = document.getElementById('cambFormulario');
    form.classList.remove('d-none');
    form.innerHTML = `
      <div class="card shadow-sm border-warning">
        <div class="card-header bg-warning text-dark"><h6 class="mb-0"><i class="bi bi-arrow-repeat me-2"></i>Seleccione articulos a cambiar</h6></div>
        <div class="card-body">
          ${esCF ? RenderClienteSelectorHTML('camb') : ''}
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Tipo de cambio <span class="text-danger">*</span></label>
              <select id="cambTipo" class="form-select">
                <option value="">Seleccione...</option>
                <option value="DEFECTO">Defecto en el articulo</option>
                <option value="PREFERENCIA">Cambio por preferencia</option>
              </select>
              <div class="invalid-feedback">Seleccione el tipo de cambio</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Motivo del cambio <span class="text-danger">*</span></label>
              <input type="text" id="cambMotivo" class="form-control" placeholder="Describa el motivo del cambio..." required>
              <div class="invalid-feedback">El motivo es obligatorio</div>
            </div>
          </div>
          <table class="table table-sm">
            <thead class="table-light">
              <tr><th><input type="checkbox" id="cambCheckAll" onchange="ToggleAllCambio(this.checked)"></th><th>Codigo</th><th>Descripcion</th><th>Talle</th><th class="text-center">Cant. Disponible</th><th class="text-center">Cant. Cambiar</th></tr>
            </thead>
            <tbody>
              ${itemsDisponibles.map((item, i) => `
                <tr>
                  <td><input type="checkbox" class="cambCheck" data-idx="${i}"></td>
                  <td><code>${(item.ARTICULO || '').trim()}</code></td>
                  <td>${(item.DESCRIPCION || '').trim()}</td>
                  <td>${item.NUMERO || '-'}</td>
                  <td class="text-center">${item.RESTANTE}</td>
                  <td class="text-center"><input type="number" class="form-control form-control-sm qty-input cambQty" data-idx="${i}" value="${item.RESTANTE}" min="1" max="${item.RESTANTE}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="btn btn-warning" onclick="PrepararCambioParaPOS('${guid}', ${JSON.stringify(itemsDisponibles).replace(/"/g, '&quot;')}, '${(r.GUIDCLIENTES || '').trim()}', '${(r.NOMBRE || '').trim().replace(/'/g, "\\'")}')">
            <i class="bi bi-cart-plus me-1"></i>Cargar Nueva Mercaderia
          </button>
        </div>
      </div>
    `;
    if (esCF) InitClienteSelectorEvents('camb');
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

function ToggleAllCambio(checked) {
  document.querySelectorAll('.cambCheck').forEach(cb => { cb.checked = checked; });
}

function PrepararCambioParaPOS(guidRemitoOriginal, originalItems, guidCliente, nombre) {
  // Validar cliente si el original es Consumidor Final
  if (EsConsumidorFinal(nombre, guidCliente)) {
    if (!_devCambioCliente) {
      ShowToast('Aviso', 'Debe seleccionar un cliente para el cambio', 'error');
      return;
    }
    guidCliente = _devCambioCliente.GUID;
    nombre = (_devCambioCliente.NOMBRE || '').trim();
  }

  const checks = document.querySelectorAll('.cambCheck:checked');
  if (checks.length === 0) {
    ShowToast('Aviso', 'Seleccione al menos un articulo', 'info');
    return;
  }

  const tipoCambio = document.getElementById('cambTipo').value;
  if (!tipoCambio) {
    document.getElementById('cambTipo').classList.add('is-invalid');
    ShowToast('Aviso', 'Seleccione el tipo de cambio', 'error');
    return;
  }

  const motivo = (document.getElementById('cambMotivo').value || '').trim();
  if (!motivo) {
    document.getElementById('cambMotivo').classList.add('is-invalid');
    ShowToast('Aviso', 'Debe ingresar el motivo del cambio', 'error');
    return;
  }

  const itemsCambio = [];
  checks.forEach(cb => {
    const idx = parseInt(cb.dataset.idx);
    const qty = parseInt(document.querySelectorAll('.cambQty')[idx].value) || 1;
    const orig = originalItems[idx];
    itemsCambio.push({
      guidArticulo: orig.GUIDARTICULOS || '',
      guidMovimientoArticulo: orig.GUIDMOVIMIENTOARTICULOS || '',
      codigoArticulo: (orig.ARTICULO || '').trim(),
      descripcion: (orig.DESCRIPCION || '').trim(),
      talle: orig.NUMERO || 0,
      color: '',
      cantidad: qty,
      precioUnitario: orig.NETO || 0,
      precioCosto: orig.COSTO || 0,
    });
  });

  let totalCambio = 0;
  for (const item of itemsCambio) {
    totalCambio += item.cantidad * item.precioUnitario;
  }

  // Guardar datos del cambio en POS (NO se graba nada en DB todavia)
  POS._cambioData = {
    guidRemitoOriginal,
    guidCliente,
    nombre,
    motivo: `${tipoCambio === 'DEFECTO' ? 'Defecto' : 'Preferencia'}: ${motivo}`,
    tipoCambio,
    itemsCambio,
    totalCambio,
  };

  // Navegar al POS
  App.Navigate('pos');

  // Mostrar alerta indicando modo cambio
  setTimeout(() => {
    const main = document.getElementById('mainContent');
    const alertDiv = document.createElement('div');
    alertDiv.id = 'cambioAlert';
    alertDiv.className = 'alert alert-warning fade show mb-3';
    alertDiv.innerHTML = `
      <i class="bi bi-arrow-repeat me-2"></i>
      <strong>Modo Cambio:</strong> Cargue los nuevos articulos para el cambio.
      Credito del cambio: <strong>${FormatMoney(totalCambio)}</strong>.
      Si el monto de la nueva venta supera el credito, se cobrara la diferencia.
      <button class="btn btn-sm btn-outline-danger ms-3" onclick="CancelarModoCambio()"><i class="bi bi-x-circle me-1"></i>Cancelar cambio</button>
    `;
    main.insertBefore(alertDiv, main.firstChild);
  }, 100);
}

function CancelarModoCambio() {
  delete POS._cambioData;
  const alert = document.getElementById('cambioAlert');
  if (alert) alert.remove();
  ShowToast('Cambio cancelado', 'Se cancelo el modo cambio', 'info');
}

// Override AbrirPagos: en modo cambio, verificar si hay diferencia a cobrar
const _originalAbrirPagos = POS.AbrirPagos.bind(POS);
POS.AbrirPagos = function () {
  if (POS._cambioData) {
    const totalVentaNueva = POS.GetTotal();
    const diferencia = totalVentaNueva - POS._cambioData.totalCambio;
    POS._cambioData.diferencia = diferencia > 0.01 ? diferencia : 0;

    if (diferencia <= 0.01) {
      // Sin diferencia: confirmar directamente sin cobro
      ConfirmarCambioConVenta();
    } else {
      // Hay diferencia: abrir modal de pagos para cobrar solo la diferencia
      if (!POS.vendedor) {
        const sel = document.getElementById('posVendedor');
        sel.focus();
        sel.size = sel.options.length > 8 ? 8 : sel.options.length;
        sel.classList.add('is-invalid');
        const handler = () => { sel.size = 1; sel.classList.remove('is-invalid'); sel.removeEventListener('change', handler); sel.removeEventListener('blur', handler); };
        sel.addEventListener('change', handler);
        sel.addEventListener('blur', handler);
        ShowToast('Aviso', 'Seleccione un vendedor antes de cobrar', 'error');
        return;
      }
      POS.pagos = [];
      RenderPagosModal();
      new bootstrap.Modal(document.getElementById('modalPagos')).show();
    }
    return;
  }
  _originalAbrirPagos();
};

async function ConfirmarCambioConVenta() {
  const cambio = POS._cambioData;
  if (!cambio) return;

  if (POS.items.length === 0) {
    ShowToast('Aviso', 'Agregue articulos para la nueva venta', 'info');
    return;
  }

  if (!POS.vendedor) {
    const sel = document.getElementById('posVendedor');
    sel.focus();
    sel.size = sel.options.length > 8 ? 8 : sel.options.length;
    sel.classList.add('is-invalid');
    const handler = () => {
      sel.size = 1;
      sel.classList.remove('is-invalid');
      sel.removeEventListener('change', handler);
      sel.removeEventListener('blur', handler);
    };
    sel.addEventListener('change', handler);
    sel.addEventListener('blur', handler);
    ShowToast('Aviso', 'Seleccione un vendedor antes de confirmar', 'error');
    return;
  }

  const btnCobrar = document.getElementById('btnCobrar');
  btnCobrar.disabled = true;
  btnCobrar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Procesando cambio...';

  try {
    const payload = {
      guidRemitoOriginal: cambio.guidRemitoOriginal,
      guidCliente: cambio.guidCliente,
      guidSucursal: State.sucursalActual,
      guidVendedor: POS.vendedor,
      nombre: cambio.nombre,
      motivo: cambio.motivo,
      tipoCambio: cambio.tipoCambio,
      itemsCambio: cambio.itemsCambio,
      itemsVenta: POS.items,
    };

    // Si hay diferencia a cobrar, enviar los pagos
    if (cambio.diferencia > 0.01 && POS.pagos.length > 0) {
      payload.pagos = POS.pagos;
    }

    const result = await API.CreateCambioConVenta(payload);

    delete POS._cambioData;
    _devCambioCliente = null;
    const msgDif = result.diferencia > 0 ? ` | Diferencia cobrada: ${FormatMoney(result.diferencia)}` : '';
    ShowToast('Cambio exitoso',
      `Cambio: ${FormatMoney(result.totalCambio)} | Nueva venta: ${FormatMoney(result.totalVenta)}${msgDif} | Pago: ${result.formaPago}`,
      'success');
    POS.Reset();
    RenderPOS(document.getElementById('mainContent'));
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  } finally {
    btnCobrar.disabled = false;
    btnCobrar.innerHTML = '<i class="bi bi-cash-stack me-2"></i>Cobrar';
  }
}

// ============================================================================
// SECCIÓN: Transferencias
// ============================================================================
const Transferencia = {
  items: [],

  Reset() { Transferencia.items = []; },

  async BuscarArticulo(texto) {
    if (!texto) return;
    try {
      let art = null;
      try { art = await API.GetArticuloByCodigo(texto); } catch (_) {}

      if (art) {
        const movs = await API.GetMovimientoArticulos(art.GUID);
        if (movs.length === 0) {
          Transferencia.AgregarItem(art, null);
        } else {
          RenderTallesTransferencia(art, movs);
        }
        return;
      }

      const resultados = await API.GetArticulos(texto);
      if (resultados.length === 0) {
        ShowToast('Aviso', 'No se encontraron articulos', 'info');
      } else if (resultados.length === 1) {
        const movs = await API.GetMovimientoArticulos(resultados[0].GUID);
        if (movs.length === 0) {
          Transferencia.AgregarItem(resultados[0], null);
        } else {
          RenderTallesTransferencia(resultados[0], movs);
        }
      } else {
        RenderArticulosSugeridosTransf(resultados);
      }
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    }
  },

  AgregarItem(art, mov) {
    Transferencia.items.push({
      guidArticulo: art.GUID,
      guidMovimientoArticulo: mov ? mov.GUID : '',
      codigoArticulo: (art.CODIGOARTICULO || '').trim(),
      descripcion: (art.DESCRIPCION || '').trim(),
      talle: mov ? mov.NUMERO : 0,
      color: mov ? (mov.COLOR || '').trim() : '',
      cantidad: 1,
    });
    RenderTransferenciaItems();
    const input = document.getElementById('transfSearch');
    if (input) { input.value = ''; input.focus(); }
  },

  async SeleccionarSugerido(guid) {
    try {
      const art = await API.GetArticuloByGuid(guid);
      if (!art) { ShowToast('Aviso', 'Artículo no encontrado', 'error'); return; }
      const movs = await API.GetMovimientoArticulos(guid);
      if (movs.length === 0) {
        Transferencia.AgregarItem(art, null);
        document.getElementById('transfTallesContainer').innerHTML = '';
      } else {
        RenderTallesTransferencia(art, movs);
      }
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    }
  },

  QuitarItem(idx) {
    Transferencia.items.splice(idx, 1);
    RenderTransferenciaItems();
  },
};

function RenderTransferencias(container) {
  Transferencia.Reset();
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-arrow-left-right me-2"></i>Transferencias entre Sucursales</h4>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabNuevaTransf">Nueva Transferencia</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabHistTransf">Historial</a></li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="tabNuevaTransf">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-3 mb-3">
                <div class="col-md-5">
                  <label class="form-label fw-semibold">Sucursal Origen</label>
                  <select id="transfOrigen" class="form-select">
                    ${State.sucursales.map(s => `<option value="${s.GUID}" ${s.GUID === State.sucursalActual ? 'selected' : ''}>${(s.NOMBRE || '').trim()}</option>`).join('')}
                  </select>
                </div>
                <div class="col-md-2 d-flex align-items-end justify-content-center">
                  <i class="bi bi-arrow-right fs-2 text-primary"></i>
                </div>
                <div class="col-md-5">
                  <label class="form-label fw-semibold">Sucursal Destino</label>
                  <select id="transfDestino" class="form-select">
                    <option value="">Seleccione...</option>
                    ${State.sucursales.map(s => `<option value="${s.GUID}">${(s.NOMBRE || '').trim()}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="input-group mb-3">
                <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                <input type="text" id="transfSearch" class="form-control" placeholder="Escanear o buscar artículo...">
                <button class="btn btn-primary" onclick="Transferencia.BuscarArticulo(document.getElementById('transfSearch').value.trim())">
                  <i class="bi bi-plus-circle"></i> Agregar
                </button>
              </div>

              <div id="transfTallesContainer" class="mb-3"></div>

              <table class="table table-hover no-sort-table">
                <thead class="table-light">
                  <tr><th>Código</th><th>Descripción</th><th>Talle</th><th>Color</th><th class="text-center">Cant.</th><th></th></tr>
                </thead>
                <tbody id="transfItemsBody">
                  <tr><td colspan="6" class="text-center text-muted py-3">Sin artículos</td></tr>
                </tbody>
              </table>

              <div class="text-end">
                <button class="btn btn-primary btn-lg" onclick="ConfirmarTransferencia()">
                  <i class="bi bi-send me-1"></i>Confirmar Transferencia
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="tabHistTransf">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label">Desde</label>
                  <input type="date" id="transfDesde" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <input type="date" id="transfHasta" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" onclick="BuscarTransferencias()"><i class="bi bi-search me-1"></i>Buscar</button>
                </div>
              </div>
            </div>
          </div>
          <div id="transfHistorial"></div>
        </div>
      </div>
    </div>
  `;

  const transfInput = document.getElementById('transfSearch');
  transfInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      Transferencia.BuscarArticulo(e.target.value.trim());
    }
  });
  let _transfDebounce;
  transfInput.addEventListener('input', () => {
    clearTimeout(_transfDebounce);
    const texto = transfInput.value.trim();
    if (texto.length < 2) { document.getElementById('transfTallesContainer').innerHTML = ''; return; }
    _transfDebounce = setTimeout(() => Transferencia.BuscarArticulo(texto), 400);
  });
}

function RenderTallesTransferencia(art, movs) {
  const container = document.getElementById('transfTallesContainer');
  container.innerHTML = `
    <div class="card p-3 border-primary">
      <h6>${(art.DESCRIPCION || '').trim()} — Seleccione talle:</h6>
      <div class="d-flex flex-wrap gap-1">
        ${movs.map(m => `
          <button class="btn btn-outline-primary talle-btn" onclick="Transferencia.AgregarItem(${JSON.stringify(art).replace(/"/g, '&quot;')}, ${JSON.stringify(m).replace(/"/g, '&quot;')}); document.getElementById('transfTallesContainer').innerHTML='';">
            ${m.NUMERO}${m.COLOR ? `<br><small>${(m.COLOR || '').trim()}</small>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function RenderArticulosSugeridosTransf(articulos) {
  const container = document.getElementById('transfTallesContainer');
  const lista = articulos.slice(0, 20);
  container.innerHTML = `
    <div class="card p-3 border-primary">
      <h6>Seleccione un articulo (${articulos.length} resultado${articulos.length > 1 ? 's' : ''}):</h6>
      <div class="list-group" style="max-height: 250px; overflow-y: auto;">
        ${lista.map(a => `
          <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onclick="Transferencia.SeleccionarSugerido('${a.GUID}')">
            <span><code>${(a.CODIGOARTICULOREL || a.CODIGOARTICULO || '').trim()}</code> — ${(a.DESCRIPCION || '').trim()}</span>
            <span class="badge bg-success">$${(a.PRECIOVENTA || 0).toLocaleString('es-AR')}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function RenderTransferenciaItems() {
  const body = document.getElementById('transfItemsBody');
  if (Transferencia.items.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Sin artículos</td></tr>';
  } else {
    body.innerHTML = Transferencia.items.map((item, i) => `
      <tr>
        <td><code>${item.codigoArticulo}</code></td>
        <td>${item.descripcion}</td>
        <td>${item.talle || '-'}</td>
        <td>${item.color || '-'}</td>
        <td class="text-center">
          <input type="number" class="form-control form-control-sm qty-input" value="${item.cantidad}" min="1"
            onchange="Transferencia.items[${i}].cantidad = parseInt(this.value) || 1;">
        </td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="Transferencia.QuitarItem(${i})"><i class="bi bi-trash"></i></button></td>
      </tr>
    `).join('');
  }
}

async function ConfirmarTransferencia() {
  const origen = document.getElementById('transfOrigen').value;
  const destino = document.getElementById('transfDestino').value;

  if (!origen || !destino) { ShowToast('Aviso', 'Seleccione origen y destino', 'info'); return; }
  if (origen === destino) { ShowToast('Aviso', 'Origen y destino deben ser diferentes', 'info'); return; }
  if (Transferencia.items.length === 0) { ShowToast('Aviso', 'Agregue artículos', 'info'); return; }

  try {
    const result = await API.CreateTransferencia({
      guidSucursalOrigen: origen,
      guidSucursalDestino: destino,
      items: Transferencia.items,
    });
    ShowToast('Transferencia exitosa', `${result.cantidadItems} artículo(s) transferido(s)`, 'success');
    RenderTransferencias(document.getElementById('mainContent'));
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

async function BuscarTransferencias() {
  const desde = document.getElementById('transfDesde').value;
  const hasta = document.getElementById('transfHasta').value;
  const div = document.getElementById('transfHistorial');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';

  try {
    const transferencias = await API.GetTransferencias({ desde, hasta, guidSucursal: State.sucursalActual });
    if (transferencias.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron transferencias.</div>';
      return;
    }
    div.innerHTML = `
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Origen</th><th>Destino</th><th class="text-center">Items</th><th></th></tr>
            </thead>
            <tbody>
              ${transferencias.map(t => `
                <tr>
                  <td>${t.Fecha ? new Date(t.Fecha).toLocaleDateString('es-AR') : '-'}</td>
                  <td>${(t.SucursalOrigen || '').trim()}</td>
                  <td>${(t.SucursalDestino || '').trim()}</td>
                  <td class="text-center"><span class="badge bg-primary">${t.CantidadItems}</span></td>
                  <td><button class="btn btn-sm btn-outline-info" onclick="VerDetalleTransferencia('${t.GuidTransferencia}')"><i class="bi bi-eye"></i></button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function VerDetalleTransferencia(guid) {
  try {
    const items = await API.GetTransferenciaDetalle(guid);
    const body = document.getElementById('detalleVentaBody');
    body.innerHTML = `
      <h6>Detalle de Transferencia</h6>
      <table class="table table-sm">
        <thead class="table-light">
          <tr><th>Código</th><th>Talle</th><th>Color</th><th class="text-center">Cantidad</th><th>Origen</th><th>Destino</th></tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td><code>${(i.CODIGOARTICULO || '').trim()}</code></td>
              <td>${i.NUMERO || '-'}</td>
              <td>${(i.COLOR || '').trim() || '-'}</td>
              <td class="text-center">${i.EGRESO}</td>
              <td>${(i.SucursalOrigen || '').trim()}</td>
              <td>${(i.SucursalDestino || '').trim()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.querySelector('#modalDetalleVenta .modal-title').innerHTML = '<i class="bi bi-arrow-left-right me-2"></i>Detalle de Transferencia';
    new bootstrap.Modal(document.getElementById('modalDetalleVenta')).show();
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// ============================================================================
// SECCIÓN: GASTOS — Caja Gastos + Adelantos de Personal
// ============================================================================

function RenderGastos(container) {
  const mesActual = new Date().toISOString().slice(0, 7);
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-cash-coin me-2"></i>Gastos y Retiros</h4>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabNuevoGasto">Nuevo Gasto</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabAdelanto">Retiro de Efectivo</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabHistGastos">Historial</a></li>
      </ul>

      <div class="tab-content">
        <!-- TAB: Nuevo Gasto -->
        <div class="tab-pane fade show active" id="tabNuevoGasto">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Rubro <span class="text-danger">*</span></label>
                  <select id="gastoRubro" class="form-select">
                    <option value="">Seleccione...</option>
                    <option value="ALQUILER">Alquiler</option>
                    <option value="SERVICIOS">Servicios (Luz, Gas, Agua)</option>
                    <option value="IMPUESTOS">Impuestos</option>
                    <option value="LIMPIEZA">Limpieza</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INSUMOS">Insumos</option>
                    <option value="TRANSPORTE">Transporte</option>
                    <option value="VARIOS">Varios</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Descripcion <span class="text-danger">*</span></label>
                  <input type="text" id="gastoDescripcion" class="form-control" placeholder="Detalle del gasto...">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Importe <span class="text-danger">*</span></label>
                  <input type="number" id="gastoImporte" class="form-control" step="0.01" min="0" placeholder="0.00">
                </div>
              </div>
              <div class="text-end mt-3">
                <button class="btn btn-primary btn-lg" onclick="ConfirmarGasto()">
                  <i class="bi bi-check-circle me-1"></i>Registrar Gasto
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB: Retiro de Efectivo (Adelanto) -->
        <div class="tab-pane fade" id="tabAdelanto">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Empleado <span class="text-danger">*</span></label>
                  <select id="adelantoEmpleado" class="form-select">
                    <option value="">Cargando...</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Importe <span class="text-danger">*</span></label>
                  <input type="number" id="adelantoImporte" class="form-control" step="0.01" min="0" placeholder="0.00">
                </div>
                <div class="col-md-2">
                  <label class="form-label fw-semibold">Mes imputacion</label>
                  <input type="month" id="adelantoMes" class="form-control" value="${mesActual}">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Observaciones</label>
                  <input type="text" id="adelantoObs" class="form-control" placeholder="Observaciones...">
                </div>
              </div>
              <div class="text-end mt-3">
                <button class="btn btn-warning btn-lg" onclick="ConfirmarAdelanto()">
                  <i class="bi bi-cash me-1"></i>Registrar Retiro
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB: Historial -->
        <div class="tab-pane fade" id="tabHistGastos">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label">Desde</label>
                  <input type="date" id="gastosDesde" class="form-control" value="${Days30AgoISO()}">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <input type="date" id="gastosHasta" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" onclick="BuscarGastos()"><i class="bi bi-search me-1"></i>Buscar</button>
                </div>
              </div>
            </div>
          </div>
          <div id="gastosHistorial"></div>
        </div>
      </div>
    </div>
  `;
  CargarEmpleadosGastos();
}

async function CargarEmpleadosGastos() {
  try {
    const empleados = await API.GetEmpleados();
    const sel = document.getElementById('adelantoEmpleado');
    sel.innerHTML = '<option value="">Seleccione...</option>' +
      empleados.map(e => `<option value="${e.GUID}">${(e.NOMBRE || '').trim()}</option>`).join('');
  } catch (err) {
    ShowToast('Error', 'No se pudieron cargar empleados', 'error');
  }
}

async function ConfirmarGasto() {
  const rubro = document.getElementById('gastoRubro').value;
  const descripcion = (document.getElementById('gastoDescripcion').value || '').trim();
  const importe = parseFloat(document.getElementById('gastoImporte').value) || 0;

  if (!rubro) { ShowToast('Aviso', 'Seleccione un rubro', 'error'); return; }
  if (!descripcion) { ShowToast('Aviso', 'Ingrese una descripcion', 'error'); return; }
  if (importe <= 0) { ShowToast('Aviso', 'El importe debe ser mayor a 0', 'error'); return; }

  try {
    await API.CreateGasto({
      guidSucursal: State.sucursalActual,
      rubro,
      descripcion,
      importe,
      guidUsuario: (State.usuario && State.usuario.GUID) || '',
    });
    ShowToast('Gasto registrado', `${rubro} - $${importe.toFixed(2)}`, 'success');
    document.getElementById('gastoRubro').value = '';
    document.getElementById('gastoDescripcion').value = '';
    document.getElementById('gastoImporte').value = '';
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

async function ConfirmarAdelanto() {
  const guidEmpleado = document.getElementById('adelantoEmpleado').value;
  const importe = parseFloat(document.getElementById('adelantoImporte').value) || 0;
  const mesImputacion = document.getElementById('adelantoMes').value || '';
  const observaciones = (document.getElementById('adelantoObs').value || '').trim();

  if (!guidEmpleado) { ShowToast('Aviso', 'Seleccione un empleado', 'error'); return; }
  if (importe <= 0) { ShowToast('Aviso', 'El importe debe ser mayor a 0', 'error'); return; }

  try {
    const cuentaCaja = GetCuentaCajaSucursal();
    await API.CreateAdelanto({
      guidSucursal: State.sucursalActual,
      guidEmpleado,
      importe,
      observaciones,
      mesImputacion,
      guidBancosCuentas: cuentaCaja ? cuentaCaja.GUID : '',
      guidUsuario: (State.usuario && State.usuario.GUID) || '',
    });
    ShowToast('Retiro registrado', `$${importe.toFixed(2)}`, 'success');
    document.getElementById('adelantoEmpleado').value = '';
    document.getElementById('adelantoImporte').value = '';
    document.getElementById('adelantoObs').value = '';
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

async function BuscarGastos() {
  const desde = document.getElementById('gastosDesde').value;
  const hasta = document.getElementById('gastosHasta').value;
  const div = document.getElementById('gastosHistorial');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';

  try {
    const gastos = await API.GetGastos({ desde, hasta, guidSucursal: State.sucursalActual });
    if (gastos.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron gastos.</div>';
      return;
    }
    let totalGastos = 0;
    gastos.forEach(g => { totalGastos += g.DEBE || 0; });
    div.innerHTML = `
      <div class="alert alert-secondary fw-bold">Total gastos del periodo: $${totalGastos.toFixed(2)}</div>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Tipo</th><th>Rubro</th><th>Descripcion</th><th>Empleado</th><th class="text-end">Importe</th></tr>
            </thead>
            <tbody>
              ${gastos.map(g => `
                <tr>
                  <td>${FormatFechaInt(g.FECHA)}</td>
                  <td><span class="badge bg-${(g.TIPO_COMPROBANTE || '').trim() === 'ADELANTO' ? 'warning' : 'info'}">${(g.TIPO_COMPROBANTE || '').trim()}</span></td>
                  <td>${(g.RUBRO || '').trim()}</td>
                  <td>${(g.DESCRIPCION || '').trim()}</td>
                  <td>${(g.Empleado || '-').trim()}</td>
                  <td class="text-end fw-bold text-danger">$${(g.DEBE || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// ============================================================================
// SECCIÓN: COMPRAS — Proveedores + Remitos de Compra
// ============================================================================

const Compra = {
  items: [],
  proveedorSeleccionado: null,

  Reset() {
    Compra.items = [];
    Compra.proveedorSeleccionado = null;
  },

  async BuscarArticulo(texto) {
    if (!texto) return;
    try {
      let art = null;
      try { art = await API.GetArticuloByCodigo(texto); } catch (_) {}

      if (art) {
        const movs = await API.GetMovimientoArticulos(art.GUID);
        if (movs.length === 0) {
          Compra.AgregarItem(art, null);
        } else {
          RenderTallesCompra(art, movs);
        }
        return;
      }

      const resultados = await API.GetArticulos(texto);
      if (resultados.length === 0) {
        ShowToast('Aviso', 'No se encontraron articulos', 'info');
      } else if (resultados.length === 1) {
        const movs = await API.GetMovimientoArticulos(resultados[0].GUID);
        if (movs.length === 0) {
          Compra.AgregarItem(resultados[0], null);
        } else {
          RenderTallesCompra(resultados[0], movs);
        }
      } else {
        RenderArticulosSugeridosCompra(resultados);
      }
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    }
  },

  async SeleccionarSugerido(guid) {
    try {
      const art = await API.GetArticuloByGuid(guid);
      if (!art) { ShowToast('Aviso', 'Articulo no encontrado', 'error'); return; }
      const movs = await API.GetMovimientoArticulos(guid);
      if (movs.length === 0) {
        Compra.AgregarItem(art, null);
        document.getElementById('compraTallesContainer').innerHTML = '';
      } else {
        RenderTallesCompra(art, movs);
      }
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    }
  },

  AgregarItem(art, mov) {
    const precioInput = document.getElementById('compraPrecio');
    const precio = parseFloat(precioInput ? precioInput.value : 0) || art.PRECIOCOSTO || 0;
    Compra.items.push({
      guidArticulo: art.GUID,
      guidMovimientoArticulo: mov ? mov.GUID : '',
      codigoArticulo: (art.CODIGOARTICULO || '').trim(),
      descripcion: (art.DESCRIPCION || '').trim(),
      talle: mov ? mov.NUMERO : 0,
      color: mov ? (mov.COLOR || '').trim() : '',
      cantidad: 1,
      precioUnitario: precio,
    });
    RenderCompraItems();
    const input = document.getElementById('compraSearch');
    if (input) { input.value = ''; input.focus(); }
    if (precioInput) precioInput.value = '';
  },

  QuitarItem(idx) {
    Compra.items.splice(idx, 1);
    RenderCompraItems();
  },
};

function RenderCompras(container) {
  Compra.Reset();
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-truck me-2"></i>Compras</h4>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabNuevaCompra">Nueva Compra</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabHistCompras">Historial</a></li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="tabNuevaCompra">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <!-- Proveedor -->
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Proveedor <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="text" id="compraProvSearch" class="form-control" placeholder="Buscar proveedor por nombre o CUIT...">
                    <button class="btn btn-outline-primary" onclick="BuscarProveedoresCompra()"><i class="bi bi-search"></i></button>
                  </div>
                  <div id="compraProvLista" class="mt-1"></div>
                  <div id="compraProvSeleccionado" class="mt-2"></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Observaciones</label>
                  <input type="text" id="compraObs" class="form-control" placeholder="Observaciones...">
                </div>
              </div>

              <!-- Articulos -->
              <div class="row g-2 mb-3">
                <div class="col-md-8">
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                    <input type="text" id="compraSearch" class="form-control" placeholder="Escanear o buscar articulo...">
                    <button class="btn btn-primary" onclick="Compra.BuscarArticulo(document.getElementById('compraSearch').value.trim())">
                      <i class="bi bi-plus-circle"></i> Agregar
                    </button>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="input-group">
                    <span class="input-group-text">$ Costo</span>
                    <input type="number" id="compraPrecio" class="form-control" step="0.01" min="0" placeholder="Precio costo">
                  </div>
                </div>
              </div>

              <div id="compraTallesContainer" class="mb-3"></div>

              <table class="table table-hover">
                <thead class="table-light">
                  <tr><th>Codigo</th><th>Descripcion</th><th>Talle</th><th>Color</th><th class="text-center">Cant.</th><th class="text-end">P.Costo</th><th class="text-end">Subtotal</th><th></th></tr>
                </thead>
                <tbody id="compraItemsBody">
                  <tr><td colspan="8" class="text-center text-muted py-3">Sin articulos</td></tr>
                </tbody>
                <tfoot>
                  <tr class="table-success"><th colspan="6" class="text-end">TOTAL:</th><th class="text-end fw-bold" id="compraTotalFooter">$0.00</th><th></th></tr>
                </tfoot>
              </table>

              <div class="text-end">
                <button class="btn btn-success btn-lg" onclick="ConfirmarCompra()">
                  <i class="bi bi-check-circle me-1"></i>Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="tabHistCompras">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label">Desde</label>
                  <input type="date" id="comprasDesde" class="form-control" value="${Days30AgoISO()}">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <input type="date" id="comprasHasta" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" onclick="BuscarCompras()"><i class="bi bi-search me-1"></i>Buscar</button>
                </div>
              </div>
            </div>
          </div>
          <div id="comprasHistorial"></div>
        </div>
      </div>
    </div>
  `;

  const compraInput = document.getElementById('compraSearch');
  compraInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); Compra.BuscarArticulo(e.target.value.trim()); }
  });
  let _compraDebounce;
  compraInput.addEventListener('input', () => {
    clearTimeout(_compraDebounce);
    const texto = compraInput.value.trim();
    if (texto.length < 2) { document.getElementById('compraTallesContainer').innerHTML = ''; return; }
    _compraDebounce = setTimeout(() => Compra.BuscarArticulo(texto), 400);
  });
}

function RenderTallesCompra(art, movs) {
  const container = document.getElementById('compraTallesContainer');
  container.innerHTML = `
    <div class="card p-3 border-success">
      <h6>${(art.DESCRIPCION || '').trim()} — Seleccione talle:</h6>
      <div class="d-flex flex-wrap gap-1">
        ${movs.map(m => `
          <button class="btn btn-outline-success talle-btn" onclick="Compra.AgregarItem(${JSON.stringify(art).replace(/"/g, '&quot;')}, ${JSON.stringify(m).replace(/"/g, '&quot;')}); document.getElementById('compraTallesContainer').innerHTML='';">
            ${m.NUMERO}${m.COLOR ? `<br><small>${(m.COLOR || '').trim()}</small>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function RenderArticulosSugeridosCompra(articulos) {
  const container = document.getElementById('compraTallesContainer');
  const lista = articulos.slice(0, 20);
  container.innerHTML = `
    <div class="card p-3 border-success">
      <h6>Seleccione un articulo (${articulos.length} resultado${articulos.length > 1 ? 's' : ''}):</h6>
      <div class="list-group" style="max-height: 250px; overflow-y: auto;">
        ${lista.map(a => `
          <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onclick="Compra.SeleccionarSugerido('${a.GUID}')">
            <span><code>${(a.CODIGOARTICULOREL || a.CODIGOARTICULO || '').trim()}</code> — ${(a.DESCRIPCION || '').trim()}</span>
            <span class="badge bg-secondary">Costo: $${(a.PRECIOCOSTO || 0).toLocaleString('es-AR')}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function RenderCompraItems() {
  const body = document.getElementById('compraItemsBody');
  if (Compra.items.length === 0) {
    body.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Sin articulos</td></tr>';
    document.getElementById('compraTotalFooter').textContent = '$0.00';
  } else {
    let total = 0;
    body.innerHTML = Compra.items.map((item, i) => {
      const subtotal = item.cantidad * item.precioUnitario;
      total += subtotal;
      return `
        <tr>
          <td><code>${item.codigoArticulo}</code></td>
          <td>${item.descripcion}</td>
          <td>${item.talle || '-'}</td>
          <td>${item.color || '-'}</td>
          <td class="text-center">
            <input type="number" class="form-control form-control-sm qty-input" value="${item.cantidad}" min="1"
              onchange="Compra.items[${i}].cantidad = parseInt(this.value) || 1; RenderCompraItems();">
          </td>
          <td class="text-end">
            <input type="number" class="form-control form-control-sm" value="${item.precioUnitario}" step="0.01" min="0" style="width:100px"
              onchange="Compra.items[${i}].precioUnitario = parseFloat(this.value) || 0; RenderCompraItems();">
          </td>
          <td class="text-end fw-bold">$${subtotal.toFixed(2)}</td>
          <td><button class="btn btn-sm btn-outline-danger" onclick="Compra.QuitarItem(${i})"><i class="bi bi-trash"></i></button></td>
        </tr>
      `;
    }).join('');
    document.getElementById('compraTotalFooter').textContent = `$${total.toFixed(2)}`;
  }
}

async function BuscarProveedoresCompra() {
  const texto = (document.getElementById('compraProvSearch').value || '').trim();
  if (!texto) return;
  try {
    const proveedores = await API.GetProveedores(texto);
    const div = document.getElementById('compraProvLista');
    if (proveedores.length === 0) {
      div.innerHTML = '<small class="text-danger">No se encontraron proveedores</small>';
      return;
    }
    div.innerHTML = `
      <div class="list-group" style="max-height: 200px; overflow-y: auto;">
        ${proveedores.slice(0, 10).map(p => `
          <button class="list-group-item list-group-item-action py-1" onclick="SeleccionarProveedorCompra('${p.GUID}', '${(p.NOMBRE || '').trim().replace(/'/g, "\\'")}', '${(p.CUIT || '').trim()}')">
            <strong>${(p.NOMBRE || '').trim()}</strong> <small class="text-muted">CUIT: ${(p.CUIT || '').trim()}</small>
          </button>
        `).join('')}
      </div>
    `;
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

function SeleccionarProveedorCompra(guid, nombre, cuit) {
  Compra.proveedorSeleccionado = { guid, nombre };
  document.getElementById('compraProvLista').innerHTML = '';
  document.getElementById('compraProvSeleccionado').innerHTML = `
    <div class="alert alert-success py-2 mb-0 d-flex justify-content-between align-items-center">
      <span><i class="bi bi-check-circle me-1"></i><strong>${nombre}</strong> — CUIT: ${cuit}</span>
      <button class="btn btn-sm btn-outline-danger" onclick="Compra.proveedorSeleccionado=null; document.getElementById('compraProvSeleccionado').innerHTML='';">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;
}

async function ConfirmarCompra() {
  if (!Compra.proveedorSeleccionado) { ShowToast('Aviso', 'Seleccione un proveedor', 'error'); return; }
  if (Compra.items.length === 0) { ShowToast('Aviso', 'Agregue al menos un articulo', 'info'); return; }

  try {
    const result = await API.CreateCompra({
      guidProveedor: Compra.proveedorSeleccionado.guid,
      nombreProveedor: Compra.proveedorSeleccionado.nombre,
      guidSucursal: State.sucursalActual,
      items: Compra.items,
      observaciones: (document.getElementById('compraObs').value || '').trim(),
    });
    ShowToast('Compra registrada', `${result.cantidadItems} articulo(s) — Total: $${result.total.toFixed(2)}`, 'success');
    RenderCompras(document.getElementById('mainContent'));
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

async function BuscarCompras() {
  const desde = document.getElementById('comprasDesde').value;
  const hasta = document.getElementById('comprasHasta').value;
  const div = document.getElementById('comprasHistorial');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';

  try {
    const compras = await API.GetCompras({ desde, hasta, guidSucursal: State.sucursalActual });
    if (compras.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron compras.</div>';
      return;
    }
    div.innerHTML = `
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th></th><th>Fecha</th><th>Proveedor</th><th>Observaciones</th><th class="text-end">Total</th></tr>
            </thead>
            <tbody>
              ${compras.map((c, idx) => `
                <tr id="compraRow${idx}">
                  <td><button class="btn btn-sm btn-outline-secondary" onclick="ToggleDetalleCompra('${c.GUID}','compraRow${idx}')"><i class="bi bi-eye"></i></button></td>
                  <td>${FormatFechaInt(c.FECHA)}</td>
                  <td>${(c.Proveedor || c.NOMBRE || '').trim()}</td>
                  <td>${(c.OBSERVACIONES || '').trim()}</td>
                  <td class="text-end fw-bold">${FormatMoney(c.TOTAL)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function ToggleDetalleCompra(guid, rowId) {
  const existing = document.getElementById('detalle-' + rowId);
  if (existing) { existing.remove(); return; }
  const tr = document.getElementById(rowId);
  const colspan = tr.children.length;
  const detailRow = document.createElement('tr');
  detailRow.id = 'detalle-' + rowId;
  detailRow.innerHTML = `<td colspan="${colspan}" class="p-0"><div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div></td>`;
  tr.after(detailRow);
  try {
    const det = await API.GetCompraDetalle(guid);
    detailRow.innerHTML = `
      <td colspan="${colspan}" class="p-0">
        <table class="table table-sm table-bordered mb-0 bg-light">
          <thead><tr class="table-secondary"><th>Codigo</th><th>Descripcion</th><th>Talle</th><th>Color</th><th class="text-center">Cantidad</th></tr></thead>
          <tbody>
            ${det.items.map(i => `
              <tr>
                <td><code>${(i.CODIGOARTICULO || '').trim()}</code></td>
                <td>${(i.DESCRIPCION || '').trim()}</td>
                <td>${i.NUMERO || '-'}</td>
                <td>${(i.COLOR || '').trim() || '-'}</td>
                <td class="text-center">${i.INGRESO}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </td>`;
  } catch (err) {
    detailRow.innerHTML = `<td colspan="${colspan}"><div class="alert alert-danger mb-0 py-1">${err.message}</div></td>`;
  }
}

// ============================================================================
// SECCIÓN: BANCOS — Gestión de Bancos, Cuentas, Conceptos y Homologación
// ============================================================================

function RenderBancos(container) {
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-bank me-2"></i>Bancos</h4>
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabBancos">Bancos</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabCuentas">Cuentas Bancarias</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabConceptos">Conceptos</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabHomologacion">Conceptos por Banco</a></li>
      </ul>
      <div class="tab-content pt-3">
        <div class="tab-pane fade show active" id="tabBancos"><div id="contenidoBancos"></div></div>
        <div class="tab-pane fade" id="tabCuentas"><div id="contenidoCuentas"></div></div>
        <div class="tab-pane fade" id="tabConceptos"><div id="contenidoConceptos"></div></div>
        <div class="tab-pane fade" id="tabHomologacion"><div id="contenidoHomologacion"></div></div>
      </div>
    </div>
  `;
  LoadBancos();

  document.querySelectorAll('#tabBancos, #tabCuentas, #tabConceptos, #tabHomologacion').forEach(tab => {
    const el = document.querySelector(`a[href="#${tab.id}"]`);
    el.addEventListener('shown.bs.tab', () => {
      if (tab.id === 'tabBancos') LoadBancos();
      if (tab.id === 'tabCuentas') LoadBancosCuentas();
      if (tab.id === 'tabConceptos') LoadBancosConceptos();
      if (tab.id === 'tabHomologacion') LoadConceptosPorBanco();
    });
  });
}

// ── Bancos ──────────────────────────────────────────────────────────────────
async function LoadBancos() {
  const div = document.getElementById('contenidoBancos');
  try {
    const bancos = await API.GetBancos();
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted">${bancos.length} banco(s)</span>
        <button class="btn btn-primary btn-sm" onclick="ShowFormBanco()"><i class="bi bi-plus-circle me-1"></i>Nuevo Banco</button>
      </div>
      <div id="formBancoContainer"></div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Banco</th><th>Cuenta N&ordm;</th><th>Tipo Cuenta</th><th>Direcci&oacute;n</th><th>Localidad</th><th>Tel&eacute;fono</th><th class="text-end">Saldo</th><th></th></tr>
        </thead>
        <tbody>
          ${bancos.map(b => `
            <tr>
              <td>${(b.BANCO || '').trim()}</td>
              <td>${(b.CUENTANUMERO || '').trim()}</td>
              <td>${(b.TIPOCUENTA || '').trim()}</td>
              <td>${(b.DIRECCION || '').trim()}</td>
              <td>${(b.LOCALIDAD || '').trim()}</td>
              <td>${(b.TELEFONO || '').trim()}</td>
              <td class="text-end">${FormatMoney(b.SALDO)}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormBanco('${b.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="EliminarBanco('${b.GUID.trim()}')"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function ShowFormBanco(guid) {
  const container = document.getElementById('formBancoContainer');
  let data = { BANCO: '', CUENTANUMERO: '', TIPOCUENTA: '', DIRECCION: '', LOCALIDAD: '', TELEFONO: '' };
  if (guid) {
    try { data = await API.GetBancoByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }
  container.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nuevo'} Banco</h6>
        <div class="row g-2">
          <div class="col-md-3"><label class="form-label">Banco</label><input type="text" class="form-control" id="fBanco" value="${(data.BANCO || '').trim()}"></div>
          <div class="col-md-2"><label class="form-label">Cuenta N&ordm;</label><input type="text" class="form-control" id="fCuentaNumero" value="${(data.CUENTANUMERO || '').trim()}"></div>
          <div class="col-md-2"><label class="form-label">Tipo Cuenta</label><input type="text" class="form-control" id="fTipoCuenta" value="${(data.TIPOCUENTA || '').trim()}"></div>
          <div class="col-md-2"><label class="form-label">Direcci&oacute;n</label><input type="text" class="form-control" id="fDireccion" value="${(data.DIRECCION || '').trim()}"></div>
          <div class="col-md-2"><label class="form-label">Localidad</label><input type="text" class="form-control" id="fLocalidad" value="${(data.LOCALIDAD || '').trim()}"></div>
          <div class="col-md-1"><label class="form-label">Tel</label><input type="text" class="form-control" id="fTelefono" value="${(data.TELEFONO || '').trim()}"></div>
        </div>
        <div class="mt-2">
          <button class="btn btn-success btn-sm" onclick="GuardarBanco('${guid || ''}')"><i class="bi bi-check me-1"></i>Guardar</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formBancoContainer').innerHTML=''">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}

async function GuardarBanco(guid) {
  const payload = {
    banco: document.getElementById('fBanco').value.trim(),
    cuentaNumero: document.getElementById('fCuentaNumero').value.trim(),
    tipoCuenta: document.getElementById('fTipoCuenta').value.trim(),
    direccion: document.getElementById('fDireccion').value.trim(),
    localidad: document.getElementById('fLocalidad').value.trim(),
    telefono: document.getElementById('fTelefono').value.trim(),
  };
  if (!payload.banco) { ShowToast('Error', 'El nombre del banco es obligatorio', 'error'); return; }
  try {
    if (guid) { await API.UpdateBanco(guid, payload); }
    else { await API.CreateBanco(payload); }
    ShowToast('Banco', guid ? 'Actualizado' : 'Creado', 'success');
    LoadBancos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarBanco(guid) {
  if (!confirm('Eliminar este banco?')) return;
  try {
    await API.DeleteBanco(guid);
    ShowToast('Banco', 'Eliminado', 'success');
    LoadBancos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ── Cuentas Bancarias ───────────────────────────────────────────────────────
async function LoadBancosCuentas() {
  const div = document.getElementById('contenidoCuentas');
  try {
    const [cuentas, bancos] = await Promise.all([API.GetBancosCuentas(), API.GetBancos()]);
    const bancosOpts = bancos.map(b => `<option value="${b.GUID.trim()}">${(b.BANCO || '').trim()}</option>`).join('');
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted">${cuentas.length} cuenta(s)</span>
          <select class="form-select form-select-sm" id="filtroBancoCuentas" style="width:200px" onchange="FiltrarCuentas()">
            <option value="">Todos los bancos</option>${bancosOpts}
          </select>
        </div>
        <button class="btn btn-primary btn-sm" id="btnNuevaCuenta" onclick="ShowFormCuenta()"><i class="bi bi-plus-circle me-1"></i>Nueva Cuenta</button>
      </div>
      <div id="formCuentaContainer"></div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Banco</th><th>N&ordm; Cuenta</th><th>Tipo</th><th>CBU</th><th>Alias</th><th>Titular</th><th>Sucursal</th><th class="text-end">Saldo</th><th></th></tr>
        </thead>
        <tbody id="tablaCuentas">
          ${RenderFilasCuentas(cuentas)}
        </tbody>
      </table>
    `;
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

function RenderFilasCuentas(cuentas) {
  return cuentas.map(c => `
    <tr>
      <td>${(c.NombreBanco || '').trim()}</td>
      <td>${(c.NUMEROCUENTA || '').trim()}</td>
      <td>${(c.TIPOCUENTA || '').trim()}</td>
      <td>${(c.CBU || '').trim()}</td>
      <td>${(c.ALIAS || '').trim()}</td>
      <td>${(c.TITULAR || '').trim()}</td>
      <td>${(c.SUCURSAL || '').trim()}</td>
      <td class="text-end">${FormatMoney(c.SALDO)}</td>
      <td>
        <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormCuenta('${c.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-outline-danger btn-sm" onclick="EliminarCuenta('${c.GUID.trim()}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function FiltrarCuentas() {
  const guidBanco = document.getElementById('filtroBancoCuentas').value;
  try {
    const cuentas = await API.GetBancosCuentas(guidBanco || undefined);
    document.getElementById('tablaCuentas').innerHTML = RenderFilasCuentas(cuentas);
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

function HabilitarBtnNuevaCuenta(habilitar) {
  const btn = document.getElementById('btnNuevaCuenta');
  if (btn) btn.disabled = !habilitar;
}

async function ShowFormCuenta(guid) {
  HabilitarBtnNuevaCuenta(false);
  const container = document.getElementById('formCuentaContainer');
  const [bancos, sucursales] = await Promise.all([API.GetBancos(), API.GetSucursales()]);
  let data = { GUIDBANCO: '', TIPOCUENTA: '', NUMEROCUENTA: '', CBU: '', ALIAS: '', DIRECCION: '', SUCURSAL: '', TITULAR: '', GUIDTIPOCUENTABANCO: '' };
  if (guid) {
    try { data = await API.GetBancoCuentaByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }

  const sucOpts = sucursales.map(s => `<option value="${(s.NOMBRE || '').trim()}" ${(s.NOMBRE || '').trim() === (data.SUCURSAL || '').trim() ? 'selected' : ''}>${(s.NOMBRE || '').trim()}</option>`).join('');

  // Determinar si el banco seleccionado es tipo Caja Diaria
  const bancoSel = bancos.find(b => b.GUID.trim() === (data.GUIDBANCO || '').trim());
  const esCajaDiaria = bancoSel && (bancoSel.TIPOCUENTA || '').trim().toUpperCase().startsWith('CAJA');

  container.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nueva'} Cuenta Bancaria</h6>
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label">Banco</label>
            <select class="form-select" id="fcGuidBanco" onchange="OnBancoCuentaChange()">
              <option value="">Seleccionar...</option>
              ${bancos.map(b => `<option value="${b.GUID.trim()}" data-tipocuenta="${(b.TIPOCUENTA || '').trim()}" ${b.GUID.trim() === (data.GUIDBANCO || '').trim() ? 'selected' : ''}>${(b.BANCO || '').trim()}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2"><label class="form-label">Tipo Cuenta</label><input type="text" class="form-control" id="fcTipoCuenta" value="${(data.TIPOCUENTA || '').trim()}"></div>
          <div class="col-md-2"><label class="form-label">N&ordm; Cuenta</label><input type="text" class="form-control" id="fcNumeroCuenta" value="${(data.NUMEROCUENTA || '').trim()}"></div>
          <div class="col-md-3"><label class="form-label">CBU</label><input type="text" class="form-control" id="fcCBU" value="${(data.CBU || '').trim()}" maxlength="22"></div>
          <div class="col-md-2"><label class="form-label">Alias</label><input type="text" class="form-control" id="fcAlias" value="${(data.ALIAS || '').trim()}"></div>
          <div class="col-md-3"><label class="form-label">Titular</label><input type="text" class="form-control" id="fcTitular" value="${(data.TITULAR || '').trim()}"></div>
          <div class="col-md-2" id="fcSucursalContainer">
            <label class="form-label">Sucursal</label>
            ${esCajaDiaria
              ? `<select class="form-select" id="fcSucursal"><option value="">Seleccionar...</option>${sucOpts}</select>`
              : `<input type="text" class="form-control" id="fcSucursal" value="${(data.SUCURSAL || '').trim()}">`}
          </div>
          <div class="col-md-3"><label class="form-label">Direcci&oacute;n</label><input type="text" class="form-control" id="fcDireccion" value="${(data.DIRECCION || '').trim()}"></div>
        </div>
        <div class="mt-2">
          <button class="btn btn-success btn-sm" onclick="GuardarCuenta('${guid || ''}')"><i class="bi bi-check me-1"></i>Guardar</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formCuentaContainer').innerHTML=''; HabilitarBtnNuevaCuenta(true);">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}

async function OnBancoCuentaChange() {
  const sel = document.getElementById('fcGuidBanco');
  const opt = sel.options[sel.selectedIndex];
  const tipoCuenta = (opt.dataset.tipocuenta || '').toUpperCase();
  const container = document.getElementById('fcSucursalContainer');
  const valorActual = document.getElementById('fcSucursal') ? document.getElementById('fcSucursal').value : '';

  if (tipoCuenta.startsWith('CAJA')) {
    const sucursales = await API.GetSucursales();
    const sucOpts = sucursales.map(s => `<option value="${(s.NOMBRE || '').trim()}" ${(s.NOMBRE || '').trim() === valorActual ? 'selected' : ''}>${(s.NOMBRE || '').trim()}</option>`).join('');
    container.innerHTML = `<label class="form-label">Sucursal</label><select class="form-select" id="fcSucursal"><option value="">Seleccionar...</option>${sucOpts}</select>`;
  } else {
    container.innerHTML = `<label class="form-label">Sucursal</label><input type="text" class="form-control" id="fcSucursal" value="${valorActual}">`;
  }
}

async function GuardarCuenta(guid) {
  const payload = {
    guidBanco: document.getElementById('fcGuidBanco').value,
    tipoCuenta: document.getElementById('fcTipoCuenta').value.trim(),
    numeroCuenta: document.getElementById('fcNumeroCuenta').value.trim(),
    cbu: document.getElementById('fcCBU').value.trim(),
    alias: document.getElementById('fcAlias').value.trim(),
    titular: document.getElementById('fcTitular').value.trim(),
    sucursal: document.getElementById('fcSucursal').value.trim(),
    direccion: document.getElementById('fcDireccion').value.trim(),
  };
  if (!payload.guidBanco) { ShowToast('Error', 'Seleccione un banco', 'error'); return; }
  try {
    if (guid) { await API.UpdateBancoCuenta(guid, payload); }
    else { await API.CreateBancoCuenta(payload); }
    ShowToast('Cuenta', guid ? 'Actualizada' : 'Creada', 'success');
    LoadBancosCuentas();
  } catch (err) {
    ShowToast('Error', err.message, 'error');
    HabilitarBtnNuevaCuenta(true);
  }
}

async function EliminarCuenta(guid) {
  if (!confirm('Eliminar esta cuenta bancaria?')) return;
  try {
    await API.DeleteBancoCuenta(guid);
    ShowToast('Cuenta', 'Eliminada', 'success');
    LoadBancosCuentas();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ── Conceptos Bancarios ─────────────────────────────────────────────────────
async function LoadBancosConceptos() {
  const div = document.getElementById('contenidoConceptos');
  try {
    const conceptos = await API.GetBancosConceptos();
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted">${conceptos.length} concepto(s)</span>
        <button class="btn btn-primary btn-sm" onclick="ShowFormConcepto()"><i class="bi bi-plus-circle me-1"></i>Nuevo Concepto</button>
      </div>
      <div id="formConceptoContainer"></div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Descripci&oacute;n</th><th>Tipo</th><th></th></tr>
        </thead>
        <tbody>
          ${conceptos.map(c => `
            <tr>
              <td>${(c.DESCRIPCION || '').trim()}</td>
              <td>${(c.TIPOCONCEPTO || '').trim()}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormConcepto('${c.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="EliminarConcepto('${c.GUID.trim()}')"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function ShowFormConcepto(guid) {
  const container = document.getElementById('formConceptoContainer');
  let data = { DESCRIPCION: '', TIPOCONCEPTO: '' };
  if (guid) {
    try { data = await API.GetBancoConceptoByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }
  container.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nuevo'} Concepto Bancario</h6>
        <div class="row g-2">
          <div class="col-md-5"><label class="form-label">Descripci&oacute;n</label><input type="text" class="form-control" id="fcoDescripcion" value="${(data.DESCRIPCION || '').trim()}"></div>
          <div class="col-md-3"><label class="form-label">Tipo Concepto</label><input type="text" class="form-control" id="fcoTipoConcepto" value="${(data.TIPOCONCEPTO || '').trim()}"></div>
        </div>
        <div class="mt-2">
          <button class="btn btn-success btn-sm" onclick="GuardarConcepto('${guid || ''}')"><i class="bi bi-check me-1"></i>Guardar</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formConceptoContainer').innerHTML=''">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}

async function GuardarConcepto(guid) {
  const payload = {
    descripcion: document.getElementById('fcoDescripcion').value.trim(),
    tipoConcepto: document.getElementById('fcoTipoConcepto').value.trim(),
  };
  if (!payload.descripcion) { ShowToast('Error', 'La descripcion es obligatoria', 'error'); return; }
  try {
    if (guid) { await API.UpdateBancoConcepto(guid, payload); }
    else { await API.CreateBancoConcepto(payload); }
    ShowToast('Concepto', guid ? 'Actualizado' : 'Creado', 'success');
    LoadBancosConceptos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarConcepto(guid) {
  if (!confirm('Eliminar este concepto?')) return;
  try {
    await API.DeleteBancoConcepto(guid);
    ShowToast('Concepto', 'Eliminado', 'success');
    LoadBancosConceptos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ── Conceptos por Banco (Homologación) ──────────────────────────────────────
async function LoadConceptosPorBanco() {
  const div = document.getElementById('contenidoHomologacion');
  try {
    const [items, bancos, conceptos] = await Promise.all([
      API.GetConceptosPorBanco(), API.GetBancos(), API.GetBancosConceptos()
    ]);
    const bancosOpts = bancos.map(b => `<option value="${b.GUID.trim()}">${(b.BANCO || '').trim()}</option>`).join('');
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted">${items.length} homologaci&oacute;n(es)</span>
          <select class="form-select form-select-sm" id="filtroBancoHomolog" style="width:200px" onchange="FiltrarHomologacion()">
            <option value="">Todos los bancos</option>${bancosOpts}
          </select>
        </div>
        <button class="btn btn-primary btn-sm" onclick="ShowFormHomologacion()"><i class="bi bi-plus-circle me-1"></i>Nueva Homologaci&oacute;n</button>
      </div>
      <div id="formHomologacionContainer"></div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Banco</th><th>Concepto</th><th>C&oacute;digo seg&uacute;n Banco</th><th>Descripci&oacute;n seg&uacute;n Banco</th><th></th></tr>
        </thead>
        <tbody id="tablaHomologacion">
          ${RenderFilasHomologacion(items)}
        </tbody>
      </table>
    `;
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

function RenderFilasHomologacion(items) {
  return items.map(i => `
    <tr>
      <td>${(i.NombreBanco || '').trim()}</td>
      <td>${(i.ConceptoDescripcion || '').trim()}</td>
      <td>${(i.CODIGOCONCEPTOSEGUNBANCO || '').trim()}</td>
      <td>${(i.DESCRIPCIONSEGUNBANCO || '').trim()}</td>
      <td>
        <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormHomologacion('${i.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-outline-danger btn-sm" onclick="EliminarHomologacion('${i.GUID.trim()}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function FiltrarHomologacion() {
  const guidBanco = document.getElementById('filtroBancoHomolog').value;
  try {
    const items = await API.GetConceptosPorBanco(guidBanco || undefined);
    document.getElementById('tablaHomologacion').innerHTML = RenderFilasHomologacion(items);
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function ShowFormHomologacion(guid) {
  const container = document.getElementById('formHomologacionContainer');
  const [bancos, conceptos] = await Promise.all([API.GetBancos(), API.GetBancosConceptos()]);
  let data = { GUIDBANCO: '', GUIDCONCEPTOBANCO: '', CODIGOCONCEPTOSEGUNBANCO: '', DESCRIPCIONSEGUNBANCO: '' };
  if (guid) {
    try { data = await API.GetConceptoPorBancoByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }
  container.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nueva'} Homologaci&oacute;n</h6>
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label">Banco</label>
            <select class="form-select" id="fhGuidBanco">
              <option value="">Seleccionar...</option>
              ${bancos.map(b => `<option value="${b.GUID.trim()}" ${b.GUID.trim() === (data.GUIDBANCO || '').trim() ? 'selected' : ''}>${(b.BANCO || '').trim()}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Concepto</label>
            <select class="form-select" id="fhGuidConcepto">
              <option value="">Seleccionar...</option>
              ${conceptos.map(c => `<option value="${c.GUID.trim()}" ${c.GUID.trim() === (data.GUIDCONCEPTOBANCO || '').trim() ? 'selected' : ''}>${(c.DESCRIPCION || '').trim()}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3"><label class="form-label">C&oacute;digo seg&uacute;n Banco</label><input type="text" class="form-control" id="fhCodigo" value="${(data.CODIGOCONCEPTOSEGUNBANCO || '').trim()}"></div>
          <div class="col-md-3"><label class="form-label">Descripci&oacute;n seg&uacute;n Banco</label><input type="text" class="form-control" id="fhDescripcion" value="${(data.DESCRIPCIONSEGUNBANCO || '').trim()}"></div>
        </div>
        <div class="mt-2">
          <button class="btn btn-success btn-sm" onclick="GuardarHomologacion('${guid || ''}')"><i class="bi bi-check me-1"></i>Guardar</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formHomologacionContainer').innerHTML=''">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}

async function GuardarHomologacion(guid) {
  const payload = {
    guidBanco: document.getElementById('fhGuidBanco').value,
    guidConceptoBanco: document.getElementById('fhGuidConcepto').value,
    codigoConceptoSegunBanco: document.getElementById('fhCodigo').value.trim(),
    descripcionSegunBanco: document.getElementById('fhDescripcion').value.trim(),
  };
  if (!payload.guidBanco || !payload.guidConceptoBanco) { ShowToast('Error', 'Banco y concepto son obligatorios', 'error'); return; }
  try {
    if (guid) { await API.UpdateConceptoPorBanco(guid, payload); }
    else { await API.CreateConceptoPorBanco(payload); }
    ShowToast('Homologacion', guid ? 'Actualizada' : 'Creada', 'success');
    LoadConceptosPorBanco();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarHomologacion(guid) {
  if (!confirm('Eliminar esta homologacion?')) return;
  try {
    await API.DeleteConceptoPorBanco(guid);
    ShowToast('Homologacion', 'Eliminada', 'success');
    LoadConceptosPorBanco();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}
