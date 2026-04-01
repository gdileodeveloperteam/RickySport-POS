/* ============================================================================
   RickySport POS — Main Application
   SPA vanilla JS con Bootstrap 5
   ============================================================================ */

const GUID_CONSUMIDOR_FINAL = '68BKEFZLUAPRY0XN';

// ── Estado global ──────────────────────────────────────────────────────────────
const State = {
  sucursales: [],
  vendedores: [],
  tcPagos: [],
  tiposCobrosPagos: [],
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
  // Clarion date: backend almacena floor((date - 1800-12-28) / MS_PER_DAY), +1 para corregir base-0
  const base = new Date(1800, 11, 28);
  base.setDate(base.getDate() + f + 1);
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
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function Days30AgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

      // Colapsar filas auxiliares (planes, detalles) antes de ordenar — solo hijos directos
      tbody.querySelectorAll(':scope > tr[id^="planesRow_"]').forEach(r => r.classList.add('d-none'));

      // Solo ordenar filas de datos directas del tbody (excluir filas de planes y filas de tablas anidadas)
      const rows = Array.from(tbody.querySelectorAll(':scope > tr')).filter(r => !r.id || !r.id.startsWith('planesRow_'));
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

      // Re-insertar cada fila de datos seguida de su fila de planes asociada
      rows.forEach(r => {
        tbody.appendChild(r);
        const dataGuid = r.querySelector('button[onclick*="TogglePlanes"]');
        if (dataGuid) {
          const guid = dataGuid.getAttribute('onclick').match(/'([^']+)'/)?.[1];
          if (guid) {
            const planesRow = document.getElementById('planesRow_' + guid);
            if (planesRow) tbody.appendChild(planesRow);
          }
        }
      });
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

  // Limpiar modo cobro deuda al cerrar modal de pagos
  document.getElementById('modalPagos').addEventListener('hidden.bs.modal', () => {
    if (POS._modoCobroDeuda) {
      POS._modoCobroDeuda = false;
      POS._cobroDeudaData = null;
      POS.pagos = [];
      POS._totalConRecargo = 0;
    }
  });
});

async function InitApp() {
  try {
    const [sucursales, vendedores, tcPagos, tiposCobrosPagos] = await Promise.all([
      API.GetSucursales(),
      API.GetVendedores(),
      API.GetTCPagos(),
      API.GetTiposCobrosPagos(),
    ]);

    // BancosCuentas se carga aparte para no bloquear si falla
    let bancosCuentas = [];
    try { bancosCuentas = await API.GetBancosCuentas(); } catch (e) {
      console.warn('No se pudieron cargar cuentas bancarias:', e.message);
    }
    State.sucursales = sucursales;
    State.vendedores = vendedores;
    State.tcPagos = tcPagos;
    State.tiposCobrosPagos = tiposCobrosPagos;
    State.bancosCuentas = bancosCuentas;

    // Mostrar sucursal asignada al usuario como etiqueta (no editable)
    const guidSucUsuario = (State.usuario.GUIDSUCURSALES || '').trim();
    const sucUsuario = sucursales.find(s => s.GUID.trim() === guidSucUsuario);
    const labelSuc = document.getElementById('labelSucursal');
    if (sucUsuario) {
      State.sucursalActual = sucUsuario.GUID;
      labelSuc.textContent = (sucUsuario.NOMBRE || '').trim();
    } else if (sucursales.length > 0) {
      State.sucursalActual = sucursales[0].GUID;
      labelSuc.textContent = (sucursales[0].NOMBRE || '').trim();
    }

    document.getElementById('navUsuarioNombre').textContent = (State.usuario.NOMBRE || '').trim();

    // Mostrar menu Usuarios solo para admin (CODIGOUSUARIO=1, ID=AJE)
    const esAdmin = State.usuario.CODIGOUSUARIO === 1 && (State.usuario.ID || '').trim() === 'AJE';
    document.getElementById('navUsuarios').classList.toggle('d-none', !esAdmin);
    document.getElementById('navSucursales').classList.toggle('d-none', !esAdmin);

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
    State.tiposCobrosPagos = [];
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
      case 'cajadiaria': RenderCajaDiaria(main); break;
      case 'clientes': RenderClientes(main); break;
      case 'empleados': RenderEmpleados(main); break;
      case 'bancos': RenderBancos(main); break;
      case 'sucursales': RenderSucursales(main); break;
      case 'usuarios': RenderUsuarios(main); break;
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
  _totalConRecargo: 0,

  Reset() {
    POS.items = [];
    POS.pagos = [];
    POS.cliente = null;
    POS.vendedor = null;
    POS._totalConRecargo = 0;
    POS.emitirFactura = false;
    POS._modoCobroDeuda = false;
    POS._cobroDeudaData = null;
    POS._cfEmail = null;
    POS._cfCelular = null;
  },

  GetTotal() {
    return POS.items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);
  },

  GetTotalPagos() {
    return POS.pagos.reduce((sum, p) => sum + p.importe, 0);
  },

  async BuscarArticulo(texto) {
    if (!texto) return;

    // Detectar QR de comprobante de devolución: {"g":"...","f":"...","m":...}
    if (texto.startsWith('{') && texto.includes('"g"')) {
      try {
        const qr = JSON.parse(texto);
        if (qr.g) {
          document.getElementById('posSearch').value = '';
          await AplicarCreditoDesdeQR(qr.g);
          return;
        }
      } catch (_) {} // No es JSON válido, continuar con búsqueda normal
    }

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
    POS._resetTipoPago = true;
    POS._cfEmail = null;
    POS._cfCelular = null;
    RenderPagosModal();
    new bootstrap.Modal(document.getElementById('modalPagos')).show();
  },

  emitirFactura: false,

  RequiereCliente() {
    return POS.pagos.some(p => !p._esEfectivo);
  },

  RequiereFactura() {
    // No requerir factura si cobro deuda y todos los comprobantes ya tienen factura fiscal
    if (POS._modoCobroDeuda && POS._cobroDeudaData && POS._cobroDeudaData.todosConFactura) return false;
    return POS.pagos.some(p => !p._esEfectivo && !p._esCtaCte && !p._esCreditoDev);
  },

  SoloEfectivoOCtaCte() {
    return POS.pagos.length > 0 && POS.pagos.every(p => p._esEfectivo || p._esCtaCte || p._esCreditoDev);
  },

  OnTipoPagoChange() {
    // Reset cascada al cambiar tipo cobro/pago
    document.getElementById('pagoComprobante').innerHTML = '';
    document.getElementById('pagoPlan').innerHTML = '';
    document.getElementById('divRecargoInfo').classList.add('d-none');

    const tipoSel = GetTipoCobroPagoSel();
    const desc = tipoSel ? (tipoSel.DESCRIPCION || '').trim().toUpperCase() : '';
    const tipoNum = tipoSel ? tipoSel.TIPO : 0;

    // Cheque 3ros: mostrar/ocultar campos
    const esCheque3ro = desc.indexOf('CHEQUE') >= 0 && desc.indexOf('3') >= 0;
    const divCheque = document.getElementById('cheque3rosFields');
    if (divCheque) { esCheque3ro ? divCheque.classList.remove('d-none') : divCheque.classList.add('d-none'); }

    // Tarjeta Debito (2) / Credito (3): mostrar/ocultar campos
    const esTarjeta = tipoNum === 2 || tipoNum === 3;
    const divTarjeta = document.getElementById('tarjetaFields');
    if (divTarjeta) {
      if (esTarjeta) {
        divTarjeta.classList.remove('d-none');
        // Auto-completar titular con nombre del cliente
        const chk = document.getElementById('tarjetaMismoTitular');
        if (chk) { chk.checked = true; ToggleTitularTarjeta(); }
      } else {
        divTarjeta.classList.add('d-none');
      }
    }

    // Cuenta bancaria: mostrar para Transferencia (4) y Deposito Bancario (8)
    const requiereCuentaBancaria = tipoNum === 4 || tipoNum === 8;
    const divCuentaBancaria = document.getElementById('divCuentaBancaria');
    const selCuentaBancaria = document.getElementById('pagoCuentaBancaria');
    if (divCuentaBancaria && selCuentaBancaria) {
      if (requiereCuentaBancaria) {
        divCuentaBancaria.classList.remove('d-none');
        // Poblar con cuentas bancarias (excluir CAJA FISICA)
        const cuentasBanco = State.bancosCuentas.filter(c =>
          !(c.TIPOCUENTA || '').trim().toUpperCase().startsWith('CAJA')
        );
        selCuentaBancaria.innerHTML = '<option value="">-- Seleccione cuenta --</option>'
          + cuentasBanco.map(c => {
            const nombre = (c.NUMEROCUENTA || c.ALIAS || '').trim();
            const tipo = (c.TIPOCUENTA || '').trim();
            const banco = (c.NombreBanco || '').trim();
            return `<option value="${c.GUID.trim()}" data-guidbancos="${(c.GUIDBANCOS || '').trim()}">${banco ? banco + ' - ' : ''}${nombre} (${tipo})</option>`;
          }).join('');
      } else {
        divCuentaBancaria.classList.add('d-none');
        selCuentaBancaria.innerHTML = '';
      }
    }

    RenderPagosModal();
  },

  OnComprobanteChange() {
    document.getElementById('pagoPlan').innerHTML = '';
    RenderPagosModal();
  },

  OnPlanChange() {
    const baseTotal = POS._cambioData && POS._cambioData.diferencia > 0 ? POS._cambioData.diferencia : POS.GetTotal();
    AplicarRecargo(baseTotal);
  },

  AgregarPago() {
    const tipoSel = GetTipoCobroPagoSel();
    if (!tipoSel) { ShowToast('Aviso', 'Seleccione un tipo de pago', 'info'); return; }

    const tipoMov = (tipoSel.TIPOMOVIMIENTO || '').trim();
    const tipoDescrip = (tipoSel.DESCRIPCION || '').trim();
    const esEfectivo = tipoDescrip.toUpperCase() === 'EFECTIVO';
    const esCtaCte = tipoMov === 'X';
    const esCreditoDev = tipoSel ? tipoSel.TIPO === 9 : false;
    const esCheque3ro = tipoDescrip.toUpperCase().indexOf('CHEQUE') >= 0 && tipoDescrip.toUpperCase().indexOf('3') >= 0;

    const compSel = GetComprobanteSel();
    const selComp = document.getElementById('pagoComprobante');
    // Si hay comprobantes disponibles, obligar a seleccionar uno
    if (selComp.options.length > 1 && !compSel) {
      ShowToast('Aviso', 'Seleccione un comprobante de pago', 'info');
      return;
    }

    const importe = parseFloat(document.getElementById('pagoImporte').value) || 0;
    if (importe <= 0) { ShowToast('Aviso', 'Ingrese un importe válido', 'info'); return; }

    const restante = GetTotalACobrar() - POS.GetTotalPagos();
    if (importe > restante + 0.01) {
      ShowToast('Aviso', 'El importe excede el restante', 'info');
      return;
    }

    if (esCtaCte && !POS.cliente) {
      ShowToast('Aviso', 'Seleccione un cliente para Cuenta Corriente', 'info');
      return;
    }

    if (esCreditoDev && !POS.cliente) {
      ShowToast('Aviso', 'Seleccione un cliente para usar Credito de Devolucion', 'info');
      return;
    }

    if (esCreditoDev) {
      const selCredito = document.getElementById('pagoCreditoDev');
      if (!selCredito || !selCredito.value) {
        ShowToast('Aviso', 'Seleccione un credito de devolucion', 'info');
        return;
      }
      const creditoData = JSON.parse(selCredito.value);
      if (importe > creditoData.disponible + 0.01) {
        ShowToast('Aviso', `El importe excede el credito disponible (${FormatMoney(creditoData.disponible)})`, 'info');
        return;
      }
    }

    // Validación cuenta bancaria para Transferencia (4) y Deposito Bancario (8)
    const requiereCuentaBancaria = tipoSel.TIPO === 4 || tipoSel.TIPO === 8;
    if (requiereCuentaBancaria) {
      const selCuenta = document.getElementById('pagoCuentaBancaria');
      if (!selCuenta || !selCuenta.value) {
        ShowToast('Aviso', 'Seleccione la cuenta bancaria de destino', 'info');
        return;
      }
    }

    // Validación cheque 3ros
    if (esCheque3ro) {
      const chqNum = parseInt(document.getElementById('chequeNumero').value) || 0;
      const chqFecha = (document.getElementById('chequeFechaVencimiento').value || '').trim();
      if (!chqNum) { ShowToast('Aviso', 'Ingrese el número de cheque', 'info'); return; }
      if (!chqFecha) { ShowToast('Aviso', 'Ingrese la fecha de vencimiento del cheque', 'info'); return; }
    }

    // Validación tarjeta debito/credito
    const esTarjeta = tipoSel.TIPO === 2 || tipoSel.TIPO === 3;
    if (esTarjeta) {
      const titular = (document.getElementById('tarjetaNombreTitular').value || '').trim();
      const tarjNum = (document.getElementById('tarjetaNumero').value || '').trim();
      const lote = (document.getElementById('tarjetaLote').value || '').trim();
      const cupon = (document.getElementById('tarjetaCuponNumero').value || '').trim();
      if (!titular) { ShowToast('Aviso', 'Ingrese el nombre del titular de la tarjeta', 'info'); return; }
      if (!tarjNum) { ShowToast('Aviso', 'Ingrese el número de tarjeta', 'info'); return; }
      if (!lote) { ShowToast('Aviso', 'Ingrese el lote', 'info'); return; }
      if (isNaN(lote) || parseInt(lote) > 9999 || parseInt(lote) < 0) { ShowToast('Aviso', 'El lote debe ser un numero de hasta 4 digitos', 'info'); return; }
      if (!cupon) { ShowToast('Aviso', 'Ingrese el número de cupón', 'info'); return; }
    }

    let descripcion = tipoDescrip;
    if (compSel) descripcion = (compSel.TIPO_COMPROBANTE || '').trim();

    const pago = { tipo: tipoSel.GUID.trim(), tipoNombre: tipoDescrip, importe, descripcion, guidBanco: '', guidBancosCuentas: '', _esEfectivo: esEfectivo, _esCtaCte: esCtaCte, _esCreditoDev: esCreditoDev, _esCheque3ro: esCheque3ro, _esTarjeta: esTarjeta };

    if (compSel) {
      pago.guidComprobante = compSel.GUID.trim();
    }

    // Auto-asignar cuenta caja para EFECTIVO
    if (esEfectivo) {
      const cuentaCaja = GetCuentaCajaSucursal();
      if (cuentaCaja) {
        pago.guidBancosCuentas = cuentaCaja.GUID.trim();
        pago.guidBanco = (cuentaCaja.GUIDBANCOS || '').trim();
      }
    }

    // Asignar cuenta bancaria para Transferencia / Deposito Bancario
    if (requiereCuentaBancaria) {
      const selCuenta = document.getElementById('pagoCuentaBancaria');
      const opt = selCuenta.options[selCuenta.selectedIndex];
      pago.guidBancosCuentas = selCuenta.value.trim();
      pago.guidBanco = (opt.dataset.guidbancos || '').trim();
    }

    // Planes
    const selPlan = document.getElementById('pagoPlan');
    if (selPlan.value) {
      const planData = JSON.parse(selPlan.value);
      pago.cuotas = planData.cuotas;
      pago.interes = planData.interes;
      pago.coeficiente = planData.coeficiente;
      pago.descripcion += ` ${planData.cuotas} cuotas`;
    }

    if (esCreditoDev) {
      const selCredito = document.getElementById('pagoCreditoDev');
      const creditoData = JSON.parse(selCredito.value);
      pago.guidCreditoDevolucion = creditoData.guid;
      pago.descripcion = `Credito Dev. (${FormatMoney(creditoData.disponible)})`;
    }

    // Datos del cheque de terceros
    if (esCheque3ro) {
      pago.chequeNumero = parseInt(document.getElementById('chequeNumero').value) || 0;
      pago.chequeTitular = (document.getElementById('chequeTitular').value || '').trim();
      pago.chequeCuitTitular = (document.getElementById('chequeCuitTitular').value || '').trim();
      pago.chequeBancoEmisor = (document.getElementById('chequeBancoEmisor').value || '').trim();
      pago.chequeCuentaNumero = (document.getElementById('chequeCuentaNumero').value || '').trim();
      pago.chequeFechaVencimiento = (document.getElementById('chequeFechaVencimiento').value || '').trim();
      document.getElementById('chequeNumero').value = '';
      document.getElementById('chequeTitular').value = '';
      document.getElementById('chequeCuitTitular').value = '';
      document.getElementById('chequeBancoEmisor').value = '';
      document.getElementById('chequeCuentaNumero').value = '';
      document.getElementById('chequeFechaVencimiento').value = '';
    }

    // Datos de tarjeta debito/credito
    if (esTarjeta) {
      pago.tarjetaNombreTitular = (document.getElementById('tarjetaNombreTitular').value || '').trim();
      pago.tarjetaNumero = (document.getElementById('tarjetaNumero').value || '').trim();
      pago.tarjetaLote = (document.getElementById('tarjetaLote').value || '').trim();
      pago.tarjetaCuponNumero = (document.getElementById('tarjetaCuponNumero').value || '').trim();
      pago.descripcion += ` - ${pago.tarjetaNombreTitular} *${pago.tarjetaNumero}`;
      // Limpiar campos tarjeta
      document.getElementById('tarjetaNumero').value = '';
      document.getElementById('tarjetaLote').value = '';
      document.getElementById('tarjetaCuponNumero').value = '';
    }

    POS.pagos.push(pago);
    document.getElementById('pagoImporte').value = '';

    // Crédito devolución que cubre el total: no se necesita pago adicional

    // Si el pago requiere factura, activarla automáticamente
    if (!esEfectivo && !esCtaCte && !esCreditoDev) {
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
      const resp = await API.GetClientes('CONSUMIDOR FINAL');
      const clientes = resp.data || resp;
      const cf = clientes.find(c => (c.DOCUMENTO || '').trim() === '0');
      if (cf) {
        POS.cliente = cf;
      }
    } catch (_) {}
    POS.emitirFactura = true;
    RenderPagosModal();
  },

  async ConfirmarVenta() {
    // Si estamos en modo cobro de deuda ctacte
    if (POS._modoCobroDeuda && POS._cobroDeudaData) {
      const totalACobrar = GetTotalACobrar();
      const totalPagos = POS.GetTotalPagos();
      if (Math.abs(totalACobrar - totalPagos) > 0.01) {
        ShowToast('Aviso', 'El total de pagos no coincide con el importe a cobrar', 'info');
        return;
      }
      const btn = document.getElementById('btnConfirmarVenta');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Procesando cobro...';
      try {
        bootstrap.Modal.getInstance(document.getElementById('modalPagos')).hide();
        await ConfirmarCobroDeuda();
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar Venta';
      }
      return;
    }

    // Si estamos en modo cambio con diferencia, redirigir a ConfirmarCambioConVenta
    if (POS._cambioData && POS._cambioData.diferencia > 0) {
      const totalACobrar = GetTotalACobrar();
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

    const total = GetTotalACobrar();
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
    const pagoCtaCte = POS.pagos.find(p => p._esCtaCte);
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
        guidCliente: POS.cliente ? POS.cliente.GUID : GUID_CONSUMIDOR_FINAL,
        guidSucursal: State.sucursalActual,
        guidVendedor: POS.vendedor || null,
        guidUsuario: (State.usuario && State.usuario.GUID) || '',
        nombre: POS.cliente ? (POS.cliente.NOMBRE || '').trim() : 'CONSUMIDOR FINAL',
        cuit: POS.cliente ? (POS.cliente.CUIT || '').trim() : '',
        tipoOperacion: 'VENTA',
        items: POS.items,
        pagos: POS.pagos,
        emitirFactura: POS.emitirFactura,
        emailContacto: POS.cliente ? (POS.cliente.EMAIL || '').trim() : (POS._cfEmail || ''),
        celularContacto: POS.cliente ? (POS.cliente.CELULAR || '').trim() : (POS._cfCelular || ''),
      };
      const result = await API.CreateVenta(data);
      bootstrap.Modal.getInstance(document.getElementById('modalPagos')).hide();

      let msg = `Total: ${FormatMoney(result.total)}`;
      if (result.factura) msg += ` | Factura: ${result.factura}`;

      ShowToast('Venta exitosa', msg, 'success');
      POS.Reset();
      RenderPOS(document.getElementById('mainContent'));

      // Si se emitió factura, mostrar el comprobante
      if (result.guidFactura) {
        MostrarFactura(result.guidFactura);
      }
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar Venta';
    }
  },

  SeleccionarCliente(cliente) {
    if (ClienteRequiereContacto(cliente)) {
      MostrarFormContactoCliente(cliente, (cliActualizado) => {
        POS.SeleccionarCliente(cliActualizado);
      });
      return;
    }
    POS.cliente = cliente;
    bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
    const el = document.getElementById('posClienteInfo');
    if (el) {
      el.innerHTML = `
        <span class="badge bg-primary badge-lg me-2"><i class="bi bi-person-fill me-1"></i>${(cliente.NOMBRE || '').trim()}</span>
        <small class="text-muted">CUIT: ${(cliente.CUIT || '').trim()} | Saldo: ${FormatMoney(cliente.SALDO)}</small>
        <button class="btn btn-sm btn-outline-danger ms-2" onclick="POS.cliente = null; document.getElementById('posClienteInfo').innerHTML = '<em class=\\'text-muted\\'>Consumidor Final</em>'; ToggleTitularTarjeta();">
          <i class="bi bi-x"></i>
        </button>
      `;
    }
    ToggleTitularTarjeta();
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
    const movs = await API.GetMovimientoArticulos((art.GUID || '').trim());
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
  if (POS._totalConRecargo > 0) return POS._totalConRecargo;
  if (POS._modoCobroDeuda && POS._cobroDeudaData) return POS._cobroDeudaData.total;
  if (POS._cambioData && POS._cambioData.diferencia > 0) return POS._cambioData.diferencia;
  return POS.GetTotal();
}

function ToggleTitularTarjeta() {
  const chk = document.getElementById('tarjetaMismoTitular');
  const input = document.getElementById('tarjetaNombreTitular');
  if (!chk || !input) return;
  if (chk.checked && POS.cliente) {
    input.value = (POS.cliente.NOMBRE || '').trim();
    input.readOnly = true;
  } else {
    input.value = '';
    input.readOnly = false;
    input.focus();
  }
}

function GetTipoCobroPagoSel() {
  const sel = document.getElementById('pagoTipo');
  if (!sel.value) return null;
  return State.tiposCobrosPagos.find(t => t.GUID.trim() === sel.value) || null;
}

function GetComprobanteSel() {
  const sel = document.getElementById('pagoComprobante');
  if (!sel || !sel.value) return null;
  return State.tcPagos.find(t => t.GUID.trim() === sel.value) || null;
}

function AplicarRecargo(totalBase) {
  const div = document.getElementById('divRecargoInfo');
  const compSel = GetComprobanteSel();
  const selPlan = document.getElementById('pagoPlan');
  let interes = 0;
  let coeficiente = 0;
  let origen = '';

  // Plan tiene prioridad sobre comprobante
  if (selPlan && selPlan.value) {
    try {
      const planData = JSON.parse(selPlan.value);
      interes = planData.interes || 0;
      coeficiente = planData.coeficiente || 0;
      origen = 'plan';
    } catch (_) {}
  } else if (compSel) {
    interes = compSel.INTERES || 0;
    coeficiente = compSel.COEFICIENTE || 0;
    origen = 'comprobante';
  }

  const totalPagos = POS.GetTotalPagos();
  // Lo que falta pagar SIN recargo
  const restanteBase = totalBase - totalPagos;

  // Mostrar siempre si hay comprobante o plan seleccionado
  if (compSel || origen === 'plan') {
    // Calcular recargo solo sobre el restante (lo que falta pagar), no sobre el total completo
    let restanteConRecargo = restanteBase;
    if (coeficiente > 0 && coeficiente !== 1) {
      restanteConRecargo = restanteBase / coeficiente;
    } else if (interes > 0) {
      restanteConRecargo = restanteBase * (1 + interes / 100);
    }
    restanteConRecargo = Math.round(restanteConRecargo * 100) / 100;
    const hayRecargo = Math.abs(restanteConRecargo - restanteBase) > 0.01;
    // Total a pagar = pagos ya hechos + restante con recargo
    const totalFinal = totalPagos + restanteConRecargo;

    div.classList.remove('d-none');
    div.innerHTML = `
      <div class="alert ${hayRecargo ? 'alert-danger border-danger' : 'alert-info'} py-2 mb-0" style="${hayRecargo ? 'border-width:2px !important;' : ''}">
        <div class="d-flex align-items-center flex-wrap gap-2 ${hayRecargo ? 'fw-bold' : ''}">
          <span><i class="bi bi-percent me-1"></i>Recargo: <strong>${interes}%</strong></span>
          <span>|</span>
          <span>Coeficiente: <strong>${coeficiente}</strong></span>
          ${hayRecargo ? `
          <span>|</span>
          <span>Base: ${FormatMoney(restanteBase)}</span>
          <span class="fs-5">&rarr;</span>
          <span class="text-danger fs-5 fw-bold">${FormatMoney(restanteConRecargo)}</span>
          ` : ''}
        </div>
      </div>`;
    POS._totalConRecargo = totalFinal;

    // Actualizar Total a Pagar y Restante con el total recargado
    document.getElementById('pagoTotalVenta').textContent = FormatMoney(totalFinal);
    document.getElementById('pagoRestante').textContent = FormatMoney(restanteConRecargo);
    document.getElementById('pagoRestante').className = restanteConRecargo > 0.01 ? 'text-danger fw-bold fs-4' : 'text-success fw-bold fs-4';

    // Solo pre-llenar importe si queda algo pendiente
    if (restanteConRecargo > 0.01) {
      document.getElementById('pagoImporte').value = restanteConRecargo.toFixed(2);
    } else {
      document.getElementById('pagoImporte').value = '';
    }
    ActualizarBotonConfirmar();
  } else {
    POS._totalConRecargo = 0;
    div.classList.add('d-none');
    div.innerHTML = '';

    // Restaurar Total a Pagar y Restante al importe base (sin recargo)
    document.getElementById('pagoTotalVenta').textContent = FormatMoney(totalBase);
    document.getElementById('pagoRestante').textContent = FormatMoney(restanteBase);
    document.getElementById('pagoRestante').className = restanteBase > 0.01 ? 'text-danger fw-bold fs-4' : 'text-success fw-bold fs-4';

    if (restanteBase > 0.01) {
      document.getElementById('pagoImporte').value = restanteBase.toFixed(2);
    } else {
      document.getElementById('pagoImporte').value = '';
    }
    ActualizarBotonConfirmar();
  }
}

async function RenderPagosModal() {
  // Usar siempre el total base (sin recargo) para calcular; AplicarRecargo actualizará los labels
  const esCobroDeuda = POS._modoCobroDeuda && POS._cobroDeudaData;
  let baseTotal;
  if (esCobroDeuda) {
    baseTotal = POS._cobroDeudaData.total;
  } else if (POS._cambioData && POS._cambioData.diferencia > 0) {
    baseTotal = POS._cambioData.diferencia;
  } else {
    baseTotal = POS.GetTotal();
  }
  const total = baseTotal;
  const totalPagos = POS.GetTotalPagos();
  const restante = total - totalPagos;

  // ── 1. Poblar TiposCobrosPagos (TIPOMOVIMIENTO != 'E', excluir CTACTE en cobro deuda) ──
  const sel = document.getElementById('pagoTipo');
  const prevTipo = POS._resetTipoPago ? '' : sel.value;
  POS._resetTipoPago = false;
  sel.innerHTML = '';
  State.tiposCobrosPagos
    .filter(t => {
      const mov = (t.TIPOMOVIMIENTO || '').trim();
      if (mov === 'E') return false;
      if (esCobroDeuda && mov === 'X') return false; // Excluir CTACTE en cobro de deuda
      if (esCobroDeuda && t.TIPO === 9) return false; // Excluir Credito Devoluciones en cobro de deuda
      return true;
    })
    .forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.GUID.trim();
      opt.textContent = (t.DESCRIPCION || '').trim();
      sel.appendChild(opt);
    });
  if (prevTipo && sel.querySelector(`option[value="${prevTipo}"]`)) {
    sel.value = prevTipo;
  } else {
    // Por defecto seleccionar EFECTIVO
    const efectivoOpt = State.tiposCobrosPagos.find(t => (t.DESCRIPCION || '').trim().toUpperCase() === 'EFECTIVO');
    if (efectivoOpt && sel.querySelector(`option[value="${efectivoOpt.GUID.trim()}"]`)) {
      sel.value = efectivoOpt.GUID.trim();
    }
  }

  const tipoSel = GetTipoCobroPagoSel();
  const tipoMov = tipoSel ? (tipoSel.TIPOMOVIMIENTO || '').trim() : '';
  const tipoNum = tipoSel ? tipoSel.TIPO : null;
  const esCtaCte = tipoMov === 'X';
  const esEfectivo = tipoSel ? (tipoSel.DESCRIPCION || '').trim().toUpperCase() === 'EFECTIVO' : false;
  const esCreditoDev = tipoSel ? tipoSel.TIPO === 9 : false;
  const esNoEfectivo = !esEfectivo;

  // ── 2. Poblar Comprobantes filtrados por TIPO del TipoCobroPago ──
  const divComp = document.getElementById('divComprobante');
  const selComp = document.getElementById('pagoComprobante');
  const prevComp = selComp.value;
  const comprobantes = tipoNum !== null ? State.tcPagos.filter(t => t.TIPO === tipoNum) : [];
  const roComp = document.getElementById('pagoComprobanteRO');
  if (comprobantes.length > 0) {
    divComp.classList.remove('d-none');
    if (comprobantes.length === 1 && comprobantes[0].CANTPLANES === 0) {
      // Unico comprobante sin planes: mostrar como readonly
      selComp.style.display = 'none';
      selComp.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = comprobantes[0].GUID.trim();
      opt.textContent = (comprobantes[0].TIPO_COMPROBANTE || '').trim();
      selComp.appendChild(opt);
      selComp.value = opt.value;
      roComp.value = (comprobantes[0].TIPO_COMPROBANTE || '').trim();
      roComp.style.display = '';
    } else if (comprobantes.length === 1) {
      selComp.style.display = '';
      roComp.style.display = 'none';
      selComp.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = comprobantes[0].GUID.trim();
      opt.textContent = (comprobantes[0].TIPO_COMPROBANTE || '').trim();
      selComp.appendChild(opt);
      selComp.value = opt.value;
    } else {
      selComp.style.display = '';
      roComp.style.display = 'none';
      selComp.innerHTML = '<option value="">Seleccione...</option>';
      comprobantes.forEach(tc => {
        const opt = document.createElement('option');
        opt.value = tc.GUID.trim();
        opt.textContent = (tc.TIPO_COMPROBANTE || '').trim();
        selComp.appendChild(opt);
      });
      if (prevComp && selComp.querySelector(`option[value="${prevComp}"]`)) selComp.value = prevComp;
    }
  } else {
    divComp.classList.add('d-none');
    selComp.innerHTML = '';
    selComp.style.display = '';
    roComp.style.display = 'none';
  }

  // ── 3. Planes del comprobante seleccionado ──
  const compSel = GetComprobanteSel();
  const tienePlanes = compSel ? compSel.CANTPLANES > 0 : false;
  document.getElementById('divCuotas').classList.toggle('d-none', !tienePlanes);
  if (tienePlanes && compSel) {
    const selPlan = document.getElementById('pagoPlan');
    const prevPlan = selPlan.value;
    selPlan.innerHTML = '<option value="">Sin plan</option>';
    API.GetTCPagosPlanes(compSel.GUID.trim()).then(planes => {
      planes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify({ cuotas: p.CUOTAS, interes: p.INTERES, coeficiente: p.COEFICIENTE });
        opt.textContent = `${(p.NOMBRECOMPROBANTEPAGO || '').trim()} - ${p.CUOTAS} cuotas (Int: ${p.INTERES}% | Coef: ${p.COEFICIENTE})`;
        selPlan.appendChild(opt);
      });
      if (prevPlan) selPlan.value = prevPlan;
      // ── 4. Info de recargo (después de cargar planes para no perder coeficientes) ──
      AplicarRecargo(baseTotal);
    }).catch(() => { AplicarRecargo(baseTotal); });
  } else {
    document.getElementById('pagoPlan').innerHTML = '';
    // ── 4. Info de recargo ──
    AplicarRecargo(baseTotal);
  }

  // ── 5. Credito Devolucion ──
  document.getElementById('divCreditoDevOpciones').classList.toggle('d-none', !esCreditoDev);
  if (esCreditoDev && POS.cliente) {
    LoadCreditosDevolucion(POS.cliente.GUID.trim());
  } else if (esCreditoDev && !POS.cliente) {
    document.getElementById('pagoCreditoDev').innerHTML = '<option value="">Seleccione cliente primero</option>';
  }

  // ── 5b. Notificación proactiva de créditos por devoluciones ──
  const divCreditoAviso = document.getElementById('creditoDevAviso');
  if (divCreditoAviso) divCreditoAviso.remove();
  const yaUsaCreditoDev = POS.pagos.some(p => p._esCreditoDev);
  if (!esCobroDeuda && POS.cliente && !yaUsaCreditoDev) {
    try {
      const creditos = await API.GetCreditosCliente(POS.cliente.GUID.trim());
      const creditosActivos = creditos.filter(c => {
        const disponible = c.MONTODISPONIBLE || (c.MONTOORIGINAL - c.MONTOUSADO);
        return disponible > 0.01;
      });
      if (creditosActivos.length > 0) {
        const totalCredito = creditosActivos.reduce((sum, c) => sum + (c.MONTODISPONIBLE || (c.MONTOORIGINAL - c.MONTOUSADO)), 0);
        const avisoEl = document.createElement('div');
        avisoEl.id = 'creditoDevAviso';
        avisoEl.className = 'alert alert-info border-info py-2 px-3 mb-2 d-flex align-items-center justify-content-between';
        avisoEl.innerHTML = `
          <div>
            <i class="bi bi-gift me-2"></i>
            <strong>${(POS.cliente.NOMBRE || '').trim()}</strong> tiene crédito por devoluciones:
            <span class="fw-bold text-success">${FormatMoney(totalCredito)}</span>
          </div>
          <button class="btn btn-sm btn-info" onclick="AplicarCreditoDevAutomatico()">
            <i class="bi bi-plus-circle me-1"></i>Aplicar crédito
          </button>
        `;
        const pagoTotalEl = document.getElementById('pagoTotalVenta');
        pagoTotalEl.parentElement.insertBefore(avisoEl, pagoTotalEl.parentElement.firstChild);
      }
    } catch (_) {}
  }

  // ── 5c. Auto-aplicar crédito de QR escaneado ──
  if (POS._creditoQR && !yaUsaCreditoDev && !esCobroDeuda) {
    const cqr = POS._creditoQR;
    POS._creditoQR = null; // Consumir para no re-aplicar
    // Seleccionar tipo CREDITO DEVOLUCION y re-renderizar
    const tipoCredDev = State.tiposCobrosPagos.find(t => t.TIPO === 9);
    if (tipoCredDev) {
      const sel = document.getElementById('pagoTipo');
      sel.value = tipoCredDev.GUID.trim();
      // Diferir para que se actualice el tipo y se carguen los créditos
      setTimeout(async () => {
        await RenderPagosModal();
        // Auto-seleccionar el crédito escaneado en el selector
        const selCredito = document.getElementById('pagoCreditoDev');
        if (selCredito) {
          for (const opt of selCredito.options) {
            if (opt.value && opt.value.includes(cqr.guid)) {
              selCredito.value = opt.value;
              selCredito.dispatchEvent(new Event('change'));
              break;
            }
          }
        }
      }, 300);
      return; // Sale de RenderPagosModal porque se va a re-invocar
    }
  }

  const reqCliente = POS.RequiereCliente();
  const reqFactura = POS.RequiereFactura();
  const soloEfectivo = POS.SoloEfectivoOCtaCte();

  // Indicar contexto del cobro (cambio o deuda ctacte)
  const lblTotal = document.getElementById('pagoTotalVenta');
  lblTotal.textContent = FormatMoney(total);
  const cambioInfoEl = document.getElementById('cambioInfoPagos');
  if (esCobroDeuda) {
    if (!cambioInfoEl) {
      const info = document.createElement('div');
      info.id = 'cambioInfoPagos';
      info.className = 'alert alert-primary py-1 px-2 mb-2 small';
      info.innerHTML = `<i class="bi bi-cash-coin me-1"></i>Cobro Cta. Cte.: <strong>${POS._cobroDeudaData.items.length} comprobante${POS._cobroDeudaData.items.length > 1 ? 's' : ''}</strong> — Total: <strong>${FormatMoney(POS._cobroDeudaData.total)}</strong>`;
      lblTotal.parentElement.insertBefore(info, lblTotal.parentElement.firstChild);
    }
  } else if (POS._cambioData && POS._cambioData.diferencia > 0) {
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
  // AplicarRecargo actualizará Total/Restante con los valores correctos (con o sin recargo)

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
              ${esCobroDeuda ? '' : `<button class="btn btn-sm btn-outline-danger" onclick="POS.cliente = null; RenderPagosModal();"><i class="bi bi-x me-1"></i>Cambiar</button>`}
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
            <span class="ms-1">${esCtaCte ? 'para Cuenta Corriente' : tipoSel ? 'para ' + (tipoSel.DESCRIPCION || '').trim() : ''}</span>
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
          ${esCobroDeuda ? '' : `<button class="btn btn-sm btn-outline-danger" onclick="POS.cliente = null; RenderPagosModal();"><i class="bi bi-x"></i></button>`}
        </div>
      `;
    } else {
      const sucActual = State.sucursales.find(s => s.GUID === State.sucursalActual);
      const cfEmail = POS._cfEmail || (sucActual ? (sucActual.EMAIL || '').trim() : '');
      const cfCelular = POS._cfCelular || (sucActual ? (sucActual.CELULAR || '').trim() : '');
      if (!POS._cfEmail) POS._cfEmail = cfEmail;
      if (!POS._cfCelular) POS._cfCelular = cfCelular;
      zonaCliente.innerHTML = `
        <div class="mb-0">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="fw-semibold">Cliente:</span>
            <em class="text-muted">Consumidor Final</em>
            <button class="btn btn-sm btn-outline-primary" onclick="AbrirModalClientePago()">
              <i class="bi bi-person-plus me-1"></i>Seleccionar
            </button>
          </div>
          <div class="row g-2">
            <div class="col-md-5">
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control" id="cfEmail" value="${cfEmail}" placeholder="Email para comprobante" onchange="POS._cfEmail=this.value.trim()">
              </div>
            </div>
            <div class="col-md-4">
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="bi bi-phone"></i></span>
                <input type="text" class="form-control" id="cfCelular" value="${cfCelular}" placeholder="Celular" onchange="POS._cfCelular=this.value.trim()">
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // ── Deshabilitar agregar pago si requiere cliente y no tiene ──
  const bloqueaAgregar = esNoEfectivo && !POS.cliente;
  document.getElementById('btnAgregarPago').disabled = bloqueaAgregar;

  // Si es CTA_CTE con crédito excedido, también bloquear — refrescar saldo real desde DB
  const alertaCredito = document.getElementById('pagoCreditoAlerta');
  alertaCredito.className = 'd-none mb-3';
  alertaCredito.innerHTML = '';
  let creditoExcedido = false;
  if (esCtaCte && POS.cliente) {
    try {
      const saldoData = await API.GetClienteSaldo(POS.cliente.GUID);
      POS.cliente.SALDO = saldoData.Saldo || 0;
    } catch (_) {}
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
        <td><span class="badge bg-${p._esEfectivo ? 'success' : p._esCreditoDev ? 'secondary' : p._esCtaCte ? 'warning' : 'primary'}">${p.descripcion}</span></td>
        <td>${p.descripcion}${p.cuotas > 1 ? ` (${p.cuotas} cuotas)` : ''}</td>
        <td class="text-end fw-bold">${FormatMoney(p.importe)}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="POS.QuitarPago(${i})"><i class="bi bi-trash"></i></button></td>
      </tr>
    `).join('');
  }

  // ── Zona de Factura ──
  const zonaFactura = document.getElementById('pagoFacturaZona');
  const yaFacturado = esCobroDeuda && POS._cobroDeudaData && POS._cobroDeudaData.todosConFactura;
  if (yaFacturado) {
    POS.emitirFactura = false;
    zonaFactura.innerHTML = `
      <div class="alert alert-secondary py-2 d-flex align-items-center mb-0">
        <i class="bi bi-check-circle me-2 fs-5"></i>
        <div>
          <strong>Comprobante fiscal ya emitido</strong> — No se generará nueva factura.
        </div>
      </div>
    `;
  } else if (reqFactura) {
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

  // ── Enable/disable confirmar (se actualiza también desde AplicarRecargo) ──
  ActualizarBotonConfirmar();
}

function ActualizarBotonConfirmar() {
  const totalFinal = POS._totalConRecargo > 0 ? POS._totalConRecargo : (POS._cambioData && POS._cambioData.diferencia > 0 ? POS._cambioData.diferencia : POS.GetTotal());
  const totalPagos = POS.GetTotalPagos();
  const restanteFinal = totalFinal - totalPagos;
  const reqCliente = POS.RequiereCliente();
  const bloqueado = Math.abs(restanteFinal) > 0.01 || (reqCliente && !POS.cliente);
  document.getElementById('btnConfirmarVenta').disabled = bloqueado;
}

function AbrirModalClientePago() {
  const tipoSel = GetTipoCobroPagoSel();
  const tipoMov = tipoSel ? (tipoSel.TIPOMOVIMIENTO || '').trim() : '';
  const esCtaCte = tipoMov === 'X' || POS.pagos.some(p => p._esCtaCte);

  const modalPagosEl = document.getElementById('modalPagos');
  const modalPagosInst = bootstrap.Modal.getInstance(modalPagosEl);
  if (modalPagosInst) modalPagosInst.hide();

  document.getElementById('searchCliente').value = '';
  document.getElementById('formNuevoClienteContainer').classList.add('d-none');
  document.getElementById('formNuevoClienteContainer').innerHTML = '';
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
      const resp = esCtaCte ? await API.GetClientesCtaCte(val) : await API.GetClientes(val);
      const clientes = esCtaCte ? resp : (resp.data || resp);

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
  if (ClienteRequiereContacto(cliente)) {
    MostrarFormContactoCliente(cliente, (cliActualizado) => {
      SeleccionarClienteDesdeModal(cliActualizado);
    });
    return;
  }
  POS.cliente = cliente;
  bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();

  // Actualizar info en POS principal
  const elPOS = document.getElementById('posClienteInfo');
  if (elPOS) {
    elPOS.innerHTML = `
      <span class="badge bg-primary badge-lg me-2"><i class="bi bi-person-fill me-1"></i>${(cliente.NOMBRE || '').trim()}</span>
      <small class="text-muted">CUIT: ${(cliente.CUIT || '').trim()} | Saldo: ${FormatMoney(cliente.SALDO)}</small>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="POS.cliente = null; document.getElementById('posClienteInfo').innerHTML = '<em class=\\'text-muted\\'>Consumidor Final</em>'; ToggleTitularTarjeta();">
        <i class="bi bi-x"></i>
      </button>
    `;
  }
  ToggleTitularTarjeta();

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

// ── Validacion contacto obligatorio ──────────────────────────────────────────
function ClienteRequiereContacto(cliente) {
  const email = (cliente.EMAIL || '').trim();
  const celular = (cliente.CELULAR || '').trim();
  return !email || !celular;
}

function MostrarFormContactoCliente(cliente, onComplete) {
  const email = (cliente.EMAIL || '').trim();
  const celular = (cliente.CELULAR || '').trim();
  const nombre = (cliente.NOMBRE || '').trim();

  const lista = document.getElementById('listaClientes');
  lista.innerHTML = `
    <div class="card border-warning mb-2">
      <div class="card-header bg-warning text-dark py-2">
        <i class="bi bi-exclamation-triangle me-1"></i>Datos de contacto obligatorios para <strong>${nombre}</strong>
      </div>
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input type="email" class="form-control" id="ccEmail" value="${email}" placeholder="nombre@ejemplo.com" maxlength="255">
          </div>
          <div class="col-md-6">
            <label class="form-label">Celular <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="ccCelular" value="${celular}" placeholder="Min. 10 digitos" maxlength="20">
          </div>
        </div>
        <div class="mt-2 d-flex gap-2">
          <button class="btn btn-success btn-sm" id="btnGuardarContacto"><i class="bi bi-check-circle me-1"></i>Guardar y continuar</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('listaClientes').innerHTML = '';">Cancelar</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btnGuardarContacto').onclick = async () => {
    const newEmail = document.getElementById('ccEmail').value.trim();
    const newCelular = document.getElementById('ccCelular').value.trim();

    if (!newEmail || !ValidarEmail(newEmail)) {
      ShowToast('Error', 'Ingrese un email valido', 'error'); return;
    }
    if (!newCelular || !ValidarCelular(newCelular)) {
      ShowToast('Error', 'Ingrese un celular valido (min. 10 digitos)', 'error'); return;
    }

    try {
      await API.UpdateClienteContacto(cliente.GUID, { email: newEmail, celular: newCelular });
      cliente.EMAIL = newEmail;
      cliente.CELULAR = newCelular;
      ShowToast('Cliente', 'Datos de contacto actualizados', 'success');
      onComplete(cliente);
    } catch (err) {
      ShowToast('Error', err.message, 'error');
    }
  };
}

// ── Modal Cliente ──────────────────────────────────────────────────────────────
function AbrirModalCliente() {
  document.getElementById('searchCliente').value = '';
  document.getElementById('listaClientes').innerHTML = '';
  document.getElementById('formNuevoClienteContainer').classList.add('d-none');
  document.getElementById('formNuevoClienteContainer').innerHTML = '';
  new bootstrap.Modal(document.getElementById('modalCliente')).show();

  const input = document.getElementById('searchCliente');
  input.oninput = Debounce(async () => {
    const val = input.value.trim();
    if (val.length < 2) { document.getElementById('listaClientes').innerHTML = ''; return; }
    try {
      const resp = await API.GetClientes(val);
      const clientes = resp.data || resp;
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

// ── Nuevo Cliente (inline en modal) ──────────────────────────────────────────
function ToggleFormNuevoCliente() {
  const container = document.getElementById('formNuevoClienteContainer');
  if (!container.classList.contains('d-none')) {
    container.classList.add('d-none');
    container.innerHTML = '';
    return;
  }
  container.classList.remove('d-none');
  container.innerHTML = `
    <div class="card border-success">
      <div class="card-body">
        <h6 class="fw-semibold mb-3"><i class="bi bi-person-plus me-1"></i>Nuevo Cliente</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label">Tipo IVA <span class="text-danger">*</span></label>
            <select class="form-select" id="ncTipoIva" onchange="OnNcTipoIvaChange()">
              <option value="CONSUMIDOR FINAL">CONSUMIDOR FINAL</option>
              <option value="RESPONSABLE INSCRIPTO">RESPONSABLE INSCRIPTO</option>
              <option value="MONOTRIBUTO">MONOTRIBUTO</option>
              <option value="EXENTO">EXENTO</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Documento <span class="text-danger" id="ncDocLabel">*</span></label>
            <input type="text" class="form-control" id="ncDocumento" placeholder="Ej: 30.123.456" maxlength="12">
          </div>
          <div class="col-md-4">
            <label class="form-label">CUIT <span class="text-danger d-none" id="ncCuitReq">*</span></label>
            <input type="text" class="form-control" id="ncCuit" placeholder="Ej: 20-12345678-9" maxlength="13">
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <label class="form-label">Nombre <span class="text-danger">*</span></label>
            <input type="text" class="form-control text-uppercase" id="ncNombre" maxlength="255" style="text-transform:uppercase">
          </div>
          <div class="col-md-4">
            <label class="form-label">Direcci&oacute;n</label>
            <input type="text" class="form-control text-uppercase" id="ncDireccion" maxlength="255" style="text-transform:uppercase">
          </div>
          <div class="col-md-4">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input type="email" class="form-control" id="ncEmail" maxlength="255" placeholder="nombre@ejemplo.com" required>
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <label class="form-label">Celular <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="ncCelular" placeholder="Min. 10 d&iacute;gitos" maxlength="20" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Nombre Empresa</label>
            <input type="text" class="form-control text-uppercase" id="ncNombreEmpresa" maxlength="100" style="text-transform:uppercase">
          </div>
          <div class="col-md-4">
            <label class="form-label">L&iacute;mite de Cr&eacute;dito</label>
            <input type="number" class="form-control" id="ncLimiteCredito" value="0" step="0.01">
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-3">
            <label class="form-label">Provincia</label>
            <input type="text" class="form-control text-uppercase" id="ncProvincia" maxlength="255" style="text-transform:uppercase">
          </div>
          <div class="col-md-3">
            <label class="form-label">Localidad</label>
            <input type="text" class="form-control text-uppercase" id="ncLocalidad" maxlength="255" style="text-transform:uppercase">
          </div>
          <div class="col-md-2">
            <label class="form-label">C&oacute;d. Postal</label>
            <input type="text" class="form-control text-uppercase" id="ncCodigoPostal" maxlength="6" style="text-transform:uppercase">
          </div>
          <div class="col-md-4">
            <label class="form-label">Observaciones</label>
            <input type="text" class="form-control text-uppercase" id="ncObservaciones" maxlength="5000" style="text-transform:uppercase">
          </div>
        </div>
        <div class="row g-2 mt-2">
          <div class="col-md-12 d-flex gap-2">
            <button class="btn btn-success" onclick="GuardarNuevoCliente()"><i class="bi bi-check-circle me-1"></i>Guardar Cliente</button>
            <button class="btn btn-secondary" onclick="ToggleFormNuevoCliente()">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  OnNcTipoIvaChange();
}

function OnNcTipoIvaChange() {
  const tipoIva = document.getElementById('ncTipoIva').value;
  const esCF = tipoIva === 'CONSUMIDOR FINAL';
  document.getElementById('ncCuitReq').classList.toggle('d-none', esCF);
  document.getElementById('ncDocLabel').textContent = esCF ? '*' : '';
}

function ValidarDocumento(val) {
  const num = parseInt(val.replace(/\./g, ''), 10);
  return !isNaN(num) && num > 1000000;
}

function ValidarCuit(val) {
  return /^\d{2}-\d{7,8}-\d{1}$/.test(val);
}

function ValidarEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function ValidarCelular(val) {
  const soloDigitos = val.replace(/\D/g, '');
  return soloDigitos.length >= 10;
}

function FormatDocumento(val) {
  const digits = val.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

async function GuardarNuevoCliente() {
  const tipoIva = document.getElementById('ncTipoIva').value;
  const documento = document.getElementById('ncDocumento').value.trim();
  const cuit = document.getElementById('ncCuit').value.trim();
  const nombre = document.getElementById('ncNombre').value.trim().toUpperCase();
  const direccion = document.getElementById('ncDireccion').value.trim().toUpperCase();
  const email = document.getElementById('ncEmail').value.trim();
  const celular = document.getElementById('ncCelular').value.trim();
  const limiteCredito = document.getElementById('ncLimiteCredito').value;
  const provincia = document.getElementById('ncProvincia').value.trim().toUpperCase();
  const localidad = document.getElementById('ncLocalidad').value.trim().toUpperCase();
  const codigoPostal = document.getElementById('ncCodigoPostal').value.trim().toUpperCase();
  const observaciones = document.getElementById('ncObservaciones').value.trim().toUpperCase();
  const nombreEmpresa = document.getElementById('ncNombreEmpresa').value.trim().toUpperCase();

  const esCF = tipoIva === 'CONSUMIDOR FINAL';

  // Validaciones
  if (!nombre) { ShowToast('Error', 'El nombre es obligatorio', 'error'); return; }

  // Documento o CUIT obligatorio como minimo
  if (!documento && !cuit) { ShowToast('Error', 'Debe ingresar Documento o CUIT', 'error'); return; }

  if (documento && !ValidarDocumento(documento)) {
    ShowToast('Error', 'Documento inv\u00e1lido. Debe ser mayor a 1.000.000', 'error'); return;
  }

  // Si no es Consumidor Final, CUIT es obligatorio
  if (!esCF && !cuit) {
    ShowToast('Error', 'El CUIT es obligatorio para ' + tipoIva, 'error'); return;
  }
  if (cuit && !ValidarCuit(cuit)) {
    ShowToast('Error', 'CUIT inv\u00e1lido. Formato: 99-99999999-9', 'error'); return;
  }

  if (!email) {
    ShowToast('Error', 'El email es obligatorio', 'error'); return;
  }
  if (!ValidarEmail(email)) {
    ShowToast('Error', 'Email inv\u00e1lido', 'error'); return;
  }

  if (!celular) {
    ShowToast('Error', 'El celular es obligatorio', 'error'); return;
  }
  if (!ValidarCelular(celular)) {
    ShowToast('Error', 'Celular inv\u00e1lido. M\u00ednimo 10 d\u00edgitos num\u00e9ricos', 'error'); return;
  }

  // Derivar campos automáticos
  const tipoFactura = tipoIva === 'RESPONSABLE INSCRIPTO' ? 'A' : 'B';
  const codigoDocumentoAfip = esCF ? 96 : 80;

  try {
    const result = await API.CreateCliente({
      nombre, documento: documento.replace(/\./g, ''), cuit, direccion, email, celular,
      tipoIva, tipoFactura, codigoDocumentoAfip,
      limiteCredito: limiteCredito !== '' ? parseFloat(limiteCredito) : null,
      provincia, localidad, codigoPostal, observaciones, nombreEmpresa
    });

    ShowToast('Cliente', 'Creado exitosamente', 'success');

    // Cargar el cliente creado y seleccionarlo automáticamente
    const nuevoCliente = await API.GetClienteByGuid(result.guid);
    if (nuevoCliente) {
      SeleccionarClienteDesdeModal(nuevoCliente);
    }
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// ============================================================================
// SECCIÓN: Factura — Modal de comprobante emitido
// ============================================================================
let _facturaActual = null;

async function MostrarFactura(guidFactura) {
  const body = document.getElementById('facturaBody');
  body.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
  new bootstrap.Modal(document.getElementById('modalFactura')).show();

  try {
    const det = await API.GetFacturaDetalle(guidFactura);
    if (!det || !det.factura) { body.innerHTML = '<div class="alert alert-warning">No se encontró la factura.</div>'; return; }
    _facturaActual = det;
    const f = det.factura;
    const tipoComp = (f.TIPO_COMPROBANTE || '').trim();
    const tipoFact = (f.TIPO_FACTURA || '').trim();
    const numFact = (f.NUMERO_FACTURA || '').trim();
    const fecha = FormatFechaInt(f.FECHA);
    const nombre = (f.NOMBRE || '').trim();
    const cuit = (f.CUIT || '').trim();
    const empresa = (f.NombreEmpresa || '').trim();
    const cuitEmp = (f.CuitEmpresa || '').trim();
    const condIva = (f.CondicionIva || '').trim();
    const dirEmp = (f.DireccionEmpresa || '').trim();
    const cae = (f.CAE || '').trim();
    const fechaCae = f.FECHAVENCIMIENTOCAE ? new Date(f.FECHAVENCIMIENTOCAE).toLocaleDateString('es-AR') : '';

    const tipoLabel = tipoComp === 'NCB' || tipoComp === 'NCA' ? 'NOTA DE CREDITO' : 'FACTURA';
    const letraBg = tipoFact === 'A' ? 'primary' : tipoFact === 'B' ? 'dark' : 'secondary';

    // Items
    const itemsHTML = det.items.map(i => `
      <tr>
        <td><code>${(i.ARTICULO || '').trim()}</code></td>
        <td>${(i.DESCRIPCION || '').trim()}</td>
        <td class="text-center">${i.NUMERO || '-'}</td>
        <td class="text-center">${i.CANTIDAD}</td>
        <td class="text-end">${FormatMoney(i.NETO)}</td>
        <td class="text-end">${FormatMoney(i.TOTAL)}</td>
      </tr>
    `).join('');

    // Pagos
    const pagosHTML = det.pagos.map(p => `
      <tr>
        <td><span class="badge bg-secondary">${p.TIPOCOMPROBANTE}</span></td>
        <td>${p.DESCRIPCION}</td>
        <td class="text-end">${FormatMoney(p.IMPORTE)}</td>
      </tr>
    `).join('');

    // Estado AFIP
    const estadoAfip = cae
      ? `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>CAE: ${cae} (Vto: ${fechaCae})</span>`
      : '<span class="badge bg-warning text-dark"><i class="bi bi-clock me-1"></i>Pendiente de autorizar</span>';

    body.innerHTML = `
      <!-- Cabecera comprobante -->
      <div class="border rounded p-3 mb-3">
        <div class="row align-items-center">
          <div class="col-md-5">
            <h6 class="fw-bold mb-1">${empresa}</h6>
            <small class="text-muted">${dirEmp}</small><br>
            <small class="text-muted">CUIT: ${cuitEmp} | ${condIva}</small>
          </div>
          <div class="col-md-2 text-center">
            <div class="border rounded d-inline-block px-3 py-1">
              <span class="fs-3 fw-bold text-${letraBg}">${tipoFact}</span>
            </div>
          </div>
          <div class="col-md-5 text-end">
            <h5 class="fw-bold mb-1">${tipoLabel} ${tipoFact}</h5>
            <div class="fs-5 fw-semibold text-primary">${numFact}</div>
            <small class="text-muted">Fecha: ${fecha}</small>
          </div>
        </div>
      </div>

      <!-- Datos cliente -->
      <div class="row mb-3 px-2">
        <div class="col-md-6">
          <small class="text-muted">Cliente</small>
          <div class="fw-semibold">${nombre || 'CONSUMIDOR FINAL'}</div>
        </div>
        <div class="col-md-3">
          <small class="text-muted">CUIT</small>
          <div class="fw-semibold">${cuit || '-'}</div>
        </div>
        <div class="col-md-3 text-end">
          ${estadoAfip}
        </div>
      </div>

      <!-- Items -->
      <table class="table table-sm mb-2">
        <thead class="table-light">
          <tr><th>Codigo</th><th>Descripcion</th><th class="text-center">Talle</th><th class="text-center">Cant.</th><th class="text-end">Precio</th><th class="text-end">Subtotal</th></tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <!-- Totales -->
      <div class="row mb-3">
        ${pagosHTML ? `<div class="col-md-6">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Medio de Pago</th><th>Detalle</th><th class="text-end">Importe</th></tr></thead>
            <tbody>${pagosHTML}</tbody>
          </table>
        </div>` : ''}
        <div class="${pagosHTML ? 'col-md-6' : 'col-12'}"
          <div class="border rounded p-2">
            <div class="row small">
              <div class="col-6">Neto Gravado:</div><div class="col-6 text-end">${FormatMoney(f.TOTAL_NETO21 || 0)}</div>
              <div class="col-6">IVA 21%:</div><div class="col-6 text-end">${FormatMoney(f.TOTAL_IVA21 || 0)}</div>
              ${(f.TOTAL_EXENTO || 0) > 0 ? `<div class="col-6">Exento:</div><div class="col-6 text-end">${FormatMoney(f.TOTAL_EXENTO)}</div>` : ''}
              ${(f.TOTAL_NOGRAVADO || 0) > 0 ? `<div class="col-6">No Gravado:</div><div class="col-6 text-end">${FormatMoney(f.TOTAL_NOGRAVADO)}</div>` : ''}
            </div>
            <hr class="my-1">
            <div class="row fw-bold fs-5">
              <div class="col-6">TOTAL:</div><div class="col-6 text-end text-success">${FormatMoney(f.TOTAL || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

function AutorizarFactura() {
  ShowToast('Autorizar ARCA', 'Funcionalidad pendiente de implementar', 'info');
}

function EnviarFacturaWhatsApp() {
  ShowToast('WhatsApp', 'Funcionalidad pendiente de implementar', 'info');
}

function EnviarFacturaEmail() {
  ShowToast('Email', 'Funcionalidad pendiente de implementar', 'info');
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
            <div class="card-header bg-white fw-semibold"><i class="bi bi-pie-chart me-2"></i>Devoluciones / Cambios vs Ventas</div>
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
    RenderCharts(desde, hasta, guidSucursal, totalVentas, totalDev, totalCambios);
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

const CHART_COLORS = ['#198754', '#0d6efd', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0', '#fd7e14', '#20c997', '#6610f2', '#d63384'];

async function RenderCharts(desde, hasta, guidSucursal, totalVentas, totalDev, totalCambios) {
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

    // Gráfico Devoluciones vs Cambios vs Ventas
    const ctxDev = document.getElementById('chartDevoluciones');
    const totalDevCam = totalDev + totalCambios;
    const totalBase = Math.max(totalVentas, totalDevCam, totalVentas + totalDevCam);
    const ventasNetas = Math.max(totalVentas - totalDevCam, 0);
    if (ctxDev && (totalVentas > 0 || totalDevCam > 0)) {
      const divisor = totalVentas > 0 ? totalVentas : totalDevCam;
      const pctDev = ((totalDev / divisor) * 100).toFixed(1);
      const pctCam = ((totalCambios / divisor) * 100).toFixed(1);
      const pctNetas = totalVentas > 0 ? Math.max(100 - pctDev - pctCam, 0).toFixed(1) : '0.0';
      new Chart(ctxDev, {
        type: 'doughnut',
        data: {
          labels: [`Ventas Netas (${pctNetas}%)`, `Devoluciones (${pctDev}%)`, `Cambios (${pctCam}%)`],
          datasets: [{
            data: [ventasNetas, totalDev, totalCambios],
            backgroundColor: ['#198754', '#dc3545', '#fd7e14'],
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
            const pctTotal = ((totalDevCam / divisor) * 100).toFixed(1);
            c.font = 'bold 20px Segoe UI';
            c.fillStyle = totalDevCam > 0 ? '#dc3545' : '#198754';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(`${pctTotal}%`, width / 2, height / 2 - 16);
            c.font = '11px Segoe UI';
            c.fillStyle = '#dc3545';
            c.fillText(`Dev: ${pctDev}%`, width / 2, height / 2 + 4);
            c.fillStyle = '#fd7e14';
            c.fillText(`Cam: ${pctCam}%`, width / 2, height / 2 + 18);
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
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabNuevaDev">Nueva Devolucion</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabMovDev">Movimientos</a></li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="tabNuevaDev">
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
        <div class="tab-pane fade" id="tabMovDev">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label">Desde</label>
                  <input type="date" id="movDevDesde" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <input type="date" id="movDevHasta" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" onclick="BuscarMovDevoluciones()"><i class="bi bi-search me-1"></i>Buscar</button>
                </div>
              </div>
            </div>
          </div>
          <div id="movDevResultado"></div>
        </div>
      </div>
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

async function BuscarMovDevoluciones() {
  const desde = document.getElementById('movDevDesde').value;
  const hasta = document.getElementById('movDevHasta').value;
  const div = document.getElementById('movDevResultado');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';
  try {
    const data = await API.GetDevoluciones({ desde, hasta, guidSucursal: State.sucursalActual });
    if (data.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron devoluciones para esta fecha.</div>';
      return;
    }
    const totalDev = data.reduce((sum, d) => sum + (d.TOTAL || 0), 0);
    div.innerHTML = `
      <div class="alert alert-light border mb-3 d-flex justify-content-between align-items-center">
        <span><strong>${data.length}</strong> devolucion${data.length !== 1 ? 'es' : ''}</span>
        <span class="fw-bold text-danger">Total: ${FormatMoney(totalDev)}</span>
      </div>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th class="text-end">Total</th><th></th></tr>
            </thead>
            <tbody>
              ${data.map((d, idx) => `
                <tr id="movDevRow${idx}">
                  <td>${FormatFechaInt(d.FECHA)}</td>
                  <td>${FormatHoraInt(d.HORA)}</td>
                  <td>${(d.NOMBRE || 'Consumidor Final').trim()}</td>
                  <td class="text-end fw-bold">${FormatMoney(d.TOTAL)}</td>
                  <td><button class="btn btn-sm btn-outline-info" onclick="VerDetalleDevolucion('${d.GUID}','movDevRow${idx}')"><i class="bi bi-eye"></i></button></td>
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

async function VerDetalleDevolucion(guid, rowId) {
  const row = document.getElementById(rowId);
  const existing = row.nextElementSibling;
  if (existing && existing.classList.contains('detalle-row')) {
    existing.remove();
    return;
  }
  try {
    const det = await API.GetDevolucionDetalle(guid);
    const d = det.devolucion;
    const items = det.items || [];
    const credito = det.credito;
    const tr = document.createElement('tr');
    tr.classList.add('detalle-row');
    const guidFacDev = (d.GUIDFACTURAS || '').trim();
    const ncNumero = (d.NotaCreditoNumero || '').trim();
    const ncTipo = (d.NotaCreditoTipo || '').trim();
    const tieneNC = guidFacDev && guidFacDev !== '' && ncNumero;
    tr.innerHTML = `<td colspan="5" class="p-0">
      <div class="bg-light p-3 border-top">
        <div class="row mb-2">
          <div class="col-md-4"><small class="text-muted">Sucursal:</small> <strong>${d.Sucursal || '-'}</strong></div>
          <div class="col-md-4"><small class="text-muted">Tipo:</small> <strong>${(d.TIPOOPERACION || '').trim()}</strong></div>
          ${credito ? `<div class="col-md-4"><small class="text-muted">Credito:</small> <strong class="text-success">${FormatMoney(credito.MONTODISPONIBLE)} disponible</strong></div>` : ''}
        </div>
        <table class="table table-sm table-bordered mb-2">
          <thead><tr><th>Codigo</th><th>Descripcion</th><th>Talle</th><th class="text-center">Cant.</th><th class="text-end">P.Unit.</th><th class="text-end">Subtotal</th></tr></thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td><code>${(it.ARTICULO || '').trim()}</code></td>
                <td>${(it.DESCRIPCION || '').trim()}</td>
                <td>${it.TALLE || '-'}</td>
                <td class="text-center">${it.CANTIDAD}</td>
                <td class="text-end">${FormatMoney(it.PRECIOUNITARIO)}</td>
                <td class="text-end">${FormatMoney(it.TOTAL)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="d-flex gap-2">
          ${tieneNC ? `<button class="btn btn-sm btn-outline-primary" onclick="MostrarFactura('${guidFacDev}')"><i class="bi bi-receipt me-1"></i>${ncTipo} ${ncNumero}</button>` : ''}
          <button class="btn btn-sm btn-outline-secondary" onclick="GenerarComprobantePDF('${guid}')"><i class="bi bi-file-earmark-pdf me-1"></i>Comprobante PDF</button>
        </div>
      </div>
    </td>`;
    row.after(tr);
  } catch (err) {
    ShowToast('Error', err.message, 'error');
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
    const clienteActual = !esCF ? { nombre: (r.NOMBRE || '').trim(), guid: (r.GUIDCLIENTES || '').trim() } : null;
    const form = document.getElementById('devFormulario');
    form.classList.remove('d-none');
    form.innerHTML = `
      <div class="card shadow-sm border-danger">
        <div class="card-header bg-danger text-white"><h6 class="mb-0"><i class="bi bi-arrow-return-left me-2"></i>Seleccione articulos a devolver</h6></div>
        <div class="card-body">
          ${RenderClienteSelectorHTML('dev', clienteActual)}
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
                  <td class="text-center"><input type="number" class="form-control form-control-sm qty-input devQty d-inline-block" style="width:70px" data-idx="${i}" value="${item.RESTANTE}" min="1" max="${item.RESTANTE}"></td>
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
    InitClienteSelectorEvents('dev');
    // Si ya tiene cliente, pre-seleccionarlo
    if (clienteActual) {
      _devCambioCliente = { GUID: clienteActual.guid, NOMBRE: clienteActual.nombre };
    }
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

function RenderClienteSelectorHTML(idPrefix, clienteActual) {
  const tieneCliente = clienteActual && clienteActual.nombre && clienteActual.nombre.trim() !== '';
  return `
    <div class="card border-warning mb-3" id="${idPrefix}ClienteZona">
      <div class="card-body">
        <h6 class="card-title text-warning"><i class="bi bi-person-exclamation me-2"></i>Cliente requerido</h6>
        <p class="small text-muted mb-2">Debe asignar un cliente para esta operacion (obligatorio para cuenta corriente).</p>
        <div id="${idPrefix}ClienteSeleccionado" class="${tieneCliente ? '' : 'd-none'}">
          <div class="alert alert-success py-2 mb-0 d-flex align-items-center">
            <i class="bi bi-person-check me-1"></i><strong id="${idPrefix}ClienteNombre">${tieneCliente ? clienteActual.nombre : ''}</strong>
            <button class="btn btn-sm btn-outline-danger ms-auto" onclick="LimpiarClienteDevCambio('${idPrefix}')"><i class="bi bi-x me-1"></i>Cambiar</button>
          </div>
        </div>
        <div id="${idPrefix}BuscarZona" class="${tieneCliente ? 'd-none' : ''}">
          <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" id="${idPrefix}BuscarCliente" class="form-control" placeholder="Buscar cliente por nombre o CUIT...">
            <button class="btn btn-outline-success" type="button" onclick="ToggleNuevoClienteDevCambio('${idPrefix}')"><i class="bi bi-person-plus me-1"></i>Nuevo</button>
          </div>
          <div id="${idPrefix}ListaClientes" class="list-group mb-2" style="max-height:200px; overflow-y:auto;"></div>
          <div id="${idPrefix}NuevoClienteForm" class="d-none">
            <div class="card border-success mt-2">
              <div class="card-body py-2">
                <h6 class="fw-semibold mb-2"><i class="bi bi-person-plus me-1"></i>Nuevo Cliente</h6>
                <div class="row g-2">
                  <div class="col-md-4">
                    <label class="form-label small mb-1">Nombre <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-sm" id="${idPrefix}NcNombre" maxlength="255">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small mb-1">Documento</label>
                    <input type="text" class="form-control form-control-sm" id="${idPrefix}NcDocumento" placeholder="Ej: 30.123.456" maxlength="12">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small mb-1">CUIT</label>
                    <input type="text" class="form-control form-control-sm" id="${idPrefix}NcCuit" placeholder="Ej: 20-12345678-9" maxlength="13">
                  </div>
                </div>
                <div class="row g-2 mt-1">
                  <div class="col-md-4">
                    <label class="form-label small mb-1">Email <span class="text-danger">*</span></label>
                    <input type="email" class="form-control form-control-sm" id="${idPrefix}NcEmail" maxlength="255">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small mb-1">Celular <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-sm" id="${idPrefix}NcCelular" placeholder="Min. 10 digitos" maxlength="20">
                  </div>
                  <div class="col-md-4 d-flex align-items-end gap-2">
                    <button class="btn btn-success btn-sm" onclick="GuardarNuevoClienteDevCambio('${idPrefix}')"><i class="bi bi-check-circle me-1"></i>Guardar</button>
                    <button class="btn btn-secondary btn-sm" onclick="ToggleNuevoClienteDevCambio('${idPrefix}')">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
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
      const resp = await API.GetClientes(val);
      const clientes = resp.data || resp;
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
  if (ClienteRequiereContacto(cliente)) {
    MostrarFormContactoCliente(cliente, (cliActualizado) => {
      SeleccionarClienteDevCambio(idPrefix, cliActualizado);
    });
    return;
  }
  _devCambioCliente = cliente;
  const lista = document.getElementById(`${idPrefix}ListaClientes`);
  if (lista) lista.innerHTML = '';
  const buscarZona = document.getElementById(`${idPrefix}BuscarZona`);
  if (buscarZona) buscarZona.classList.add('d-none');
  const sel = document.getElementById(`${idPrefix}ClienteSeleccionado`);
  sel.classList.remove('d-none');
  document.getElementById(`${idPrefix}ClienteNombre`).textContent = (cliente.NOMBRE || '').trim();
}

function LimpiarClienteDevCambio(idPrefix) {
  _devCambioCliente = null;
  const buscarZona = document.getElementById(`${idPrefix}BuscarZona`);
  if (buscarZona) buscarZona.classList.remove('d-none');
  const buscarInput = document.getElementById(`${idPrefix}BuscarCliente`);
  if (buscarInput) buscarInput.value = '';
  document.getElementById(`${idPrefix}ClienteSeleccionado`).classList.add('d-none');
  const lista = document.getElementById(`${idPrefix}ListaClientes`);
  if (lista) lista.innerHTML = '';
}

function ToggleNuevoClienteDevCambio(idPrefix) {
  const form = document.getElementById(`${idPrefix}NuevoClienteForm`);
  if (!form) return;
  form.classList.toggle('d-none');
}

async function GuardarNuevoClienteDevCambio(idPrefix) {
  const nombre = (document.getElementById(`${idPrefix}NcNombre`).value || '').trim();
  const documento = (document.getElementById(`${idPrefix}NcDocumento`).value || '').trim();
  const cuit = (document.getElementById(`${idPrefix}NcCuit`).value || '').trim();
  const email = (document.getElementById(`${idPrefix}NcEmail`).value || '').trim();
  const celular = (document.getElementById(`${idPrefix}NcCelular`).value || '').trim();

  if (!nombre) { ShowToast('Error', 'El nombre es obligatorio', 'error'); return; }
  if (!documento && !cuit) { ShowToast('Error', 'Debe ingresar Documento o CUIT', 'error'); return; }
  if (documento && !ValidarDocumento(documento)) { ShowToast('Error', 'Documento invalido. Debe ser mayor a 1.000.000', 'error'); return; }
  if (cuit && !ValidarCuit(cuit)) { ShowToast('Error', 'CUIT invalido. Formato: 99-99999999-9', 'error'); return; }
  if (!email) { ShowToast('Error', 'El email es obligatorio', 'error'); return; }
  if (!ValidarEmail(email)) { ShowToast('Error', 'Email invalido', 'error'); return; }
  if (!celular) { ShowToast('Error', 'El celular es obligatorio', 'error'); return; }
  if (!ValidarCelular(celular)) { ShowToast('Error', 'Celular invalido. Minimo 10 digitos', 'error'); return; }

  try {
    const result = await API.CreateCliente({
      nombre, documento: documento.replace(/\./g, ''), cuit, direccion: '', email, celular,
      tipoIva: 'CONSUMIDOR FINAL', tipoFactura: 'B', codigoDocumentoAfip: 96
    });
    ShowToast('Cliente', 'Creado exitosamente', 'success');
    const nuevoCliente = await API.GetClienteByGuid(result.guid);
    if (nuevoCliente) {
      SeleccionarClienteDevCambio(idPrefix, nuevoCliente);
    }
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

function ToggleAllDev(checked) {
  document.querySelectorAll('.devCheck').forEach(cb => { cb.checked = checked; });
}

async function ConfirmarDevolucion(guidRemitoOriginal, originalItems, guidCliente, nombre) {
  // Las devoluciones SIEMPRE requieren cliente (queda como credito en CTA CTE)
  if (_devCambioCliente) {
    guidCliente = _devCambioCliente.GUID;
    nombre = (_devCambioCliente.NOMBRE || '').trim();
  }
  if (!guidCliente || guidCliente.trim() === '') {
    ShowToast('Aviso', 'Debe seleccionar un cliente para la devolucion (obligatorio para cuenta corriente)', 'error');
    return;
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
  let errorCantidad = false;
  checks.forEach(cb => {
    const idx = parseInt(cb.dataset.idx);
    const qty = parseInt(document.querySelectorAll('.devQty')[idx].value) || 1;
    const orig = originalItems[idx];
    const maxDisponible = orig.RESTANTE || 0;
    if (qty > maxDisponible || qty < 1) {
      errorCantidad = true;
      ShowToast('Error', `"${(orig.DESCRIPCION || orig.ARTICULO || '').trim()}": cantidad a devolver (${qty}) supera la disponible (${maxDisponible})`, 'error');
      return;
    }
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
  if (errorCantidad) return;

  try {
    const result = await API.CreateDevolucion({
      guidRemitoOriginal,
      guidCliente,
      guidSucursal: State.sucursalActual,
      guidVendedor: null,
      guidUsuario: (State.usuario && State.usuario.GUID) || '',
      nombre,
      items,
      motivo,
      tipoDevolucion,
    });
    _devCambioCliente = null;

    let msg = `Total devuelto: ${FormatMoney(result.total)}`;
    if (result.notaCredito) msg += ` | NC: ${result.notaCredito}`;
    msg += ` | Credito generado`;
    ShowToast('Devolucion exitosa', msg, 'success');

    // Mostrar botones de accion post-devolucion
    const form = document.getElementById('devFormulario');
    form.innerHTML = `
      <div class="card shadow-sm border-success">
        <div class="card-body text-center">
          <h5 class="text-success mb-3"><i class="bi bi-check-circle-fill me-2"></i>Devolucion registrada</h5>
          <p>Total: <strong>${FormatMoney(result.total)}</strong>${result.notaCredito ? ` | Nota de Credito: <strong>${result.notaCredito}</strong>` : ''}</p>
          <p class="text-muted">Se genero un credito a favor del cliente por <strong>${FormatMoney(result.total)}</strong> aplicable en futuras compras.</p>
          <div class="d-flex justify-content-center gap-2">
            ${result.guidNotaCredito ? `<button class="btn btn-primary" onclick="MostrarFactura('${result.guidNotaCredito}')">
              <i class="bi bi-receipt me-1"></i>Ver Nota de Credito
            </button>` : ''}
            <button class="btn btn-outline-primary" onclick="GenerarComprobantePDF('${result.guid}')">
              <i class="bi bi-file-earmark-pdf me-1"></i>Comprobante PDF
            </button>
            <button class="btn btn-outline-secondary" onclick="RenderDevoluciones(document.getElementById('mainContent'))">
              <i class="bi bi-arrow-left me-1"></i>Volver
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// ── Aplicar crédito de devolución escaneando QR del comprobante ──
async function AplicarCreditoDesdeQR(guidDevolucion) {
  try {
    const credito = await API.GetCreditoByDevolucion(guidDevolucion);
    if (!credito) {
      ShowToast('Sin crédito', 'No se encontró crédito activo para esta devolución', 'info');
      return;
    }
    const disponible = credito.MONTODISPONIBLE || (credito.MONTOORIGINAL - credito.MONTOUSADO);
    if (disponible <= 0.01) {
      ShowToast('Crédito agotado', 'Este crédito de devolución ya fue utilizado', 'info');
      return;
    }
    if (credito.ESTADO !== 'ACTIVO') {
      ShowToast('Crédito inactivo', `El crédito está en estado: ${credito.ESTADO}`, 'info');
      return;
    }

    // Asignar cliente del crédito si no hay cliente seleccionado
    if (!POS.cliente && credito.GUIDCLIENTES) {
      try {
        POS.cliente = await API.GetClienteByGuid(credito.GUIDCLIENTES.trim());
        const el = document.getElementById('posClienteInfo');
        if (el && POS.cliente) {
          el.innerHTML = `
            <span class="badge bg-primary badge-lg me-2"><i class="bi bi-person-fill me-1"></i>${(POS.cliente.NOMBRE || '').trim()}</span>
            <small class="text-muted">CUIT: ${(POS.cliente.CUIT || '').trim()} | Saldo: ${FormatMoney(POS.cliente.SALDO)}</small>
            <button class="btn btn-sm btn-outline-danger ms-2" onclick="POS.cliente = null; document.getElementById('posClienteInfo').innerHTML = '<em class=\\'text-muted\\'>Consumidor Final</em>';">
              <i class="bi bi-x"></i>
            </button>
          `;
        }
      } catch (_) {}
    }

    // Guardar crédito QR para usarlo al abrir el modal de pagos
    POS._creditoQR = { guid: credito.GUID.trim(), disponible, guidCliente: (credito.GUIDCLIENTES || '').trim(), clienteNombre: (credito.ClienteNombre || '').trim() };

    const totalVenta = POS.GetTotal();
    if (totalVenta <= 0) {
      ShowToast('Crédito detectado', `Crédito de ${FormatMoney(disponible)} a nombre de ${(credito.ClienteNombre || '').trim()}. Agregue artículos para aplicarlo.`, 'success');
      return;
    }

    ShowToast('Crédito detectado', `Crédito disponible: ${FormatMoney(disponible)}. Se aplicará al confirmar el pago.`, 'success');
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

// ── Aplicar crédito de devolución automáticamente desde el banner ──
async function AplicarCreditoDevAutomatico() {
  // Buscar el tipo de pago "CREDITO DEV" y seleccionarlo
  const sel = document.getElementById('pagoTipo');
  const tipoCredDev = State.tiposCobrosPagos.find(t => t.TIPO === 9);
  if (!tipoCredDev) {
    ShowToast('Error', 'No se encontró el tipo de pago "Crédito Devolución" configurado', 'error');
    return;
  }
  sel.value = tipoCredDev.GUID.trim();
  await RenderPagosModal();
}

// ── Cargar creditos de devolucion disponibles para un cliente ──
async function LoadCreditosDevolucion(guidCliente) {
  const sel = document.getElementById('pagoCreditoDev');
  sel.innerHTML = '<option value="">Cargando...</option>';
  try {
    const creditos = await API.GetCreditosCliente(guidCliente);
    if (creditos.length === 0) {
      sel.innerHTML = '<option value="">Sin creditos disponibles</option>';
      return;
    }
    sel.innerHTML = '<option value="">Seleccione credito...</option>';
    creditos.forEach(c => {
      const disponible = c.MONTODISPONIBLE || (c.MONTOORIGINAL - c.MONTOUSADO);
      const fechaStr = c.FECHA ? new Date(c.FECHA).toLocaleDateString('es-AR') : '';
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ guid: c.GUID.trim(), disponible });
      opt.textContent = `${fechaStr} - Disponible: ${FormatMoney(disponible)} (Original: ${FormatMoney(c.MONTOORIGINAL)})`;
      sel.appendChild(opt);
    });
    // Auto-fill importe con disponible del primer credito
    sel.onchange = () => {
      if (sel.value) {
        const d = JSON.parse(sel.value);
        const restante = GetTotalACobrar() - POS.GetTotalPagos();
        document.getElementById('pagoImporte').value = Math.min(d.disponible, restante).toFixed(2);
      }
    };
  } catch (err) {
    sel.innerHTML = '<option value="">Error al cargar creditos</option>';
  }
}

// ── Generar comprobante PDF de devolucion con QR ──
async function GenerarComprobantePDF(guidDevolucion) {
  try {
    const det = await API.GetDevolucionDetalle(guidDevolucion);
    if (!det.devolucion) { ShowToast('Error', 'No se encontro la devolucion', 'error'); return; }

    const d = det.devolucion;
    const items = det.items;
    const credito = det.credito;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // ── Header ──
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE DE DEVOLUCION', pageW / 2, y, { align: 'center' });
    y += 8;

    if (d.NotaCreditoNumero) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Nota de Credito: ${(d.NotaCreditoNumero || '').trim()}`, pageW / 2, y, { align: 'center' });
      y += 7;
    }

    doc.setDrawColor(0);
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    // ── Info general ──
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fechaDev = d.FECHA ? ClarionToDateStr(d.FECHA) : '';
    const horaDev = d.HORA ? ClarionTimeToStr(d.HORA) : '';
    doc.text(`Fecha: ${fechaDev}  ${horaDev}`, margin, y);
    doc.text(`Sucursal: ${(d.Sucursal || '').trim()}`, pageW / 2, y);
    y += 5;
    doc.text(`Cliente: ${(d.ClienteNombre || d.NOMBRE || '').trim()}`, margin, y);
    if (d.ClienteCuit) doc.text(`CUIT: ${(d.ClienteCuit || '').trim()}`, pageW / 2, y);
    y += 5;
    doc.text(`ID: ${(d.GUID || '').trim()}`, margin, y);
    y += 7;

    doc.line(margin, y, pageW - margin, y);
    y += 5;

    // ── Tabla items ──
    doc.setFont('helvetica', 'bold');
    doc.text('Codigo', margin, y);
    doc.text('Descripcion', margin + 30, y);
    doc.text('Talle', margin + 100, y);
    doc.text('Cant.', margin + 118, y);
    doc.text('P.Unit.', margin + 133, y);
    doc.text('Subtotal', margin + 155, y);
    y += 2;
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    items.forEach(item => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text((item.ARTICULO || '').trim().substring(0, 15), margin, y);
      doc.text((item.DESCRIPCION || '').trim().substring(0, 35), margin + 30, y);
      doc.text(String(item.TALLE || 0), margin + 100, y);
      doc.text(String(item.CANTIDAD || 0), margin + 118, y);
      doc.text(FormatMoney(item.PRECIOUNITARIO || 0), margin + 133, y);
      doc.text(FormatMoney(item.TOTAL || 0), margin + 155, y);
      y += 5;
    });

    y += 3;
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    // ── Total ──
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${FormatMoney(d.TOTAL || 0)}`, pageW - margin, y, { align: 'right' });
    y += 7;

    if (credito) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const disponible = credito.MONTODISPONIBLE || (credito.MONTOORIGINAL - credito.MONTOUSADO);
      doc.text(`Credito disponible: ${FormatMoney(disponible)}`, pageW - margin, y, { align: 'right' });
      y += 5;
      doc.text(`Estado: ${credito.ESTADO}`, pageW - margin, y, { align: 'right' });
      y += 10;
    }

    // ── Vigencia ──
    const fechaEmision = d.FECHA ? ClarionToDate(d.FECHA) : new Date();
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
    const fechaVencStr = fechaVencimiento.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, pageW - margin * 2, 16, 2, 2, 'S');
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    doc.text(`Valido por 6 (seis) MESES. (${fechaVencStr})`, pageW / 2, y + 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 22;

    // ── QR Code ──
    const qrData = JSON.stringify({
      g: (d.GUID || '').trim(),
      f: fechaDev,
      h: horaDev,
      m: d.TOTAL || 0,
      nc: d.NotaCreditoNumero ? (d.NotaCreditoNumero || '').trim() : undefined,
      v: fechaVencStr,
    });

    const qr = qrcode(0, 'M');
    qr.addData(qrData);
    qr.make();
    const qrSize = 40;
    const qrX = (pageW - qrSize) / 2;
    const qrImg = qr.createDataURL(4, 0);
    doc.addImage(qrImg, 'PNG', qrX, y, qrSize, qrSize);
    y += qrSize + 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Escanee el QR para verificar este comprobante', pageW / 2, y, { align: 'center' });

    // Abrir en nueva ventana
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  } catch (err) {
    ShowToast('Error', 'No se pudo generar el comprobante: ' + err.message, 'error');
  }
}

// ── Helpers para formato Clarion en PDF ──
function ClarionToDate(clarionDate) {
  const base = new Date(1800, 11, 28);
  return new Date(base.getTime() + (clarionDate + 1) * 86400000);
}

function ClarionToDateStr(clarionDate) {
  if (!clarionDate) return '';
  return ClarionToDate(clarionDate).toLocaleDateString('es-AR');
}

function ClarionTimeToStr(clarionTime) {
  if (!clarionTime) return '';
  const totalSecs = Math.floor(clarionTime / 100);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ============================================================================
// SECCION: Cambios de Mercaderia
// ============================================================================
function RenderCambios(container) {
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-arrow-repeat me-2"></i>Cambios de Mercaderia</h4>
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabNuevoCambio">Nuevo Cambio</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabMovCamb">Movimientos</a></li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="tabNuevoCambio">
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
        <div class="tab-pane fade" id="tabMovCamb">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label">Desde</label>
                  <input type="date" id="movCambDesde" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hasta</label>
                  <input type="date" id="movCambHasta" class="form-control" value="${TodayISO()}">
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" onclick="BuscarMovCambios()"><i class="bi bi-search me-1"></i>Buscar</button>
                </div>
              </div>
            </div>
          </div>
          <div id="movCambResultado"></div>
        </div>
      </div>
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

async function BuscarMovCambios() {
  const desde = document.getElementById('movCambDesde').value;
  const hasta = document.getElementById('movCambHasta').value;
  const div = document.getElementById('movCambResultado');
  div.innerHTML = '<div class="text-center py-3"><div class="spinner-border"></div></div>';
  try {
    const data = await API.GetCambiosList({ desde, hasta, guidSucursal: State.sucursalActual });
    if (data.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron cambios para esta fecha.</div>';
      return;
    }
    const totalCamb = data.reduce((sum, d) => sum + (d.TOTAL || 0), 0);
    div.innerHTML = `
      <div class="alert alert-light border mb-3 d-flex justify-content-between align-items-center">
        <span><strong>${data.length}</strong> cambio${data.length !== 1 ? 's' : ''}</span>
        <span class="fw-bold text-warning">Total: ${FormatMoney(totalCamb)}</span>
      </div>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th class="text-end">Total</th><th></th></tr>
            </thead>
            <tbody>
              ${data.map((d, idx) => `
                <tr id="movCambRow${idx}">
                  <td>${FormatFechaInt(d.FECHA)}</td>
                  <td>${FormatHoraInt(d.HORA)}</td>
                  <td>${(d.NOMBRE || 'Consumidor Final').trim()}</td>
                  <td class="text-end fw-bold">${FormatMoney(d.TOTAL)}</td>
                  <td><button class="btn btn-sm btn-outline-info" onclick="VerDetalleCambio('${d.GUID}','movCambRow${idx}')"><i class="bi bi-eye"></i></button></td>
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

async function VerDetalleCambio(guid, rowId) {
  const row = document.getElementById(rowId);
  const existing = row.nextElementSibling;
  if (existing && existing.classList.contains('detalle-row')) {
    existing.remove();
    return;
  }
  try {
    const det = await API.GetCambioDetalle(guid);
    const d = det.cambio;
    const items = det.items || [];
    const guidNCCambio = d ? (d.GuidNotaCredito || '').trim() : '';
    const ncNumeroCambio = d ? (d.NotaCreditoNumero || '').trim() : '';
    const ncTipoCambio = d ? (d.NotaCreditoTipo || '').trim() : '';
    const tieneNCCambio = guidNCCambio && guidNCCambio !== '' && ncNumeroCambio;
    const tr = document.createElement('tr');
    tr.classList.add('detalle-row');
    tr.innerHTML = `<td colspan="5" class="p-0">
      <div class="bg-light p-3 border-top">
        <div class="row mb-2">
          <div class="col-md-6"><small class="text-muted">Sucursal:</small> <strong>${d ? (d.Sucursal || '-') : '-'}</strong></div>
          <div class="col-md-6"><small class="text-muted">Tipo:</small> <strong>${d ? (d.TIPOOPERACION || '').trim() : '-'}</strong></div>
        </div>
        <table class="table table-sm table-bordered mb-2">
          <thead><tr><th>Codigo</th><th>Descripcion</th><th>Talle</th><th class="text-center">Cant.</th><th class="text-end">P.Unit.</th><th class="text-end">Subtotal</th></tr></thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td><code>${(it.ARTICULO || '').trim()}</code></td>
                <td>${(it.DESCRIPCION || '').trim()}</td>
                <td>${it.TALLE || '-'}</td>
                <td class="text-center">${it.CANTIDAD}</td>
                <td class="text-end">${FormatMoney(it.PRECIOUNITARIO)}</td>
                <td class="text-end">${FormatMoney(it.TOTAL)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${tieneNCCambio ? `<div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" onclick="MostrarFactura('${guidNCCambio}')"><i class="bi bi-receipt me-1"></i>${ncTipoCambio} ${ncNumeroCambio}</button>
        </div>` : ''}
      </div>
    </td>`;
    row.after(tr);
  } catch (err) {
    ShowToast('Error', err.message, 'error');
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
    const clienteActualCamb = !esCF ? { nombre: (r.NOMBRE || '').trim(), guid: (r.GUIDCLIENTES || '').trim() } : null;
    const form = document.getElementById('cambFormulario');
    form.classList.remove('d-none');
    form.innerHTML = `
      <div class="card shadow-sm border-warning">
        <div class="card-header bg-warning text-dark"><h6 class="mb-0"><i class="bi bi-arrow-repeat me-2"></i>Seleccione articulos a cambiar</h6></div>
        <div class="card-body">
          ${RenderClienteSelectorHTML('camb', clienteActualCamb)}
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
                  <td class="text-center"><input type="number" class="form-control form-control-sm qty-input cambQty d-inline-block" style="width:70px" data-idx="${i}" value="${item.RESTANTE}" min="1" max="${item.RESTANTE}"></td>
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
    InitClienteSelectorEvents('camb');
    if (clienteActualCamb) {
      _devCambioCliente = { GUID: clienteActualCamb.guid, NOMBRE: clienteActualCamb.nombre };
    }
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

function ToggleAllCambio(checked) {
  document.querySelectorAll('.cambCheck').forEach(cb => { cb.checked = checked; });
}

function PrepararCambioParaPOS(guidRemitoOriginal, originalItems, guidCliente, nombre) {
  // Los cambios SIEMPRE requieren cliente (queda en CTA CTE)
  if (_devCambioCliente) {
    guidCliente = _devCambioCliente.GUID;
    nombre = (_devCambioCliente.NOMBRE || '').trim();
  }
  if (!guidCliente || guidCliente.trim() === '') {
    ShowToast('Aviso', 'Debe seleccionar un cliente para el cambio (obligatorio para cuenta corriente)', 'error');
    return;
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
  let errorCantidad = false;
  checks.forEach(cb => {
    const idx = parseInt(cb.dataset.idx);
    const qty = parseInt(document.querySelectorAll('.cambQty')[idx].value) || 1;
    const orig = originalItems[idx];
    const maxDisponible = orig.RESTANTE || 0;
    if (qty > maxDisponible || qty < 1) {
      errorCantidad = true;
      ShowToast('Error', `"${(orig.DESCRIPCION || orig.ARTICULO || '').trim()}": cantidad a cambiar (${qty}) supera la disponible (${maxDisponible})`, 'error');
      return;
    }
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
  if (errorCantidad) return;

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
      guidUsuario: (State.usuario && State.usuario.GUID) || '',
      nombre: cambio.nombre,
      motivo: cambio.motivo,
      tipoCambio: cambio.tipoCambio,
      itemsCambio: cambio.itemsCambio,
      itemsVenta: POS.items,
      emitirFactura: POS.emitirFactura,
      cuit: POS.cliente ? (POS.cliente.CUIT || '').trim() : '',
    };

    // Si hay diferencia a cobrar, enviar los pagos
    if (cambio.diferencia > 0.01 && POS.pagos.length > 0) {
      payload.pagos = POS.pagos;
    }

    const result = await API.CreateCambioConVenta(payload);

    delete POS._cambioData;
    _devCambioCliente = null;
    const msgDif = result.diferencia > 0 ? ` | Diferencia cobrada: ${FormatMoney(result.diferencia)}` : '';
    const msgFavor = result.saldoAFavor > 0 ? ` | Saldo a favor: ${FormatMoney(result.saldoAFavor)}` : '';
    const msgFac = result.factura ? ` | Factura: ${result.factura}` : '';
    const msgNC = result.notaCredito ? ` | NC: ${result.notaCredito}` : '';
    ShowToast('Cambio exitoso',
      `Cambio: ${FormatMoney(result.totalCambio)} | Nueva venta: ${FormatMoney(result.totalVenta)}${msgDif}${msgFavor}${msgFac}${msgNC} | Pago: ${result.formaPago}`,
      'success');
    POS.Reset();
    RenderPOS(document.getElementById('mainContent'));

    // Mostrar NC si se emitió, o factura de la venta nueva
    if (result.guidNotaCredito) {
      MostrarFactura(result.guidNotaCredito);
    } else if (result.guidFactura) {
      MostrarFactura(result.guidFactura);
    }
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
          <tr><th>Código</th><th>Descripción</th><th>Talle</th><th>Color</th><th class="text-center">Cantidad</th><th>Origen</th><th>Destino</th></tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td><code>${(i.CodigoArticuloRel || '').trim()}</code></td>
              <td>${(i.Descripcion || '').trim() || '-'}</td>
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
  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Medio de Pago <span class="text-danger">*</span></label>
                  <select id="gastoMedioPago" class="form-select">
                    <option value="">Cargando...</option>
                  </select>
                </div>
                <div class="col-md-4 d-none" id="divGastoCuentaBancaria">
                  <label class="form-label fw-semibold">Cuenta Bancaria</label>
                  <select id="gastoCuentaBancaria" class="form-select"></select>
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
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Medio de Pago <span class="text-danger">*</span></label>
                  <select id="adelantoMedioPago" class="form-select">
                    <option value="">Cargando...</option>
                  </select>
                </div>
                <div class="col-md-4 d-none" id="divAdelantoCuentaBancaria">
                  <label class="form-label fw-semibold">Cuenta Bancaria</label>
                  <select id="adelantoCuentaBancaria" class="form-select"></select>
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
  CargarMediosPagoEgreso();
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

function CargarMediosPagoEgreso() {
  // Filtrar tipos A (ambos) y E (egreso)
  const tiposEgreso = State.tiposCobrosPagos.filter(t => {
    const mov = (t.TIPOMOVIMIENTO || '').trim();
    return mov === 'A' || mov === 'E';
  });
  const opciones = '<option value="">Seleccione...</option>'
    + tiposEgreso.map(t => {
      const desc = (t.DESCRIPCION || '').trim();
      return `<option value="${t.GUID.trim()}" data-tipo="${t.TIPO}">${desc}</option>`;
    }).join('');

  const selGasto = document.getElementById('gastoMedioPago');
  if (selGasto) {
    selGasto.innerHTML = opciones;
    selGasto.onchange = function () { OnMedioPagoEgresoChange('gastoMedioPago', 'divGastoCuentaBancaria', 'gastoCuentaBancaria'); };
  }
  const selAdelanto = document.getElementById('adelantoMedioPago');
  if (selAdelanto) {
    selAdelanto.innerHTML = opciones;
    selAdelanto.onchange = function () { OnMedioPagoEgresoChange('adelantoMedioPago', 'divAdelantoCuentaBancaria', 'adelantoCuentaBancaria'); };
  }
}

function OnMedioPagoEgresoChange(selId, divCuentaId, selCuentaId) {
  const sel = document.getElementById(selId);
  const opt = sel.options[sel.selectedIndex];
  const tipoNum = parseInt(opt?.dataset?.tipo) || 0;
  const divCuenta = document.getElementById(divCuentaId);
  const selCuenta = document.getElementById(selCuentaId);

  // Transferencia (4) o Deposito (8) o Cheque Propio (6) → mostrar cuenta bancaria
  const requiereCuenta = tipoNum === 4 || tipoNum === 8 || tipoNum === 6;
  if (divCuenta && selCuenta) {
    if (requiereCuenta) {
      divCuenta.classList.remove('d-none');
      const cuentasBanco = State.bancosCuentas.filter(c =>
        !(c.TIPOCUENTA || '').trim().toUpperCase().startsWith('CAJA')
      );
      selCuenta.innerHTML = '<option value="">-- Seleccione cuenta --</option>'
        + cuentasBanco.map(c => {
          const nombre = (c.NUMEROCUENTA || c.ALIAS || '').trim();
          const tipo = (c.TIPOCUENTA || '').trim();
          const banco = (c.NombreBanco || '').trim();
          return `<option value="${c.GUID.trim()}" data-guidbancos="${(c.GUIDBANCOS || '').trim()}">${banco ? banco + ' - ' : ''}${nombre} (${tipo})</option>`;
        }).join('');
    } else {
      divCuenta.classList.add('d-none');
      selCuenta.innerHTML = '';
    }
  }
}

function GetMedioPagoEgresoData(selId, selCuentaId) {
  const sel = document.getElementById(selId);
  if (!sel || !sel.value) return null;
  const opt = sel.options[sel.selectedIndex];
  const desc = (opt.textContent || '').trim();
  const tipoNum = parseInt(opt.dataset.tipo) || 0;

  let guidBancosCuentas = '';
  let guidBanco = '';

  // Si es EFECTIVO, auto-asignar cuenta caja
  if (desc.toUpperCase() === 'EFECTIVO') {
    const cuentaCaja = GetCuentaCajaSucursal();
    if (cuentaCaja) {
      guidBancosCuentas = cuentaCaja.GUID.trim();
      guidBanco = (cuentaCaja.GUIDBANCOS || '').trim();
    }
  }

  // Si requiere cuenta bancaria seleccionada
  const requiereCuenta = tipoNum === 4 || tipoNum === 8 || tipoNum === 6;
  if (requiereCuenta) {
    const selCuenta = document.getElementById(selCuentaId);
    if (selCuenta && selCuenta.value) {
      guidBancosCuentas = selCuenta.value.trim();
      const optCta = selCuenta.options[selCuenta.selectedIndex];
      guidBanco = (optCta.dataset.guidbancos || '').trim();
    }
  }

  return { descripcion: desc, guidBancosCuentas, guidBanco };
}

async function ConfirmarGasto() {
  const rubro = document.getElementById('gastoRubro').value;
  const descripcion = (document.getElementById('gastoDescripcion').value || '').trim();
  const importe = parseFloat(document.getElementById('gastoImporte').value) || 0;

  const medioPago = GetMedioPagoEgresoData('gastoMedioPago', 'gastoCuentaBancaria');

  if (!rubro) { ShowToast('Aviso', 'Seleccione un rubro', 'error'); return; }
  if (!descripcion) { ShowToast('Aviso', 'Ingrese una descripcion', 'error'); return; }
  if (importe <= 0) { ShowToast('Aviso', 'El importe debe ser mayor a 0', 'error'); return; }
  if (!medioPago) { ShowToast('Aviso', 'Seleccione un medio de pago', 'error'); return; }

  try {
    await API.CreateGasto({
      guidSucursal: State.sucursalActual,
      rubro,
      descripcion: `${descripcion}`,
      importe,
      medioPago: medioPago.descripcion,
      guidBancosCuentas: medioPago.guidBancosCuentas,
      guidBanco: medioPago.guidBanco,
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

  const medioPago = GetMedioPagoEgresoData('adelantoMedioPago', 'adelantoCuentaBancaria');

  if (!guidEmpleado) { ShowToast('Aviso', 'Seleccione un empleado', 'error'); return; }
  if (importe <= 0) { ShowToast('Aviso', 'El importe debe ser mayor a 0', 'error'); return; }
  if (!medioPago) { ShowToast('Aviso', 'Seleccione un medio de pago', 'error'); return; }

  try {
    await API.CreateAdelanto({
      guidSucursal: State.sucursalActual,
      guidEmpleado,
      importe,
      observaciones,
      mesImputacion,
      medioPago: medioPago.descripcion,
      guidBancosCuentas: medioPago.guidBancosCuentas,
      guidBanco: medioPago.guidBanco,
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
  condiciones: [],

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
    const precio = art.PRECIOCOSTO || 0;
    Compra.items.push({
      guidArticulo: art.GUID,
      guidMovimientoArticulo: mov ? mov.GUID : '',
      codigoArticulo: (art.CODIGOARTICULO || '').trim(),
      descripcion: (art.DESCRIPCION || '').trim(),
      talle: mov ? mov.NUMERO : 0,
      color: mov ? (mov.COLOR || '').trim() : '',
      cantidad: 1,
      precioUnitario: precio,
      estado: 'NUEVO',
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

async function RenderCompras(container) {
  Compra.Reset();
  try { Compra.condiciones = await API.GetCondicionArticulos(); } catch (_) { Compra.condiciones = [{ ESTADO: 'NUEVO' }]; }
  container.innerHTML = `
    <div class="fade-in">
      <h4 class="mb-3"><i class="bi bi-truck me-2"></i>Compras</h4>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabNuevaCompra">Recepcion de Mercaderia</a></li>
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
                  <input type="text" id="compraProvSearch" class="form-control" placeholder="Buscar proveedor por nombre o CUIT..." oninput="BuscarProveedoresCompraDebounced()">
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
                <div class="col">
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                    <input type="text" id="compraSearch" class="form-control" placeholder="Escanear o buscar articulo...">
                    <button class="btn btn-primary" onclick="Compra.BuscarArticulo(document.getElementById('compraSearch').value.trim())">
                      <i class="bi bi-plus-circle"></i> Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div id="compraTallesContainer" class="mb-3"></div>

              <table class="table table-hover">
                <thead class="table-light">
                  <tr><th>Codigo</th><th>Descripcion</th><th>Talle</th><th>Color</th><th>Estado</th><th class="text-center">Cant.</th><th class="text-end">P.Costo</th><th class="text-end">Subtotal</th><th></th></tr>
                </thead>
                <tbody id="compraItemsBody">
                  <tr><td colspan="9" class="text-center text-muted py-3">Sin articulos</td></tr>
                </tbody>
                <tfoot>
                  <tr class="table-success"><th colspan="7" class="text-end">TOTAL:</th><th class="text-end fw-bold" id="compraTotalFooter">$0.00</th><th></th></tr>
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
    body.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3">Sin articulos</td></tr>';
    document.getElementById('compraTotalFooter').textContent = '$0.00';
  } else {
    let total = 0;
    body.innerHTML = Compra.items.map((item, i) => {
      const subtotal = item.cantidad * item.precioUnitario;
      total += subtotal;
      const estadoOpts = Compra.condiciones.map(c => {
        const est = (c.ESTADO || '').trim();
        return `<option value="${est}" ${item.estado === est ? 'selected' : ''}>${est}</option>`;
      }).join('');
      return `
        <tr>
          <td><code>${item.codigoArticulo}</code></td>
          <td>${item.descripcion}</td>
          <td>${item.talle || '-'}</td>
          <td>${item.color || '-'}</td>
          <td>
            <select class="form-select form-select-sm" style="width:120px"
              onchange="Compra.items[${i}].estado = this.value;">
              ${estadoOpts}
            </select>
          </td>
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

let _compraProvTimer = null;
function BuscarProveedoresCompraDebounced() {
  clearTimeout(_compraProvTimer);
  _compraProvTimer = setTimeout(BuscarProveedoresCompra, 300);
}

async function BuscarProveedoresCompra() {
  const texto = (document.getElementById('compraProvSearch').value || '').trim();
  if (!texto) { document.getElementById('compraProvLista').innerHTML = ''; return; }
  try {
    const sucActual = State.sucursales.find(s => s.GUID === State.sucursalActual);
    const guidConfig = sucActual ? (sucActual.GUIDCONFIGURACION || '').trim() : '';
    const proveedores = await API.GetProveedores(texto, guidConfig);
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
  const sinEstado = Compra.items.find(item => !item.estado || !item.estado.trim());
  if (sinEstado) { ShowToast('Aviso', `El articulo "${sinEstado.codigoArticulo}" no tiene estado asignado`, 'error'); return; }

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
// SECCIÓN: CLIENTES — Browse + Movimientos + Comprobantes
// ============================================================================
let _clientesPage = 1;
let _clientesSearchTimer = null;

function RenderClientes(container) {
  _clientesPage = 1;
  container.innerHTML = `
    <h4 class="mb-3"><i class="bi bi-people me-2"></i>Clientes</h4>
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <input type="text" id="clienteSearch" class="form-control" placeholder="Buscar por nombre, documento o CUIT..." oninput="OnClienteSearchInput()">
      </div>
    </div>
    <div id="clientesResultados"><div class="text-center py-4"><div class="spinner-border text-primary"></div></div></div>
  `;
  BuscarClientes();
}

function OnClienteSearchInput() {
  clearTimeout(_clientesSearchTimer);
  _clientesSearchTimer = setTimeout(() => { _clientesPage = 1; BuscarClientes(); }, 300);
}

async function BuscarClientes(page) {
  if (page) _clientesPage = page;
  const search = (document.getElementById('clienteSearch')?.value || '').trim();
  const div = document.getElementById('clientesResultados');
  try {
    const resp = await API.GetClientes(search || undefined, _clientesPage, 30);
    const clientes = resp.data;
    const pag = resp.pagination;
    if (clientes.length === 0) { div.innerHTML = '<div class="alert alert-info">No se encontraron clientes.</div>'; return; }

    const paginacion = pag.totalPages > 1 ? `
      <div class="d-flex justify-content-between align-items-center mt-2">
        <small class="text-muted">Mostrando ${(pag.page - 1) * pag.limit + 1}-${Math.min(pag.page * pag.limit, pag.total)} de ${pag.total}</small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item ${pag.page <= 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="BuscarClientes(${pag.page - 1});return false">&laquo;</a></li>
            ${Array.from({length: pag.totalPages}, (_, i) => i + 1).filter(p => p === 1 || p === pag.totalPages || Math.abs(p - pag.page) <= 2).map(p =>
              `<li class="page-item ${p === pag.page ? 'active' : ''}"><a class="page-link" href="#" onclick="BuscarClientes(${p});return false">${p}</a></li>`
            ).join('')}
            <li class="page-item ${pag.page >= pag.totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="BuscarClientes(${pag.page + 1});return false">&raquo;</a></li>
          </ul>
        </nav>
      </div>
    ` : '';

    div.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr><th>Nombre</th><th>CUIT</th><th>Documento</th><th>Celular</th><th>Email</th><th class="text-end">L&iacute;mite Cr&eacute;dito</th><th class="text-end">Saldo</th><th></th></tr>
          </thead>
          <tbody>
            ${clientes.map(c => {
              const nombre = (c.NOMBRE || '').trim();
              const saldo = c.SALDO || 0;
              const limite = c.LIMITE_CREDITO;
              const limiteText = limite == null ? '-' : limite < 0 ? 'Ilimitado' : FormatMoney(limite);
              return `<tr>
                <td class="fw-semibold">${nombre}</td>
                <td>${(c.CUIT || '').trim()}</td>
                <td>${(c.DOCUMENTO || '').trim()}</td>
                <td>${(c.CELULAR || '').trim()}</td>
                <td>${(c.EMAIL || '').trim()}</td>
                <td class="text-end">${limiteText}</td>
                <td class="text-end ${saldo > 0 ? 'text-danger' : saldo < 0 ? 'text-success' : ''}">${FormatMoney(saldo)}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" onclick="VerMovimientosCliente('${c.GUID.trim()}', '${nombre.replace(/'/g, "\\'")}')">
                    <i class="bi bi-list-ul"></i>
                  </button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${paginacion}
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

async function VerMovimientosCliente(guid, nombre) {
  const hoy = TodayISO();
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
  const hace30dias = `${d30.getFullYear()}-${String(d30.getMonth() + 1).padStart(2, '0')}-${String(d30.getDate()).padStart(2, '0')}`;
  const body = document.getElementById('detalleVentaBody');
  document.querySelector('#modalDetalleVenta .modal-title').innerHTML = `<i class="bi bi-person me-2"></i>${nombre}`;
  body.innerHTML = `
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabCliDeuda">Deuda Activa</a></li>
      <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabCliComp">Comprobantes</a></li>
      <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabCliMov">Movimientos Cta. Cte.</a></li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane fade show active" id="tabCliDeuda"><div id="cliDeudaResultados"></div></div>
      <div class="tab-pane fade" id="tabCliComp">
        <div class="row g-2 mb-3 align-items-end">
          <div class="col-md-3"><label class="form-label mb-0">Desde</label><input type="date" id="cliCompDesde" class="form-control form-control-sm" value="${hoy}"></div>
          <div class="col-md-3"><label class="form-label mb-0">Hasta</label><input type="date" id="cliCompHasta" class="form-control form-control-sm" value="${hoy}"></div>
          <div class="col-md-2"><button class="btn btn-sm btn-primary w-100" onclick="CargarComprobantesCliente('${guid}')"><i class="bi bi-search me-1"></i>Buscar</button></div>
        </div>
        <div id="cliCompResultados"></div>
      </div>
      <div class="tab-pane fade" id="tabCliMov">
        <div class="row g-2 mb-3 align-items-end">
          <div class="col-md-3"><label class="form-label mb-0">Desde</label><input type="date" id="cliMovDesde" class="form-control form-control-sm" value="${hace30dias}"></div>
          <div class="col-md-3"><label class="form-label mb-0">Hasta</label><input type="date" id="cliMovHasta" class="form-control form-control-sm" value="${hoy}"></div>
          <div class="col-md-2"><button class="btn btn-sm btn-primary w-100" onclick="CargarMovimientosCliente('${guid}')"><i class="bi bi-search me-1"></i>Buscar</button></div>
        </div>
        <div id="cliMovResultados"></div>
      </div>
    </div>
  `;
  new bootstrap.Modal(document.getElementById('modalDetalleVenta')).show();
  CargarDeudaActiva(guid);
}

// ── Deuda Activa (Tab 1) ──
async function CargarDeudaActiva(guid) {
  const div = document.getElementById('cliDeudaResultados');
  div.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';
  try {
    const [deudas, saldoData] = await Promise.all([
      API.GetClienteDeudaActiva(guid),
      API.GetClienteSaldo(guid),
    ]);
    const saldoActual = saldoData.Saldo || 0;
    window._deudaActivaGuid = guid;

    if (deudas.length === 0) {
      div.innerHTML = `<div class="alert alert-light border py-2 mb-2"><strong>Saldo actual (Cta. Cte.):</strong> <span class="${saldoActual > 0 ? 'text-danger' : saldoActual < 0 ? 'text-success' : ''} fw-bold">${FormatMoney(saldoActual)}</span></div>
        <div class="alert alert-success py-2"><i class="bi bi-check-circle me-1"></i>Sin deuda activa.</div>`;
    } else {
      let totalDeuda = 0;
      div.innerHTML = `
        <div class="alert alert-light border py-2 mb-2 d-flex justify-content-between align-items-center">
          <span><strong>Saldo actual (Cta. Cte.):</strong> <span class="${saldoActual > 0 ? 'text-danger' : saldoActual < 0 ? 'text-success' : ''} fw-bold">${FormatMoney(saldoActual)}</span></span>
          <button class="btn btn-success btn-sm" id="btnCobrarDeuda" onclick="CobrarDeudaSeleccionada('${guid}')" disabled>
            <i class="bi bi-cash-stack me-1"></i>Cobrar seleccionados
          </button>
        </div>
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr>
              <th><input type="checkbox" id="deudaCheckAll" onchange="ToggleAllDeuda(this.checked)"></th>
              <th>Fecha</th>
              <th>Descripcion</th>
              <th>Comprobante</th>
              <th class="text-end">Original</th>
              <th class="text-end">Pagado</th>
              <th class="text-end">Pendiente</th>
            </tr>
          </thead>
          <tbody>
            ${deudas.map((d, i) => {
              const debe = d.DEBE || 0;
              const haber = d.HABER || 0;
              const factura = (d.NUMERO_FACTURA || '').trim();
              const facTipo = (d.FacturaTipo || '').trim();
              const esCredito = haber > 0 && debe === 0;
              const badgeColor = esCredito ? 'success' : 'info text-dark';
              const creditoOrig = d.CreditoOriginal || 0;
              const creditoUsado = d.CreditoUsado || 0;
              const original = esCredito && creditoOrig > 0 ? creditoOrig : (debe > 0 && haber > 0 ? debe - haber : (debe > 0 ? debe : haber));
              const pagado = esCredito ? creditoUsado : 0;
              const pendiente = original - pagado;
              const signo = esCredito ? -1 : 1;
              totalDeuda += pendiente * signo;
              return `<tr class="${esCredito ? 'table-success' : ''}">
                <td><input type="checkbox" class="deudaCheck" data-idx="${i}" data-guid="${(d.GUID || '').trim()}" data-max="${pendiente * signo}" data-factura="${factura}" onchange="OnDeudaCheckChange(this)"></td>
                <td>${FormatFechaInt(d.FECHA)}</td>
                <td class="small">${(d.CONCEPTO || '').trim()}</td>
                <td>${factura ? `<span class="badge bg-${badgeColor}">${facTipo} ${factura}</span>` : '<span class="text-muted">-</span>'}</td>
                <td class="text-end ${esCredito ? 'text-success' : 'text-danger'}">${FormatMoney(original)}</td>
                <td class="text-end">${pagado > 0 ? FormatMoney(pagado) : '<span class="text-muted">-</span>'}</td>
                <td class="text-end fw-semibold ${esCredito ? 'text-success' : 'text-danger'}">${FormatMoney(pendiente)}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot class="table-light">
            <tr class="fw-bold">
              <td colspan="6" class="text-end">Saldo deuda activa:</td>
              <td class="text-end ${totalDeuda > 0 ? 'text-danger' : 'text-success'}">${FormatMoney(totalDeuda)}</td>
            </tr>
            <tr id="deudaSelTotal" class="d-none fw-bold">
              <td colspan="6" class="text-end">Total a cobrar:</td>
              <td class="text-end text-primary" id="deudaSelImporte"></td>
            </tr>
          </tfoot>
        </table>`;
    }
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

function ToggleAllDeuda(checked) {
  document.querySelectorAll('.deudaCheck').forEach(cb => {
    cb.checked = checked;
    OnDeudaCheckChange(cb);
  });
}

function OnDeudaCheckChange(cb) {
  const idx = cb.dataset.idx;
  const input = document.querySelector(`.deudaCobrar[data-idx="${idx}"]`);
  if (cb.checked) {
    input.classList.remove('d-none');
  } else {
    input.classList.add('d-none');
    // Restaurar al máximo cuando se desmarca
    input.value = Math.abs(parseFloat(cb.dataset.max) || 0).toFixed(2);
  }
  ActualizarTotalDeudaSel();
}

function ActualizarTotalDeudaSel() {
  const checks = document.querySelectorAll('.deudaCheck:checked');
  let total = 0;
  checks.forEach(cb => {
    const idx = cb.dataset.idx;
    const input = document.querySelector(`.deudaCobrar[data-idx="${idx}"]`);
    const max = parseFloat(cb.dataset.max) || 0;
    let valor = parseFloat(input.value) || 0;
    // Para débitos (max > 0): valor positivo; para créditos (max < 0): valor negativo
    if (max > 0) {
      if (valor > max) { valor = max; input.value = max.toFixed(2); }
      if (valor < 0.01) { valor = 0.01; input.value = '0.01'; }
      total += valor;
    } else {
      // Créditos: restar del total
      total += max; // max ya es negativo
    }
  });
  const row = document.getElementById('deudaSelTotal');
  const imp = document.getElementById('deudaSelImporte');
  const btn = document.getElementById('btnCobrarDeuda');
  if (checks.length > 0) {
    row.classList.remove('d-none');
    imp.textContent = FormatMoney(total);
    if (btn) btn.disabled = false;
  } else {
    row.classList.add('d-none');
    if (btn) btn.disabled = true;
  }
}

async function ConfirmarCobroDeuda() {
  const data = POS._cobroDeudaData;
  if (!data) return;
  try {
    const payload = {
      guidCliente: data.guidCliente,
      guidSucursal: State.sucursalActual,
      guidUsuario: (State.usuario && State.usuario.GUID) || '',
      items: data.items,
      pagos: POS.pagos,
      total: data.total,
      emitirFactura: POS.emitirFactura || false,
      nombre: POS.cliente ? (POS.cliente.NOMBRE || '').trim() : '',
      cuit: POS.cliente ? (POS.cliente.CUIT || '').trim() : '',
    };
    const result = await API.CobroDeuda(payload);
    ShowToast('Cobro exitoso', `Se registró el cobro de ${FormatMoney(data.total)}`, 'success');
    if (result.guidFactura) {
      MostrarFactura(result.guidFactura);
    }
    POS._modoCobroDeuda = false;
    POS._cobroDeudaData = null;
    POS.pagos = [];
    POS.emitirFactura = false;
    // Refrescar browse de clientes si está visible
    if (document.getElementById('clientesResultados')) BuscarClientes();
  } catch (err) {
    ShowToast('Error', err.message, 'error');
  }
}

async function CobrarDeudaSeleccionada(guidCliente) {
  const checks = document.querySelectorAll('.deudaCheck:checked');
  if (checks.length === 0) { ShowToast('Aviso', 'Seleccione al menos un comprobante', 'info'); return; }
  let total = 0;
  const items = [];
  let tieneDeuda = false;
  checks.forEach(cb => {
    const idx = cb.dataset.idx;
    const input = document.querySelector(`.deudaCobrar[data-idx="${idx}"]`);
    const max = parseFloat(cb.dataset.max) || 0;
    let valor = parseFloat(input.value) || 0;
    if (max > 0) {
      if (valor > max) valor = max;
      total += valor;
      tieneDeuda = true;
    } else {
      total += max;
      valor = Math.abs(max);
    }
    items.push({ guid: cb.dataset.guid, importe: valor, esParcial: max > 0 && valor < max, factura: (cb.dataset.factura || '').trim() });
  });
  if (!tieneDeuda) { ShowToast('Aviso', 'No se pueden cobrar solo créditos a favor. Seleccione al menos un comprobante de deuda.', 'warning'); return; }

  // Verificar si todos los comprobantes seleccionados ya tienen factura fiscal
  const todosConFactura = items.length > 0 && items.every(it => it.factura !== '');

  // Auto-setear cliente para que el modal de pagos no pida re-seleccionarlo
  if (!POS.cliente || POS.cliente.GUID.trim() !== guidCliente.trim()) {
    try {
      POS.cliente = await API.GetClienteByGuid(guidCliente);
    } catch (_) {}
  }

  // Guardar datos para el cobro de deuda
  POS._cobroDeudaData = { guidCliente, items, total, todosConFactura };
  POS._modoCobroDeuda = true;
  POS.pagos = [];
  POS._resetTipoPago = true;

  // Cerrar modal de detalle
  const modalDetalle = bootstrap.Modal.getInstance(document.getElementById('modalDetalleVenta'));
  if (modalDetalle) modalDetalle.hide();

  // Abrir modal de pagos para cobrar la deuda
  setTimeout(() => {
    RenderPagosModal();
    new bootstrap.Modal(document.getElementById('modalPagos')).show();
  }, 400);
}

// ── Movimientos Cta. Cte. (Tab 3) ──
async function CargarMovimientosCliente(guid) {
  const desde = document.getElementById('cliMovDesde')?.value || '';
  const hasta = document.getElementById('cliMovHasta')?.value || '';
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const divMov = document.getElementById('cliMovResultados');
  divMov.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';

  try {
    const [data, saldoData] = await Promise.all([
      API.GetClienteMovimientos(guid, params),
      API.GetClienteSaldo(guid),
    ]);
    const movs = data.movimientos || data;
    const saldoAnterior = data.saldoAnterior || 0;
    const saldoActual = saldoData.Saldo || 0;

    if (movs.length === 0 && saldoAnterior === 0) {
      divMov.innerHTML = `<div class="alert alert-light border py-2 mb-2"><strong>Saldo actual:</strong> <span class="${saldoActual > 0 ? 'text-danger' : saldoActual < 0 ? 'text-success' : ''} fw-bold">${FormatMoney(saldoActual)}</span></div>
        <div class="alert alert-info py-2">Sin movimientos en el periodo.</div>`;
    } else {
      let saldoAcum = saldoAnterior;
      const saldoAnteriorRow = saldoAnterior !== 0
        ? `<tr class="table-light fst-italic"><td></td><td class="small">Saldo anterior</td><td class="text-end"></td><td class="text-end"></td><td class="text-end fw-semibold ${saldoAnterior > 0 ? 'text-danger' : 'text-success'}">${FormatMoney(saldoAnterior)}</td></tr>`
        : '';
      divMov.innerHTML = `<div class="alert alert-light border py-2 mb-2"><strong>Saldo actual (Cta. Cte.):</strong> <span class="${saldoActual > 0 ? 'text-danger' : saldoActual < 0 ? 'text-success' : ''} fw-bold">${FormatMoney(saldoActual)}</span></div>
        <table class="table table-sm table-hover"><thead class="table-light"><tr><th>Fecha</th><th>Descripcion</th><th class="text-end">Debe</th><th class="text-end">Haber</th><th>Estado</th><th class="text-end">Saldo</th></tr></thead><tbody>
        ${saldoAnteriorRow ? saldoAnteriorRow.replace('</tr>', '<td></td></tr>') : ''}
        ${movs.map(m => {
          const debe = m.DEBE || 0; const haber = m.HABER || 0;
          const conciliado = m.CONCILIADO === 1;
          saldoAcum += debe - haber;
          const estadoBadge = conciliado
            ? '<span class="badge bg-success">Conciliado</span>'
            : '<span class="badge bg-warning text-dark">Pendiente</span>';
          return `<tr class="${conciliado ? 'text-muted' : ''}"><td>${FormatFechaInt(m.FECHA)}</td><td class="small">${(m.CONCEPTO || '').trim()}</td><td class="text-end ${!conciliado && debe > 0 ? 'text-danger' : ''}">${debe > 0 ? FormatMoney(debe) : ''}</td><td class="text-end ${!conciliado && haber > 0 ? 'text-success' : ''}">${haber > 0 ? FormatMoney(haber) : ''}</td><td>${estadoBadge}</td><td class="text-end fw-semibold ${saldoAcum > 0 ? 'text-danger' : saldoAcum < 0 ? 'text-success' : ''}">${FormatMoney(saldoAcum)}</td></tr>`;
        }).join('')}
      </tbody><tfoot class="table-light"><tr class="fw-bold"><td colspan="5" class="text-end">Saldo:</td><td class="text-end ${saldoAcum > 0 ? 'text-danger' : 'text-success'}">${FormatMoney(saldoAcum)}</td></tr></tfoot></table>`;
    }
  } catch (err) { divMov.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

// ── Comprobantes (Tab 2) ──
async function CargarComprobantesCliente(guid) {
  const desde = document.getElementById('cliCompDesde')?.value || '';
  const hasta = document.getElementById('cliCompHasta')?.value || '';
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const divComp = document.getElementById('cliCompResultados');
  divComp.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';

  try {
    const facts = await API.GetClienteFacturas(guid, params);

    if (facts.length === 0) {
      divComp.innerHTML = '<div class="alert alert-info py-2">Sin comprobantes en el periodo.</div>';
    } else {
      divComp.innerHTML = `<table class="table table-sm table-hover"><thead class="table-light"><tr><th>Numero</th><th>Tipo</th><th>Fecha</th><th class="text-end">Total</th><th>ARCA</th><th></th></tr></thead><tbody>
        ${facts.map(f => {
          const tipo = (f.TIPO_COMPROBANTE || '').trim();
          const cae = (f.CAE || '').trim();
          const tipoLabel = tipo === 'NCB' || tipo === 'NCA' ? 'NC' : tipo === 'NDB' || tipo === 'NDA' ? 'ND' : 'FC';
          const badgeColor = tipoLabel === 'NC' ? 'warning text-dark' : tipoLabel === 'ND' ? 'danger' : 'success';
          const afipBadge = cae ? '<span class="badge bg-success">CAE</span>' : '<span class="badge bg-secondary">Pendiente</span>';
          return `<tr>
            <td class="fw-semibold">${(f.NUMERO_FACTURA || '').trim()}</td>
            <td><span class="badge bg-${badgeColor}">${tipoLabel} ${(f.TIPO_FACTURA || '').trim()}</span></td>
            <td>${FormatFechaInt(f.FECHA)}</td>
            <td class="text-end fw-semibold">${FormatMoney(f.TOTAL || 0)}</td>
            <td>${afipBadge}</td>
            <td>
              <button class="btn btn-sm btn-outline-dark" onclick="MostrarFactura('${f.GUID.trim()}')" title="Ver comprobante"><i class="bi bi-eye"></i></button>
            </td>
          </tr>`;
        }).join('')}
      </tbody></table>`;
    }
  } catch (err) {
    divComp.innerHTML = `<div class="alert alert-danger py-2">${err.message}</div>`;
  }
}

// ============================================================================
// SECCIÓN: EMPLEADOS — Browse + Adelantos
// ============================================================================
let _empleadosSearchTimer = null;

function RenderEmpleados(container) {
  const hoy = TodayISO();
  container.innerHTML = `
    <h4 class="mb-3"><i class="bi bi-person-badge me-2"></i>Empleados</h4>
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <input type="text" id="empleadoSearch" class="form-control" placeholder="Buscar por nombre, documento o CUIL..." oninput="OnEmpleadoSearchInput()">
          </div>
          <div class="col-md-2">
            <label class="form-label mb-0">Desde</label>
            <input type="date" id="empDesde" class="form-control form-control-sm" value="${hoy}">
          </div>
          <div class="col-md-2">
            <label class="form-label mb-0">Hasta</label>
            <input type="date" id="empHasta" class="form-control form-control-sm" value="${hoy}">
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" onclick="BuscarEmpleados()"><i class="bi bi-search me-1"></i>Buscar</button>
          </div>
        </div>
      </div>
    </div>
    <div id="empleadosResultados"><div class="text-center py-4"><div class="spinner-border text-primary"></div></div></div>
  `;
  BuscarEmpleados();
}

function OnEmpleadoSearchInput() {
  clearTimeout(_empleadosSearchTimer);
  _empleadosSearchTimer = setTimeout(() => { BuscarEmpleados(); }, 300);
}

async function BuscarEmpleados() {
  const search = (document.getElementById('empleadoSearch')?.value || '').trim().toUpperCase();
  const desde = document.getElementById('empDesde')?.value || '';
  const hasta = document.getElementById('empHasta')?.value || '';
  const div = document.getElementById('empleadosResultados');

  const params = {};
  if (search) params.search = search;
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const q = new URLSearchParams(params).toString();

  try {
    let empConAdv;
    if (desde || hasta) {
      const resp = await fetch(`/api/empleados?${q}`);
      empConAdv = await resp.json();
    } else {
      empConAdv = await API.GetEmpleados(search || undefined);
    }

    if (empConAdv.length === 0) { div.innerHTML = '<div class="alert alert-info">No se encontraron empleados.</div>'; return; }
    div.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr><th>Nombre</th><th>Documento</th><th>CUIL</th><th>Celular</th><th>Tarea</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            ${empConAdv.map(e => {
              const nombre = (e.NOMBRE || '').trim();
              const estado = (e.ESTADO || '').trim();
              const estadoBadge = estado === 'ACTIVO' ? 'success' : 'secondary';
              const tieneMovs = (e.CantAdelantos || 0) > 0;
              const btnClass = tieneMovs ? 'btn-danger' : 'btn-outline-secondary';
              const totalAdv = e.TotalAdelantos || 0;
              const badgeAdv = tieneMovs ? `<span class="badge bg-danger ms-1">${e.CantAdelantos} - ${FormatMoney(totalAdv)}</span>` : '';
              return `<tr${tieneMovs ? ' class="table-warning"' : ''}>
                <td class="fw-semibold">${nombre}${badgeAdv}</td>
                <td>${(e.DOCUMENTO || '').trim()}</td>
                <td>${(e.CUIL || '').trim()}</td>
                <td>${(e.CELULAR || '').trim()}</td>
                <td>${(e.TAREA || '').trim()}</td>
                <td><span class="badge bg-${estadoBadge}">${estado || '-'}</span></td>
                <td>
                  <button class="btn btn-sm ${btnClass}" onclick="VerAdelantosEmpleado('${e.GUID.trim()}', '${nombre.replace(/'/g, "\\'")}')">
                    <i class="bi bi-cash-stack"></i>
                  </button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

async function VerAdelantosEmpleado(guid, nombre) {
  const desde = document.getElementById('empDesde')?.value || TodayISO();
  const hasta = document.getElementById('empHasta')?.value || TodayISO();
  const body = document.getElementById('detalleVentaBody');
  document.querySelector('#modalDetalleVenta .modal-title').innerHTML = `<i class="bi bi-person-badge me-2"></i>${nombre} - Adelantos`;
  body.innerHTML = `
    <div class="row g-2 mb-3 align-items-end">
      <div class="col-md-3"><label class="form-label mb-0">Desde</label><input type="date" id="empAdvDesde" class="form-control form-control-sm" value="${desde}"></div>
      <div class="col-md-3"><label class="form-label mb-0">Hasta</label><input type="date" id="empAdvHasta" class="form-control form-control-sm" value="${hasta}"></div>
      <div class="col-md-2"><button class="btn btn-sm btn-primary w-100" onclick="CargarAdelantosEmpleado('${guid}')"><i class="bi bi-search me-1"></i>Buscar</button></div>
    </div>
    <div id="empAdvResultados"><div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div></div>
  `;
  new bootstrap.Modal(document.getElementById('modalDetalleVenta')).show();
  CargarAdelantosEmpleado(guid);
}

async function CargarAdelantosEmpleado(guid) {
  const desde = document.getElementById('empAdvDesde')?.value || '';
  const hasta = document.getElementById('empAdvHasta')?.value || '';
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const div = document.getElementById('empAdvResultados');
  div.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';

  try {
    const adelantos = await API.GetEmpleadoAdelantos(guid, params);
    if (adelantos.length === 0) {
      div.innerHTML = '<div class="alert alert-info py-2">Sin adelantos en el periodo.</div>';
      return;
    }
    let totalDebe = 0, totalHaber = 0;
    adelantos.forEach(a => { totalDebe += (a.Debe || 0); totalHaber += (a.Haber || 0); });

    div.innerHTML = `
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Fecha</th><th>Observaciones</th><th>Mes Imputacion</th><th>Sucursal</th><th class="text-end">Debe</th><th class="text-end">Haber</th><th class="text-end">Saldo</th></tr>
        </thead>
        <tbody>
          ${adelantos.map(a => {
            const fecha = a.Fecha ? new Date(a.Fecha).toLocaleDateString('es-AR') : '';
            return `<tr>
              <td>${fecha}</td>
              <td class="small">${(a.Observaciones || '').trim()}</td>
              <td>${(a.MesImputacion || '').trim()}</td>
              <td class="small">${(a.Sucursal || '').trim()}</td>
              <td class="text-end text-danger">${(a.Debe || 0) > 0 ? FormatMoney(a.Debe) : ''}</td>
              <td class="text-end text-success">${(a.Haber || 0) > 0 ? FormatMoney(a.Haber) : ''}</td>
              <td class="text-end fw-semibold">${FormatMoney(a.Saldo || 0)}</td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot class="table-light">
          <tr class="fw-bold">
            <td colspan="4" class="text-end">TOTALES:</td>
            <td class="text-end text-danger">${FormatMoney(totalDebe)}</td>
            <td class="text-end text-success">${FormatMoney(totalHaber)}</td>
            <td class="text-end">${FormatMoney(totalDebe - totalHaber)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger py-2">${err.message}</div>`; }
}

// ============================================================================
// SECCIÓN: CAJA DIARIA — Resumen de movimientos del día
// ============================================================================
function RenderCajaDiaria(container) {
  const hoy = TodayISO();
  const sucOpts = State.sucursales.map(s =>
    `<option value="${s.GUID}" ${s.GUID === State.sucursalActual ? 'selected' : ''}>${(s.NOMBRE || '').trim()}</option>`
  ).join('');

  container.innerHTML = `
    <h4 class="mb-3"><i class="bi bi-journal-text me-2"></i>Caja Diaria</h4>
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-2">
            <label class="form-label fw-semibold mb-1">Desde</label>
            <input type="date" id="cdDesde" class="form-control" value="${hoy}">
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold mb-1">Hasta</label>
            <input type="date" id="cdHasta" class="form-control" value="${hoy}">
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold mb-1">Sucursal</label>
            <select id="cdSucursal" class="form-select">
              <option value="">Todas</option>
              ${sucOpts}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold mb-1">Usuario</label>
            <select id="cdUsuario" class="form-select">
              <option value="">Todos</option>
              <option value="${State.usuario ? State.usuario.GUID : ''}" selected>${State.usuario ? (State.usuario.NOMBRE || '').trim() : 'Yo'}</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-primary w-100" onclick="BuscarCajaDiaria()"><i class="bi bi-search me-1"></i>Emitir</button>
          </div>
        </div>
      </div>
    </div>
    <div id="cdResultados"></div>
  `;

  // Cargar lista de usuarios para el filtro
  LoadUsuariosCajaDiaria();
  BuscarCajaDiaria();
}

async function LoadUsuariosCajaDiaria() {
  try {
    const usuarios = await API.GetUsuarios();
    const sel = document.getElementById('cdUsuario');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Todos</option>'
      + usuarios.map(u => {
        const nombre = (u.NOMBRE || '').trim();
        const selected = u.GUID === currentVal ? 'selected' : '';
        return `<option value="${u.GUID}" ${selected}>${nombre}</option>`;
      }).join('');
  } catch (e) { /* silenciar */ }
}

async function BuscarCajaDiaria() {
  const desde = document.getElementById('cdDesde').value;
  const hasta = document.getElementById('cdHasta').value;
  const guidSucursal = document.getElementById('cdSucursal').value;
  const guidUsuario = document.getElementById('cdUsuario').value;
  const div = document.getElementById('cdResultados');
  if (!div) return;

  div.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';

  try {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (guidSucursal) params.guidSucursal = guidSucursal;
    if (guidUsuario) params.guidUsuario = guidUsuario;

    const [movimientos, resumen] = await Promise.all([
      API.GetCajaDiaria(params),
      API.GetCajaDiariaResumen(params),
    ]);

    if (movimientos.length === 0) {
      div.innerHTML = '<div class="alert alert-info">No se encontraron movimientos en el período seleccionado.</div>';
      return;
    }

    // Calcular totales
    let totalDebe = 0, totalHaber = 0;
    movimientos.forEach(m => { totalDebe += (m.DEBE || 0); totalHaber += (m.HABER || 0); });
    const saldoCaja = totalDebe - totalHaber;

    // Tarjetas resumen
    const resumenHTML = resumen.map(r => {
      const cat = (r.Categoria || '').trim();
      const debe = r.TotalDebe || 0;
      const haber = r.TotalHaber || 0;
      const neto = debe - haber;
      const icon = CajaDiariaIcono(cat);
      const color = neto >= 0 ? 'success' : 'danger';
      return `
        <div class="col-md-3 col-sm-6 mb-2">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <small class="text-muted">${cat} <span class="badge bg-secondary">${r.Cantidad}</span></small>
                  <div class="fw-bold text-${color}">${FormatMoney(neto)}</div>
                </div>
                <i class="bi ${icon} fs-3 text-muted"></i>
              </div>
              ${debe > 0 && haber > 0 ? `<small class="text-muted">Ingr: ${FormatMoney(debe)} | Egr: ${FormatMoney(haber)}</small>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    // Tabla de movimientos
    const filas = movimientos.map(m => {
      const tipo = (m.TIPOCOMPROBANTE || '').trim();
      const desc = (m.DESCRIPCION || '').trim();
      const debe = m.DEBE || 0;
      const haber = m.HABER || 0;
      const fecha = m.FECHA ? new Date(m.FECHA).toLocaleDateString('es-AR') : '';
      const tercero = (m.Cliente || m.Proveedor || m.Empleado || '').trim();
      const cuenta = (m.CuentaBancaria || '').trim();
      const tipoCta = (m.TipoCuenta || '').trim();
      const usuario = (m.Usuario || '').trim();
      const esEgreso = haber > 0;
      const badgeColor = esEgreso ? 'danger' : CajaDiariaBadge(tipo);

      return `<tr>
        <td class="small">${fecha}</td>
        <td><span class="badge bg-${badgeColor}">${tipo}</span></td>
        <td class="small">${desc}</td>
        <td class="small">${tercero}</td>
        <td class="small">${cuenta ? cuenta + (tipoCta ? ' (' + tipoCta + ')' : '') : ''}</td>
        <td class="small">${usuario}</td>
        <td class="text-end fw-semibold ${debe > 0 ? 'text-success' : ''}">${debe > 0 ? FormatMoney(debe) : ''}</td>
        <td class="text-end fw-semibold ${haber > 0 ? 'text-danger' : ''}">${haber > 0 ? FormatMoney(haber) : ''}</td>
      </tr>`;
    }).join('');

    div.innerHTML = `
      <!-- Resumen por tipo -->
      <div class="row mb-3">
        <div class="col-md-4 mb-2">
          <div class="card border-success shadow-sm">
            <div class="card-body p-3 text-center">
              <small class="text-muted">Total Ingresos</small>
              <div class="fs-4 fw-bold text-success">${FormatMoney(totalDebe)}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-2">
          <div class="card border-danger shadow-sm">
            <div class="card-body p-3 text-center">
              <small class="text-muted">Total Egresos</small>
              <div class="fs-4 fw-bold text-danger">${FormatMoney(totalHaber)}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-2">
          <div class="card border-primary shadow-sm">
            <div class="card-body p-3 text-center">
              <small class="text-muted">Saldo Caja</small>
              <div class="fs-4 fw-bold text-${saldoCaja >= 0 ? 'primary' : 'danger'}">${FormatMoney(saldoCaja)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalle por tipo de comprobante -->
      <div class="row mb-3">${resumenHTML}</div>

      <!-- Tabla de movimientos -->
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0"><i class="bi bi-list-ul me-1"></i>Detalle de Movimientos (${movimientos.length})</h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripcion</th>
                  <th>Tercero</th>
                  <th>Cuenta</th>
                  <th>Usuario</th>
                  <th class="text-end">Ingreso</th>
                  <th class="text-end">Egreso</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
              <tfoot class="table-light">
                <tr class="fw-bold">
                  <td colspan="6" class="text-end">TOTALES:</td>
                  <td class="text-end text-success">${FormatMoney(totalDebe)}</td>
                  <td class="text-end text-danger">${FormatMoney(totalHaber)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Resumen por Tipo de Cobro/Pago -->
      <div class="card shadow-sm mt-3">
        <div class="card-header bg-white">
          <h6 class="mb-0"><i class="bi bi-bar-chart-line me-1"></i>Resumen por Medio de Cobro/Pago</h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Medio de Cobro/Pago</th>
                  <th class="text-end">Ingresos</th>
                  <th class="text-end">Egresos</th>
                  <th class="text-end">Saldo</th>
                </tr>
              </thead>
              <tbody>${BuildResumenPorTipo(movimientos)}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

function BuildResumenPorTipo(movimientos) {
  const mapa = {};
  movimientos.forEach(m => {
    const tipo = (m.TIPOCOMPROBANTE || '').trim();
    if (!mapa[tipo]) mapa[tipo] = { ingresos: 0, egresos: 0 };
    mapa[tipo].ingresos += (m.DEBE || 0);
    mapa[tipo].egresos += (m.HABER || 0);
  });

  const claves = Object.keys(mapa).sort();
  let totalIng = 0, totalEgr = 0;

  const filas = claves.map(tipo => {
    const r = mapa[tipo];
    const saldo = r.ingresos - r.egresos;
    totalIng += r.ingresos;
    totalEgr += r.egresos;
    const badgeColor = CajaDiariaBadge(tipo);
    return `<tr>
      <td><span class="badge bg-${badgeColor}">${tipo}</span></td>
      <td class="text-end ${r.ingresos > 0 ? 'text-success' : ''}">${r.ingresos > 0 ? FormatMoney(r.ingresos) : '-'}</td>
      <td class="text-end ${r.egresos > 0 ? 'text-danger' : ''}">${r.egresos > 0 ? FormatMoney(r.egresos) : '-'}</td>
      <td class="text-end fw-semibold ${saldo >= 0 ? 'text-success' : 'text-danger'}">${FormatMoney(saldo)}</td>
    </tr>`;
  }).join('');

  const totalSaldo = totalIng - totalEgr;
  return filas + `<tr class="table-light fw-bold">
    <td>TOTALES</td>
    <td class="text-end text-success">${FormatMoney(totalIng)}</td>
    <td class="text-end text-danger">${FormatMoney(totalEgr)}</td>
    <td class="text-end ${totalSaldo >= 0 ? 'text-success' : 'text-danger'}">${FormatMoney(totalSaldo)}</td>
  </tr>`;
}

function CajaDiariaIcono(tipo) {
  const t = tipo.toUpperCase();
  if (t.includes('EFECTIVO'))      return 'bi-cash-stack';
  if (t.includes('TARJETA'))       return 'bi-credit-card';
  if (t.includes('TRANSFERENCIA')) return 'bi-arrow-left-right';
  if (t.includes('MERCADO'))       return 'bi-phone';
  if (t.includes('CHEQUE'))        return 'bi-file-earmark-check';
  if (t.includes('DEPOSITO'))      return 'bi-bank';
  if (t.includes('GASTO'))         return 'bi-bag-dash';
  if (t.includes('ADELANTO'))      return 'bi-person-dash';
  if (t.includes('CUENTA'))        return 'bi-person-lines-fill';
  return 'bi-receipt';
}

function CajaDiariaBadge(tipo) {
  const t = tipo.toUpperCase();
  if (t.includes('GASTO'))         return 'danger';
  if (t.includes('ADELANTO'))      return 'danger';
  if (t.includes('EFECTIVO'))      return 'success';
  if (t.includes('TARJETA'))       return 'primary';
  if (t.includes('TRANSFERENCIA')) return 'info';
  if (t.includes('MERCADO'))       return 'info';
  if (t.includes('CHEQUE'))        return 'warning text-dark';
  if (t.includes('CUENTA'))        return 'secondary';
  return 'dark';
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
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabTCPagos">Tipos Comprob.Pagos</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabTiposCobrosPagos">Tipos Cobros/Pagos</a></li>
      </ul>
      <div class="tab-content pt-3">
        <div class="tab-pane fade show active" id="tabBancos"><div id="contenidoBancos"></div></div>
        <div class="tab-pane fade" id="tabCuentas"><div id="contenidoCuentas"></div></div>
        <div class="tab-pane fade" id="tabConceptos"><div id="contenidoConceptos"></div></div>
        <div class="tab-pane fade" id="tabHomologacion"><div id="contenidoHomologacion"></div></div>
        <div class="tab-pane fade" id="tabTCPagos"><div id="contenidoTCPagos"></div></div>
        <div class="tab-pane fade" id="tabTiposCobrosPagos"><div id="contenidoTiposCobrosPagos"></div></div>
      </div>
    </div>
  `;
  LoadBancos();

  document.querySelectorAll('#tabBancos, #tabCuentas, #tabConceptos, #tabHomologacion, #tabTCPagos, #tabTiposCobrosPagos').forEach(tab => {
    const el = document.querySelector(`a[href="#${tab.id}"]`);
    el.addEventListener('shown.bs.tab', () => {
      if (tab.id === 'tabBancos') LoadBancos();
      if (tab.id === 'tabCuentas') LoadBancosCuentas();
      if (tab.id === 'tabConceptos') LoadBancosConceptos();
      if (tab.id === 'tabHomologacion') LoadConceptosPorBanco();
      if (tab.id === 'tabTCPagos') LoadTCPagos();
      if (tab.id === 'tabTiposCobrosPagos') LoadTiposCobrosPagos();
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
          <tr><th>Nombre</th><th>Cuenta N&ordm;</th><th>Tipo Cuenta</th><th>Direcci&oacute;n</th><th>Localidad</th><th>Tel&eacute;fono</th><th class="text-end">Saldo</th><th></th></tr>
        </thead>
        <tbody>
          ${bancos.map(b => `
            <tr>
              <td>${(b.NOMBRE || '').trim()}</td>
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
  let data = { NOMBRE: '', CUENTANUMERO: '', TIPOCUENTA: '', DIRECCION: '', LOCALIDAD: '', TELEFONO: '' };
  if (guid) {
    try { data = await API.GetBancoByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }
  container.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nuevo'} Banco</h6>
        <div class="row g-2">
          <div class="col-md-3"><label class="form-label">Nombre</label><input type="text" class="form-control" id="fBanco" value="${(data.NOMBRE || '').trim()}"></div>
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
    nombre: document.getElementById('fBanco').value.trim(),
    cuentaNumero: document.getElementById('fCuentaNumero').value.trim(),
    tipoCuenta: document.getElementById('fTipoCuenta').value.trim(),
    direccion: document.getElementById('fDireccion').value.trim(),
    localidad: document.getElementById('fLocalidad').value.trim(),
    telefono: document.getElementById('fTelefono').value.trim(),
  };
  if (!payload.nombre) { ShowToast('Error', 'El nombre del banco es obligatorio', 'error'); return; }
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
    const bancosOpts = bancos.map(b => `<option value="${b.GUID.trim()}">${(b.NOMBRE || '').trim()}</option>`).join('');
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
  const bancoSel = bancos.find(b => b.GUID.trim() === (data.GUIDBANCOS || '').trim());
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
              ${bancos.map(b => `<option value="${b.GUID.trim()}" data-tipocuenta="${(b.TIPOCUENTA || '').trim()}" ${b.GUID.trim() === (data.GUIDBANCOS || '').trim() ? 'selected' : ''}>${(b.NOMBRE || '').trim()}</option>`).join('')}
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
    const bancosOpts = bancos.map(b => `<option value="${b.GUID.trim()}">${(b.NOMBRE || '').trim()}</option>`).join('');
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
  let data = { GUIDBANCOS: '', GUIDCONCEPTOBANCO: '', CODIGOCONCEPTOSEGUNBANCO: '', DESCRIPCIONSEGUNBANCO: '' };
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
              ${bancos.map(b => `<option value="${b.GUID.trim()}" ${b.GUID.trim() === (data.GUIDBANCOS || '').trim() ? 'selected' : ''}>${(b.NOMBRE || '').trim()}</option>`).join('')}
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

// ── TCPagos (Tarjetas / Medios de Pago) ─────────────────────────────────────
async function LoadTCPagos() {
  const div = document.getElementById('contenidoTCPagos');
  try {
    const [tcpagos, tiposCP] = await Promise.all([API.GetTCPagos(), API.GetTiposCobrosPagos()]);
    const tiposCPMap = {};
    tiposCP.forEach(t => { tiposCPMap[t.GUID.trim()] = (t.DESCRIPCION || '').trim(); });
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted">${tcpagos.length} medio(s) de pago</span>
        <button class="btn btn-primary btn-sm" onclick="ShowFormTCPago()"><i class="bi bi-plus-circle me-1"></i>Nuevo Medio de Pago</button>
      </div>
      <div id="formTCPagoContainer"></div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th>Tipo Cobro/Pago</th>
            <th>Nombre</th>
            <th>Abrev.</th>
            <th>N&ordm; Comercio</th>
            <th class="text-end">Inter&eacute;s %</th>
            <th class="text-end">Coeficiente</th>
            <th class="text-end"></th>
          </tr>
        </thead>
        <tbody>
          ${tcpagos.map(tc => {
            const guid = tc.GUID.trim();
            const tienePlanes = tc.CANTPLANES > 0;
            return `<tr class="${tienePlanes ? 'table-info' : ''}">
              <td>${tiposCPMap[(tc.GUIDTIPOSCOBROSPAGOS || '').trim()] || ''}</td>
              <td>${(tc.TIPO_COMPROBANTE || '').trim()}</td>
              <td>${(tc.ABREVIADO || '').trim()}</td>
              <td>${(tc.NUMERO_COMERCIO || '').trim() || '-'}</td>
              <td class="text-end">${tc.INTERES || 0}</td>
              <td class="text-end">${tc.COEFICIENTE || 0}</td>
              <td class="text-end text-nowrap">
                ${tienePlanes ? `<button class="btn btn-outline-info btn-sm me-1" onclick="TogglePlanes('${guid}')" title="Ver planes (${tc.CANTPLANES})"><i class="bi bi-list-ol"></i> ${tc.CANTPLANES}</button>` : ''}
                <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormTCPago('${guid}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="EliminarTCPago('${guid}')"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
            <tr id="planesRow_${guid}" class="d-none">
              <td colspan="7" class="bg-light p-0">
                <div class="p-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-semibold mb-0"><i class="bi bi-list-ol me-1"></i>Planes de Cuotas</h6>
                    <button class="btn btn-outline-success btn-sm" onclick="ShowFormPlan('${guid}')"><i class="bi bi-plus me-1"></i>Nuevo Plan</button>
                  </div>
                  <div id="planesContainer_${guid}"><div class="text-muted small">Cargando...</div></div>
                  <div id="formPlanContainer_${guid}"></div>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

function TogglePlanes(guid) {
  const row = document.getElementById('planesRow_' + guid);
  const visible = !row.classList.contains('d-none');
  row.classList.toggle('d-none');
  if (!visible) LoadPlanesTCPago(guid);
}

async function LoadPlanesTCPago(guidTcPago) {
  const div = document.getElementById(`planesContainer_${guidTcPago}`);
  try {
    const planes = await API.GetTCPagosPlanes(guidTcPago);
    if (planes.length === 0) {
      div.innerHTML = '<small class="text-muted">Sin planes configurados</small>';
      return;
    }
    div.innerHTML = `
      <table class="table table-sm table-hover mb-0">
        <thead class="table-light">
          <tr><th>Nombre</th><th class="text-center">Cuotas</th><th class="text-end">Inter&eacute;s %</th><th class="text-end">Coeficiente</th><th></th></tr>
        </thead>
        <tbody>
          ${planes.map(p => `
            <tr>
              <td>${(p.NOMBRECOMPROBANTEPAGO || '').trim()}</td>
              <td class="text-center">${p.CUOTAS}</td>
              <td class="text-end">${p.INTERES || 0}%</td>
              <td class="text-end">${p.COEFICIENTE || 0}</td>
              <td class="text-end">
                <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormPlan('${guidTcPago}', '${p.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="EliminarPlan('${p.GUID.trim()}', '${guidTcPago}')"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) { div.innerHTML = `<small class="text-danger">${err.message}</small>`; }
}

async function ShowFormTCPago(guid) {
  const container = document.getElementById('formTCPagoContainer');
  let data = { TIPO_COMPROBANTE: '', ABREVIADO: '', INTERES: 0, COEFICIENTE: 0, NUMERO_COMERCIO: '', TELEFONO: '', OBSERVACIONES: '', TIPO: 0, DATOSADICIONAL: 0, GUIDTIPOSCOBROSPAGOS: '' };
  if (guid) {
    try { data = await API.GetTCPagoByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }
  let tiposCobrosPagos = [];
  try { tiposCobrosPagos = await API.GetTiposCobrosPagos(); } catch (_) {}
  const guidTCP = (data.GUIDTIPOSCOBROSPAGOS || '').trim();
  container.innerHTML = `
    <div class="card border-primary mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nuevo'} Medio de Pago</h6>
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label">Tipo Cobro/Pago <span class="text-danger">*</span></label>
            <select class="form-select" id="tcTipoCobroPago">
              <option value="">Seleccione...</option>
              ${tiposCobrosPagos.map(t => `<option value="${t.GUID.trim()}" data-tipo="${t.TIPO}" ${t.GUID.trim() === guidTCP ? 'selected' : ''}>${(t.DESCRIPCION || '').trim()}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Nombre <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="tcNombre" value="${(data.TIPO_COMPROBANTE || '').trim()}" maxlength="40">
          </div>
          <div class="col-md-1">
            <label class="form-label">Abrev.</label>
            <input type="text" class="form-control" id="tcAbreviado" value="${(data.ABREVIADO || '').trim()}" maxlength="2">
          </div>
          <div class="col-md-2">
            <label class="form-label">N&ordm; Comercio</label>
            <input type="text" class="form-control" id="tcNumComercio" value="${(data.NUMERO_COMERCIO || '').trim()}" maxlength="40">
          </div>
          <div class="col-md-1">
            <label class="form-label">Inter&eacute;s %</label>
            <input type="number" class="form-control" id="tcInteres" value="${data.INTERES || 0}" step="0.01">
          </div>
          <div class="col-md-1">
            <label class="form-label">Coeficiente</label>
            <input type="number" class="form-control" id="tcCoeficiente" value="${data.COEFICIENTE || 0}" step="0.0000001">
          </div>
          <div class="col-md-1">
            <label class="form-label">Tel&eacute;fono</label>
            <input type="text" class="form-control" id="tcTelefono" value="${(data.TELEFONO || '').trim()}" maxlength="60">
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-6">
            <label class="form-label">Observaciones</label>
            <input type="text" class="form-control" id="tcObservaciones" value="${(data.OBSERVACIONES || '').trim()}" maxlength="254">
          </div>
          <div class="col-md-3 d-flex align-items-end gap-2">
            <button class="btn btn-success btn-sm" onclick="GuardarTCPago('${guid || ''}')"><i class="bi bi-check me-1"></i>Guardar</button>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formTCPagoContainer').innerHTML=''">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function GuardarTCPago(guid) {
  const selTipoCobroPago = document.getElementById('tcTipoCobroPago');
  const selectedOption = selTipoCobroPago.options[selTipoCobroPago.selectedIndex];
  const payload = {
    tipoComprobante: document.getElementById('tcNombre').value.trim(),
    abreviado: document.getElementById('tcAbreviado').value.trim(),
    interes: parseFloat(document.getElementById('tcInteres').value) || 0,
    coeficiente: parseFloat(document.getElementById('tcCoeficiente').value) || 0,
    numeroComercio: document.getElementById('tcNumComercio').value.trim(),
    telefono: document.getElementById('tcTelefono').value.trim(),
    observaciones: document.getElementById('tcObservaciones').value.trim(),
    guidTiposCobrosPagos: selTipoCobroPago.value,
    tipo: selectedOption && selectedOption.dataset.tipo ? parseInt(selectedOption.dataset.tipo) : 0,
  };
  if (!payload.guidTiposCobrosPagos) { ShowToast('Error', 'Debe seleccionar un Tipo Cobro/Pago', 'error'); return; }
  if (!payload.tipoComprobante) { ShowToast('Error', 'El nombre es obligatorio', 'error'); return; }
  try {
    if (guid) { await API.UpdateTCPago(guid, payload); }
    else { await API.CreateTCPago(payload); }
    ShowToast('TC Pago', guid ? 'Actualizado' : 'Creado', 'success');
    document.getElementById('formTCPagoContainer').innerHTML = '';
    LoadTCPagos();
    State.tcPagos = await API.GetTCPagos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarTCPago(guid) {
  if (!confirm('Eliminar este medio de pago?')) return;
  try {
    await API.DeleteTCPago(guid);
    ShowToast('TC Pago', 'Eliminado', 'success');
    LoadTCPagos();
    State.tcPagos = await API.GetTCPagos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ── Planes de cuotas ────────────────────────────────────────────────────────
async function ShowFormPlan(guidTcPago, guidPlan) {
  const container = document.getElementById(`formPlanContainer_${guidTcPago}`);
  let data = { NOMBRECOMPROBANTEPAGO: '', CUOTAS: 1, INTERES: 0, COEFICIENTE: 0 };
  if (guidPlan) {
    const planes = await API.GetTCPagosPlanes(guidTcPago);
    data = planes.find(p => p.GUID.trim() === guidPlan) || data;
  }
  container.innerHTML = `
    <div class="card border-success mt-2">
      <div class="card-body py-2">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small">Nombre</label>
            <input type="text" class="form-control form-control-sm" id="planNombre_${guidTcPago}" value="${(data.NOMBRECOMPROBANTEPAGO || '').trim()}" maxlength="40">
          </div>
          <div class="col-md-2">
            <label class="form-label small">Cuotas <span class="text-danger">*</span></label>
            <input type="number" class="form-control form-control-sm" id="planCuotas_${guidTcPago}" value="${data.CUOTAS || 1}" min="1">
          </div>
          <div class="col-md-2">
            <label class="form-label small">Inter&eacute;s %</label>
            <input type="number" class="form-control form-control-sm" id="planInteres_${guidTcPago}" value="${data.INTERES || 0}" step="0.01">
          </div>
          <div class="col-md-2">
            <label class="form-label small">Coeficiente</label>
            <input type="number" class="form-control form-control-sm" id="planCoeficiente_${guidTcPago}" value="${data.COEFICIENTE || 0}" step="0.00001">
          </div>
          <div class="col-md-3 d-flex gap-1">
            <button class="btn btn-success btn-sm" onclick="GuardarPlan('${guidTcPago}', '${guidPlan || ''}')"><i class="bi bi-check"></i> Guardar</button>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formPlanContainer_${guidTcPago}').innerHTML=''">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function GuardarPlan(guidTcPago, guidPlan) {
  const payload = {
    nombreComprobantePago: document.getElementById(`planNombre_${guidTcPago}`).value.trim(),
    cuotas: parseInt(document.getElementById(`planCuotas_${guidTcPago}`).value) || 1,
    interes: parseFloat(document.getElementById(`planInteres_${guidTcPago}`).value) || 0,
    coeficiente: parseFloat(document.getElementById(`planCoeficiente_${guidTcPago}`).value) || 0,
  };
  if (payload.cuotas < 1) { ShowToast('Error', 'Cuotas debe ser al menos 1', 'error'); return; }
  try {
    if (guidPlan) { await API.UpdateTCPagoPlan(guidPlan, payload); }
    else { await API.CreateTCPagoPlan(guidTcPago, payload); }
    ShowToast('Plan', guidPlan ? 'Actualizado' : 'Creado', 'success');
    document.getElementById(`formPlanContainer_${guidTcPago}`).innerHTML = '';
    LoadPlanesTCPago(guidTcPago);
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarPlan(guidPlan, guidTcPago) {
  if (!confirm('Eliminar este plan?')) return;
  try {
    await API.DeleteTCPagoPlan(guidPlan);
    ShowToast('Plan', 'Eliminado', 'success');
    LoadPlanesTCPago(guidTcPago);
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ── Tipos Cobros/Pagos ──────────────────────────────────────────────────────
const TIPO_MOV_LABELS = { A: 'AMBOS (Ingresos-Egresos)', I: 'INGRESOS', E: 'EGRESOS', X: 'PARA CUENTAS CORRIENTES' };
const TIPO_MOV_BADGES = { A: 'bg-primary', I: 'bg-success', E: 'bg-danger', X: 'bg-warning text-dark' };

async function LoadTiposCobrosPagos() {
  const div = document.getElementById('contenidoTiposCobrosPagos');
  try {
    const items = await API.GetTiposCobrosPagos();
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted">${items.length} tipo(s) de cobro/pago</span>
        <button class="btn btn-primary btn-sm" onclick="ShowFormTipoCobroPago()"><i class="bi bi-plus-circle me-1"></i>Nuevo Tipo</button>
      </div>
      <div id="formTipoCobroPagoContainer"></div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th>Tipo</th>
            <th>Descripci&oacute;n</th>
            <th>Movimiento</th>
            <th class="text-end"></th>
          </tr>
        </thead>
        <tbody>
          ${items.map(r => {
            const guid = r.GUID.trim();
            const mov = (r.TIPOMOVIMIENTO || '').trim();
            return `<tr>
              <td>${r.TIPO}</td>
              <td>${(r.DESCRIPCION || '').trim()}</td>
              <td><span class="badge ${TIPO_MOV_BADGES[mov] || 'bg-secondary'}">${TIPO_MOV_LABELS[mov] || mov}</span></td>
              <td class="text-end">
                <button class="btn btn-outline-primary btn-sm me-1" onclick="ShowFormTipoCobroPago('${guid}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="EliminarTipoCobroPago('${guid}')"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

async function ShowFormTipoCobroPago(guid) {
  const container = document.getElementById('formTipoCobroPagoContainer');
  let data = { TIPO: 0, DESCRIPCION: '', TIPOMOVIMIENTO: 'A' };
  if (guid) {
    try { data = await API.GetTipoCobroPagoByGuid(guid); } catch (e) { ShowToast('Error', e.message, 'error'); return; }
  }
  const mov = (data.TIPOMOVIMIENTO || 'A').trim();
  container.innerHTML = `
    <div class="card border-primary mb-3">
      <div class="card-body">
        <h6>${guid ? 'Editar' : 'Nuevo'} Tipo Cobro/Pago</h6>
        <div class="row g-2">
          <div class="col-md-2">
            <label class="form-label">Tipo</label>
            <input type="number" class="form-control" id="tcpTipo" value="${data.TIPO || 0}" min="0" max="255">
          </div>
          <div class="col-md-4">
            <label class="form-label">Descripci&oacute;n <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="tcpDescripcion" value="${(data.DESCRIPCION || '').trim()}" maxlength="40">
          </div>
          <div class="col-md-3">
            <label class="form-label">Tipo Movimiento</label>
            <select class="form-select" id="tcpTipoMovimiento">
              <option value="A" ${mov === 'A' ? 'selected' : ''}>AMBOS (Ingresos-Egresos)</option>
              <option value="I" ${mov === 'I' ? 'selected' : ''}>INGRESOS</option>
              <option value="E" ${mov === 'E' ? 'selected' : ''}>EGRESOS</option>
              <option value="X" ${mov === 'X' ? 'selected' : ''}>PARA CUENTAS CORRIENTES</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end gap-2">
            <button class="btn btn-success btn-sm" onclick="GuardarTipoCobroPago('${guid || ''}')"><i class="bi bi-check me-1"></i>Guardar</button>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('formTipoCobroPagoContainer').innerHTML=''">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function GuardarTipoCobroPago(guid) {
  const payload = {
    tipo: parseInt(document.getElementById('tcpTipo').value) || 0,
    descripcion: document.getElementById('tcpDescripcion').value.trim(),
    tipoMovimiento: document.getElementById('tcpTipoMovimiento').value,
  };
  if (!payload.descripcion) { ShowToast('Error', 'La descripci\u00f3n es obligatoria', 'error'); return; }
  try {
    if (guid) { await API.UpdateTipoCobroPago(guid, payload); }
    else { await API.CreateTipoCobroPago(payload); }
    ShowToast('Tipo Cobro/Pago', guid ? 'Actualizado' : 'Creado', 'success');
    document.getElementById('formTipoCobroPagoContainer').innerHTML = '';
    LoadTiposCobrosPagos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarTipoCobroPago(guid) {
  if (!confirm('Eliminar este tipo de cobro/pago?')) return;
  try {
    await API.DeleteTipoCobroPago(guid);
    ShowToast('Tipo Cobro/Pago', 'Eliminado', 'success');
    LoadTiposCobrosPagos();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ============================================================================
// SECCIÓN: Sucursales — CRUD (solo admin)
// ============================================================================

function RenderSucursales(container) {
  const esAdmin = State.usuario.CODIGOUSUARIO === 1 && (State.usuario.ID || '').trim() === 'AJE';
  if (!esAdmin) {
    container.innerHTML = '<div class="alert alert-danger">No tiene permisos para acceder a esta secci&oacute;n.</div>';
    return;
  }
  container.innerHTML = `
    <h4 class="mb-3"><i class="bi bi-building me-2"></i>Sucursales</h4>
    <div class="card shadow-sm mb-3">
      <div class="card-body d-flex gap-2 align-items-center">
        <input type="text" id="sucursalSearch" class="form-control" placeholder="Buscar por nombre..." onkeyup="BuscarSucursales()">
        <button class="btn btn-success" onclick="MostrarFormSucursal()"><i class="bi bi-plus-circle me-1"></i>Nueva</button>
      </div>
    </div>
    <div id="formSucursalContainer"></div>
    <div id="sucursalesResultados"><div class="text-center py-4"><div class="spinner-border text-primary"></div></div></div>
  `;
  BuscarSucursales();
}

let _configuraciones = [];

async function BuscarSucursales() {
  const search = (document.getElementById('sucursalSearch')?.value || '').trim().toUpperCase();
  const div = document.getElementById('sucursalesResultados');
  try {
    const [sucursales, configs] = await Promise.all([API.GetSucursales(), API.GetConfiguraciones()]);
    _configuraciones = configs;
    let filtered = sucursales;
    if (search) {
      filtered = sucursales.filter(s => (s.NOMBRE || '').toUpperCase().includes(search));
    }
    if (filtered.length === 0) { div.innerHTML = '<div class="alert alert-info">No se encontraron sucursales.</div>'; return; }
    div.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr><th>C&oacute;digo</th><th>Nombre</th><th>Configuraci&oacute;n</th><th>CUIT</th><th>Punto Venta</th><th>Cotiz. D&oacute;lar</th><th>Email</th><th>Celular</th><th></th></tr>
          </thead>
          <tbody>
            ${filtered.map(s => {
              const nombre = (s.NOMBRE || '').trim();
              const cfg = configs.find(c => c.GUID.trim() === (s.GUIDCONFIGURACION || '').trim());
              const cfgNombre = cfg ? (cfg.NOMBREEMPRESA || '').trim() : '-';
              return `<tr>
                <td>${s.CODIGOSUCURSAL}</td>
                <td class="fw-semibold">${nombre}</td>
                <td>${cfgNombre}</td>
                <td>${(s.CUIT || '').trim()}</td>
                <td>${s.PUNTOVENTA || 0}</td>
                <td class="text-end">${FormatMoney(s.COTIZACIONDOLAR || 0)}</td>
                <td>${(s.EMAIL || '').trim()}</td>
                <td>${(s.CELULAR || '').trim()}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" onclick="EditarSucursal('${s.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="EliminarSucursal('${s.GUID.trim()}', '${nombre.replace(/'/g, "\\'")}')"><i class="bi bi-trash"></i></button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

function MostrarFormSucursal(sucursal) {
  const esEdicion = !!sucursal;
  const container = document.getElementById('formSucursalContainer');
  const cfgOpts = _configuraciones.map(c => {
    const sel = sucursal && (sucursal.GUIDCONFIGURACION || '').trim() === c.GUID.trim() ? 'selected' : '';
    return `<option value="${c.GUID.trim()}" ${sel}>${(c.NOMBREEMPRESA || '').trim()}</option>`;
  }).join('');
  container.innerHTML = `
    <div class="card border-primary mb-3">
      <div class="card-body">
        <h6 class="fw-semibold mb-3"><i class="bi bi-${esEdicion ? 'pencil' : 'building'} me-1"></i>${esEdicion ? 'Editar' : 'Nueva'} Sucursal</h6>
        <input type="hidden" id="sucGuid" value="${esEdicion ? sucursal.GUID.trim() : ''}">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label">Nombre <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="sucNombre" maxlength="255" value="${esEdicion ? (sucursal.NOMBRE || '').trim() : ''}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Configuraci&oacute;n</label>
            <select class="form-select" id="sucConfiguracion">
              <option value="">-- Sin asignar --</option>
              ${cfgOpts}
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">CUIT</label>
            <input type="text" class="form-control" id="sucCuit" maxlength="13" value="${esEdicion ? (sucursal.CUIT || '').trim() : ''}">
          </div>
          <div class="col-md-2">
            <label class="form-label">Punto Venta</label>
            <input type="number" class="form-control" id="sucPuntoVenta" min="0" value="${esEdicion ? (sucursal.PUNTOVENTA || 0) : 0}">
          </div>
          <div class="col-md-2">
            <label class="form-label">Cotiz. D&oacute;lar</label>
            <input type="number" class="form-control" id="sucCotizDolar" step="0.01" min="0" value="${esEdicion ? (sucursal.COTIZACIONDOLAR || 0) : 0}">
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="sucEmail" maxlength="255" value="${esEdicion ? (sucursal.EMAIL || '').trim() : ''}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Celular</label>
            <input type="text" class="form-control" id="sucCelular" maxlength="20" value="${esEdicion ? (sucursal.CELULAR || '').trim() : ''}">
          </div>
          <div class="col-md-6 d-flex align-items-end gap-2">
            <button class="btn btn-primary" onclick="GuardarSucursal()"><i class="bi bi-check-circle me-1"></i>${esEdicion ? 'Actualizar' : 'Guardar'}</button>
            <button class="btn btn-secondary" onclick="document.getElementById('formSucursalContainer').innerHTML=''">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function EditarSucursal(guid) {
  try {
    const sucursal = await API.GetSucursalByGuid(guid);
    if (!sucursal) { ShowToast('Error', 'Sucursal no encontrada', 'error'); return; }
    MostrarFormSucursal(sucursal);
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function GuardarSucursal() {
  const guid = document.getElementById('sucGuid').value;
  const nombre = document.getElementById('sucNombre').value.trim();
  const guidconfiguracion = document.getElementById('sucConfiguracion').value;
  const cuit = document.getElementById('sucCuit').value.trim();
  const puntoventa = parseInt(document.getElementById('sucPuntoVenta').value) || 0;
  const cotizaciondolar = parseFloat(document.getElementById('sucCotizDolar').value) || 0;
  const email = document.getElementById('sucEmail').value.trim();
  const celular = document.getElementById('sucCelular').value.trim();

  if (!nombre) { ShowToast('Error', 'El nombre es obligatorio', 'error'); return; }

  const payload = { nombre, cuit, puntoventa, cotizaciondolar, email, celular, guidconfiguracion };

  try {
    if (guid) {
      await API.UpdateSucursal(guid, payload);
      ShowToast('Sucursal', 'Actualizada exitosamente', 'success');
    } else {
      await API.CreateSucursal(payload);
      ShowToast('Sucursal', 'Creada exitosamente', 'success');
    }
    document.getElementById('formSucursalContainer').innerHTML = '';
    // Refrescar State.sucursales para que el dropdown del navbar se actualice
    State.sucursales = await API.GetSucursales();
    BuscarSucursales();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarSucursal(guid, nombre) {
  if (!confirm(`Eliminar la sucursal "${nombre}"?`)) return;
  try {
    await API.DeleteSucursal(guid);
    ShowToast('Sucursal', 'Eliminada exitosamente', 'success');
    State.sucursales = await API.GetSucursales();
    BuscarSucursales();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

// ============================================================================
// SECCIÓN: Usuarios — CRUD (solo admin)
// ============================================================================

function RenderUsuarios(container) {
  // Verificar acceso admin
  const esAdmin = State.usuario.CODIGOUSUARIO === 1 && (State.usuario.ID || '').trim() === 'AJE';
  if (!esAdmin) {
    container.innerHTML = '<div class="alert alert-danger">No tiene permisos para acceder a esta secci&oacute;n.</div>';
    return;
  }
  container.innerHTML = `
    <h4 class="mb-3"><i class="bi bi-shield-lock me-2"></i>Usuarios</h4>
    <div class="card shadow-sm mb-3">
      <div class="card-body d-flex gap-2 align-items-center">
        <input type="text" id="usuarioSearch" class="form-control" placeholder="Buscar por nombre o ID..." onkeyup="BuscarUsuarios()">
        <button class="btn btn-success" onclick="MostrarFormUsuario()"><i class="bi bi-plus-circle me-1"></i>Nuevo</button>
      </div>
    </div>
    <div id="formUsuarioContainer"></div>
    <div id="usuariosResultados"><div class="text-center py-4"><div class="spinner-border text-primary"></div></div></div>
  `;
  BuscarUsuarios();
}

async function BuscarUsuarios() {
  const search = (document.getElementById('usuarioSearch')?.value || '').trim().toUpperCase();
  const div = document.getElementById('usuariosResultados');
  try {
    const usuarios = await API.GetUsuarios();
    let filtered = usuarios;
    if (search) {
      filtered = usuarios.filter(u =>
        (u.NOMBRE || '').toUpperCase().includes(search) ||
        (u.ID || '').toUpperCase().includes(search)
      );
    }
    if (filtered.length === 0) { div.innerHTML = '<div class="alert alert-info">No se encontraron usuarios.</div>'; return; }
    div.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr><th>C&oacute;digo</th><th>ID</th><th>Nombre</th><th>Nivel</th><th>Sucursal</th><th></th></tr>
          </thead>
          <tbody>
            ${filtered.map(u => {
              const nombre = (u.NOMBRE || '').trim();
              const sucNombre = State.sucursales.find(s => s.GUID === (u.GUIDSUCURSALES || '').trim());
              return `<tr>
                <td>${u.CODIGOUSUARIO}</td>
                <td class="fw-semibold">${(u.ID || '').trim()}</td>
                <td>${nombre}</td>
                <td>${u.NIVEL || 0}</td>
                <td>${sucNombre ? (sucNombre.NOMBRE || '').trim() : '-'}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" onclick="EditarUsuario('${u.GUID.trim()}')"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="EliminarUsuario('${u.GUID.trim()}', '${nombre.replace(/'/g, "\\'")}')"><i class="bi bi-trash"></i></button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) { div.innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
}

let _bancosCuentasUsuarios = [];

async function MostrarFormUsuario(usuario) {
  const esEdicion = !!usuario;
  const container = document.getElementById('formUsuarioContainer');

  // Cargar bancos cuentas y filtrar solo CAJA FISICA
  try {
    const todas = await API.GetBancosCuentas();
    _bancosCuentasUsuarios = todas.filter(bc => (bc.TIPOCUENTA || '').trim().toUpperCase() === 'CAJA FISICA');
  } catch (e) { _bancosCuentasUsuarios = []; }

  const sucOpts = State.sucursales.map(s => {
    const sel = usuario && (usuario.GUIDSUCURSALES || '').trim() === s.GUID.trim() ? 'selected' : '';
    return `<option value="${s.GUID.trim()}" data-guidcfg="${(s.GUIDCONFIGURACION || '').trim()}" ${sel}>${(s.NOMBRE || '').trim()}</option>`;
  }).join('');

  const bcOpts = _bancosCuentasUsuarios.map(bc => {
    const sel = usuario && (usuario.GUIDBANCOSCUENTAS || '').trim() === bc.GUID.trim() ? 'selected' : '';
    const label = `${(bc.NombreBanco || '').trim()} - ${(bc.NUMEROCUENTA || '').trim()}${bc.ALIAS ? ' (' + bc.ALIAS.trim() + ')' : ''}`;
    return `<option value="${bc.GUID.trim()}" ${sel}>${label}</option>`;
  }).join('');

  // Determinar guidconfiguracion inicial
  const guidCfgInicial = esEdicion ? (usuario.GUIDCONFIGURACION || '').trim() : '';

  container.innerHTML = `
    <div class="card border-primary mb-3">
      <div class="card-body">
        <h6 class="fw-semibold mb-3"><i class="bi bi-${esEdicion ? 'pencil' : 'person-plus'} me-1"></i>${esEdicion ? 'Editar' : 'Nuevo'} Usuario</h6>
        <input type="hidden" id="usrGuid" value="${esEdicion ? usuario.GUID.trim() : ''}">
        <input type="hidden" id="usrGuidConfiguracion" value="${guidCfgInicial}">
        <div class="row g-2">
          <div class="col-md-2">
            <label class="form-label">ID (3 letras) <span class="text-danger">*</span></label>
            <input type="text" class="form-control text-uppercase" id="usrId" maxlength="3" value="${esEdicion ? (usuario.ID || '').trim() : ''}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Nombre <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="usrNombre" maxlength="40" value="${esEdicion ? (usuario.NOMBRE || '').trim() : ''}">
          </div>
          <div class="col-md-2">
            <label class="form-label">Clave</label>
            <div class="input-group">
              <input type="password" class="form-control" id="usrClave" maxlength="20" value="${esEdicion ? (usuario.CLAVE || '').trim() : ''}">
              <button class="btn btn-outline-secondary" type="button" onmousedown="document.getElementById('usrClave').type='text'" onmouseup="document.getElementById('usrClave').type='password'" onmouseleave="document.getElementById('usrClave').type='password'"><i class="bi bi-eye"></i></button>
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label">Nivel</label>
            <input type="number" class="form-control" id="usrNivel" min="0" max="99" value="${esEdicion ? (usuario.NIVEL || 0) : 0}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Sucursal</label>
            <select class="form-select" id="usrSucursal" onchange="OnUsrSucursalChange()">
              <option value="">-- Sin asignar --</option>
              ${sucOpts}
            </select>
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <label class="form-label">Cuenta Banco</label>
            <select class="form-select" id="usrBancoCuenta">
              <option value="">-- Sin asignar --</option>
              ${bcOpts}
            </select>
          </div>
          <div class="col-md-8 d-flex align-items-end gap-2">
            <button class="btn btn-primary" onclick="GuardarUsuario()"><i class="bi bi-check-circle me-1"></i>${esEdicion ? 'Actualizar' : 'Guardar'}</button>
            <button class="btn btn-secondary" onclick="document.getElementById('formUsuarioContainer').innerHTML=''">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function OnUsrSucursalChange() {
  const sel = document.getElementById('usrSucursal');
  const opt = sel.options[sel.selectedIndex];
  const guidCfg = opt?.dataset?.guidcfg || '';
  document.getElementById('usrGuidConfiguracion').value = guidCfg;
}

async function EditarUsuario(guid) {
  try {
    const usuario = await API.GetUsuarioByGuid(guid);
    if (!usuario) { ShowToast('Error', 'Usuario no encontrado', 'error'); return; }
    await MostrarFormUsuario(usuario);
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function GuardarUsuario() {
  const guid = document.getElementById('usrGuid').value;
  const id = document.getElementById('usrId').value.trim().toUpperCase();
  const nombre = document.getElementById('usrNombre').value.trim();
  const clave = document.getElementById('usrClave').value.trim();
  const nivel = parseInt(document.getElementById('usrNivel').value) || 0;
  const guidsucursales = document.getElementById('usrSucursal').value;
  const guidconfiguracion = document.getElementById('usrGuidConfiguracion').value;
  const guidbancoscuentas = document.getElementById('usrBancoCuenta').value;

  if (!id || id.length > 3) { ShowToast('Error', 'El ID es obligatorio (max 3 caracteres)', 'error'); return; }
  if (!nombre) { ShowToast('Error', 'El nombre es obligatorio', 'error'); return; }

  const payload = { id, nombre, clave, nivel, guidsucursales, guidconfiguracion, guidbancoscuentas };

  try {
    if (guid) {
      await API.UpdateUsuario(guid, payload);
      ShowToast('Usuario', 'Actualizado exitosamente', 'success');
    } else {
      await API.CreateUsuario(payload);
      ShowToast('Usuario', 'Creado exitosamente', 'success');
    }
    document.getElementById('formUsuarioContainer').innerHTML = '';
    BuscarUsuarios();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}

async function EliminarUsuario(guid, nombre) {
  if (!confirm(`Eliminar el usuario "${nombre}"?`)) return;
  try {
    await API.DeleteUsuario(guid);
    ShowToast('Usuario', 'Eliminado exitosamente', 'success');
    BuscarUsuarios();
  } catch (err) { ShowToast('Error', err.message, 'error'); }
}
