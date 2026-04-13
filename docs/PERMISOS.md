# Sistema de Permisos — RickySport POS

> Ultima actualizacion: 2026-04-13
> Version: 1.1.2
> Estado: PROPUESTA APROBADA — lista para pasar a SQL + CRUD

---

## 1. Objetivo

Definir un sistema de permisos que controle que puede hacer cada usuario, tanto a nivel de **modulos** (acceso a vistas y CRUD general) como a nivel de **acciones sensibles** puntuales (anular venta, reactivar cliente, eliminar usuario, etc.), con **roles** como plantilla reutilizable.

Requisitos confirmados por el equipo:

- Modelo basado en **roles** (12 roles fijos): `Usuario`, `Supervisor_1..10`, `Admin`.
- **Admin** tiene acceso total sin restricciones, y es el unico que ve la vista de Seguridad y su auditoria.
- **Usuario** tiene acceso solo por modulos (sin permisos especiales).
- **Supervisor_n** tiene acceso por modulo **y** permisos especiales. La UI permite *copiar permisos de otro supervisor*.
- CRUD de seguridad (roles, permisos, asignacion de rol al usuario) + dos auditorias (cambios de config + intervenciones con permisos especiales).
- **NO se implementa por ahora**: JWT / `requireUser` en todas las rutas, hash bcrypt de claves. Queda para una fase posterior.

---

## 2. Estado actual

- Tabla `Usuarios` con `NIVEL smallint` y `CLAVE char(20)` (texto plano).
- Tabla `Modulos_Usuarios` (legacy) con columnas `CODIGO_MODULO, CODIGO_USUARIO, MODULO, MODULO_INTERNO, NIVEL, GUID, GUIDUSUARIOS`. **No hay catalogo `Modulos` ni `Roles`**.
- Login `POST /api/usuarios/login` devuelve `MODULOS` y se guarda en `State.usuario` en memoria. Sin JWT, sin session.
- Control de UI: solo chequeo `CODIGOUSUARIO===1 && ID==='AJE'` para ocultar menu admin.
- Backend **sin middleware de permisos** en ninguna ruta.

---

## 3. Modelo propuesto

### 3.1. Tabla catalogo `Modulos` (nueva)

Fija los codigos internos del sistema — no se administra desde la UI, solo por seed/migracion.

```sql
CREATE TABLE Modulos (
    GUID              CHAR(16)      NOT NULL,
    CODIGO            INT IDENTITY(1,1) NOT NULL,
    CODIGO_INTERNO    NVARCHAR(64)  NOT NULL,  -- 'VENTAS', 'ARTICULOS', ...
    NOMBRE            NVARCHAR(100) NOT NULL,
    ORDEN             SMALLINT      NULL,
    ts                FLOAT         NULL,
    sts               FLOAT         NULL,
    dts               FLOAT         NULL,
    CONSTRAINT PK_Modulos PRIMARY KEY (GUID),
    CONSTRAINT UQ_Modulos_CodigoInterno UNIQUE (CODIGO_INTERNO)
);
```

### 3.2. Tabla `Roles` (nueva)

12 filas fijas. `Usuario` y `Admin` con `ES_SISTEMA = 1` (no editables/no eliminables desde la UI).

```sql
CREATE TABLE Roles (
    GUID              CHAR(16)      NOT NULL,
    CODIGO            INT IDENTITY(1,1) NOT NULL,
    NOMBRE            NVARCHAR(50)  NOT NULL,  -- 'Usuario', 'Supervisor_1'..'Supervisor_10', 'Admin'
    TIPO              NVARCHAR(20)  NOT NULL,  -- 'USUARIO' | 'SUPERVISOR' | 'ADMIN'
    ES_SISTEMA        BIT           NOT NULL DEFAULT 0,
    DESCRIPCION       NVARCHAR(200) NULL,
    ts                FLOAT         NULL,
    sts               FLOAT         NULL,
    dts               FLOAT         NULL,
    CONSTRAINT PK_Roles PRIMARY KEY (GUID),
    CONSTRAINT UQ_Roles_Nombre UNIQUE (NOMBRE)
);
```

### 3.3. Tabla `Roles_Modulos` (nueva)

Nivel de acceso del rol sobre el modulo. Convencion **acumulativa** (nivel 3 incluye 2 y 1):

| Nivel | Significado | Accion |
|---|---|---|
| `0` | Sin acceso | Modulo oculto; backend bloquea con 403 |
| `1` | Lectura | Ver listado y detalle, buscar |
| `2` | Crear | + alta de registros |
| `3` | Editar | + modificar registros existentes |
| `4` | Admin del modulo | + soft delete / deshabilitar |

**Operaciones administrativas especiales** (reactivar, recalcular, ajustes masivos, eliminar usuario, etc.) **no** entran en esta escala; van en permisos especiales.

```sql
CREATE TABLE Roles_Modulos (
    GUID              CHAR(16)     NOT NULL,
    GUIDROLES         CHAR(16)     NOT NULL,
    CODIGO_MODULO     INT          NOT NULL,
    NIVEL             TINYINT      NOT NULL DEFAULT 0,  -- 0..4
    ts                FLOAT        NULL,
    sts               FLOAT        NULL,
    dts               FLOAT        NULL,
    CONSTRAINT PK_RolesModulos PRIMARY KEY (GUID),
    CONSTRAINT UQ_RolesModulos UNIQUE (GUIDROLES, CODIGO_MODULO)
);
```

### 3.4. Tabla `Roles_PermisosEspeciales` (nueva)

Solo se cargan filas para roles tipo `SUPERVISOR` y `ADMIN`. El rol `Usuario` por definicion no tiene permisos especiales (validacion en back + front).

```sql
CREATE TABLE Roles_PermisosEspeciales (
    GUID              CHAR(16)     NOT NULL,
    GUIDROLES         CHAR(16)     NOT NULL,
    CODIGO            NVARCHAR(64) NOT NULL,  -- 'VENTA.ANULAR', 'CAJA.APERTURA', ...
    ts                FLOAT        NULL,
    sts               FLOAT        NULL,
    dts               FLOAT        NULL,
    CONSTRAINT PK_RolesPermisosEspeciales PRIMARY KEY (GUID),
    CONSTRAINT UQ_RolesPermisosEspeciales UNIQUE (GUIDROLES, CODIGO)
);
```

### 3.5. Modificacion a `Usuarios`

Agregar una columna:

```sql
ALTER TABLE Usuarios
  ADD GUIDROLES CHAR(16) NULL;

-- Migracion inicial (mapeo heuristico desde NIVEL legacy)
UPDATE Usuarios SET GUIDROLES = (SELECT GUID FROM Roles WHERE NOMBRE = 'Admin')         WHERE NIVEL = 99;
UPDATE Usuarios SET GUIDROLES = (SELECT GUID FROM Roles WHERE NOMBRE = 'Supervisor_1')  WHERE NIVEL BETWEEN 50 AND 98 AND GUIDROLES IS NULL;
UPDATE Usuarios SET GUIDROLES = (SELECT GUID FROM Roles WHERE NOMBRE = 'Usuario')       WHERE GUIDROLES IS NULL;
```

El `NIVEL smallint` legacy queda pero deja de usarse para autorizacion.

### 3.6. Tabla `AuditoriaSeguridad` (nueva)

Registra cambios en roles, permisos y asignaciones de rol a usuarios. Solo la vista Seguridad escribe aqui.

```sql
CREATE TABLE AuditoriaSeguridad (
    GUID              CHAR(16)      NOT NULL,
    GUIDUSUARIOS      CHAR(16)      NOT NULL,    -- quien ejecuta el cambio
    ENTIDAD           NVARCHAR(30)  NOT NULL,    -- 'ROL' | 'ROL_MODULO' | 'ROL_PERMISO' | 'USUARIO_ROL'
    GUIDENTIDAD       CHAR(16)      NULL,        -- GUID afectado (rol, usuario, etc.)
    ACCION            NVARCHAR(20)  NOT NULL,    -- 'CREAR' | 'EDITAR' | 'ELIMINAR' | 'ASIGNAR' | 'COPIAR'
    ANTES_JSON        NVARCHAR(MAX) NULL,
    DESPUES_JSON      NVARCHAR(MAX) NULL,
    FECHA             DATETIME      NOT NULL DEFAULT GETDATE(),
    IP                NVARCHAR(64)  NULL,
    ts                FLOAT         NULL,
    sts               FLOAT         NULL,
    dts               FLOAT         NULL,
    CONSTRAINT PK_AuditoriaSeguridad PRIMARY KEY (GUID)
);
```

### 3.7. Tabla `AuditoriaAcciones` (nueva)

Registra cada vez que un supervisor o admin ejerce un **permiso especial** (anular venta, aplicar descuento sobre maximo, reactivar cliente, eliminar usuario, etc.). Sirve para revisar intervenciones operativas.

```sql
CREATE TABLE AuditoriaAcciones (
    GUID              CHAR(16)      NOT NULL,
    GUIDUSUARIOS      CHAR(16)      NOT NULL,    -- quien ejecuta la operacion
    CODIGOPERMISO     NVARCHAR(64)  NOT NULL,    -- 'VENTA.ANULAR', 'VENTA.DESCUENTO_SOBRE_MAXIMO', ...
    ENTIDAD           NVARCHAR(30)  NULL,        -- 'VENTA' | 'ARTICULO' | 'CAJA' | 'CLIENTE' | 'USUARIO'
    GUIDENTIDAD       CHAR(16)      NULL,        -- GUID del registro afectado
    RESULTADO         NVARCHAR(20)  NOT NULL DEFAULT 'OK',  -- 'OK' | 'DENIED'
    DETALLE_JSON      NVARCHAR(MAX) NULL,        -- contexto: monto, motivo, cliente, %, etc.
    FECHA             DATETIME      NOT NULL DEFAULT GETDATE(),
    IP                NVARCHAR(64)  NULL,
    ts                FLOAT         NULL,
    sts               FLOAT         NULL,
    dts               FLOAT         NULL,
    CONSTRAINT PK_AuditoriaAcciones PRIMARY KEY (GUID)
);
```

Se llena desde el middleware `requirePermission({ especial })`: si el permiso procede, graba `RESULTADO='OK'`; si el usuario intenta y no tiene, graba `RESULTADO='DENIED'` (para detectar intentos).

### 3.8. Indices recomendados

```sql
CREATE INDEX IX_Usuarios_GuidRoles                ON Usuarios (GUIDROLES);
CREATE INDEX IX_RolesModulos_GuidRoles            ON Roles_Modulos (GUIDROLES);
CREATE INDEX IX_RolesPermisosEspeciales_GuidRoles ON Roles_PermisosEspeciales (GUIDROLES);
CREATE INDEX IX_AuditoriaSeguridad_Fecha          ON AuditoriaSeguridad (FECHA DESC);
CREATE INDEX IX_AuditoriaSeguridad_GuidUsuarios   ON AuditoriaSeguridad (GUIDUSUARIOS);
CREATE INDEX IX_AuditoriaAcciones_Fecha           ON AuditoriaAcciones (FECHA DESC);
CREATE INDEX IX_AuditoriaAcciones_GuidUsuarios    ON AuditoriaAcciones (GUIDUSUARIOS);
CREATE INDEX IX_AuditoriaAcciones_Codigo          ON AuditoriaAcciones (CODIGOPERMISO);
```

---

## 4. Catalogo

### 4.1. Modulos

| CODIGO_INTERNO | Nombre visible | Vista frontend | Rutas backend principales |
|---|---|---|---|
| `POS` | Nueva Venta | `pos` | `POST /api/ventas` |
| `VENTAS` | Ventas | `ventas` | `GET /api/ventas`, `GET /api/ventas/:guid` |
| `DEVOLUCIONES` | Devoluciones | `devoluciones` | `GET/POST /api/devoluciones` |
| `CAMBIOS` | Cambios | `cambios` | `POST /api/devoluciones/cambio` |
| `ARTICULOS` | Articulos | `articulos` | `GET/POST/PUT/DELETE /api/articulos` |
| `TRANSFERENCIAS` | Transferencias | `transferencias` | `GET/POST /api/transferencias` |
| `COMPRAS` | Ingresos por Compras | `compras` | `GET/POST /api/compras` |
| `GASTOS` | Gastos/Adelantos | `gastos` | `GET/POST /api/gastos`, `/api/gastos/adelanto` |
| `CAJA` | Caja Diaria | `cajadiaria` | `GET /api/cajadiaria` |
| `CLIENTES` | Clientes | `clientes` | `GET/POST/PUT/DELETE /api/clientes`, `/cobro-deuda`, `/reactivar` |
| `CTACTE` | Cuenta Corriente | (seccion de clientes) | `/api/clientes/cobro-deuda`, `/recalcular-saldos` |
| `EMPLEADOS` | Empleados | `empleados` | `GET/POST/PUT/DELETE /api/empleados` |
| `PROVEEDORES` | Proveedores | `proveedores` | `GET/POST/PUT/DELETE /api/proveedores` |
| `VENDEDORES` | Vendedores | `vendedores` | `GET/POST/PUT/DELETE /api/vendedores` |
| `BANCOS` | Bancos | `bancos` | `/api/bancos`, `/bancos-cuentas`, `/bancos-conceptos`, `/conceptos-por-banco` |
| `SUCURSALES` | Sucursales | `sucursales` | `GET/POST/PUT/DELETE /api/sucursales` |
| `USUARIOS` | Usuarios | `usuarios` | `GET/POST/PUT /api/usuarios` (el `DELETE` va por permiso especial — ver 4.2) |
| `AJUSTES` | Ajustes | `ajustes` | `GET/PUT /api/config/*`, tipos de cobro/pago, TC pagos, condicion articulos |
| `AUDITORIA_PRECIOS` | Auditoria Precios | `auditoria-precios` | `GET /api/config/auditoria-precios` |
| `ARCA` | ARCA / AFIP | (no tiene vista) | `POST /api/arca/autorizar` |
| `SEGURIDAD` | Seguridad | `seguridad` | `GET/POST/PUT/DELETE /api/seguridad/*` (roles, permisos, auditorias) — **solo rol Admin** |

**Mapeo operacion -> nivel minimo** (convencion acumulativa):

| Operacion | Nivel minimo |
|---|---|
| Ver listado / detalle | 1 |
| Crear registro | 2 |
| Editar registro | 3 |
| Eliminar (soft delete) | 4 |
| Operaciones especiales (reactivar, recalcular, eliminar usuario, etc.) | N/A — permiso especial |

### 4.2. Permisos especiales

Acciones que requieren permiso puntual independiente del nivel de modulo.

| CODIGO | Descripcion | Donde se aplica |
|---|---|---|
| `VENTA.ANULAR` | Anular una venta ya confirmada | Boton "Anular" en detalle de venta (a implementar) |
| `VENTA.DESCUENTO_SOBRE_MAXIMO` | Aplicar descuento mayor al `maxDescuento` configurado | Validacion en `POS.CambiarPrecio` |
| `VENTA.CTACTE_SOBRE_LIMITE` | Vender en cta. cte. superando el limite de credito del cliente | Validacion en modal de pagos |
| `VENTA.REIMPRIMIR` | Reimprimir comprobante de una venta vieja | Vista Ventas |
| `ARTICULO.AJUSTE_STOCK` | Corregir stock manualmente fuera de compra/venta/transferencia | Vista Articulos |
| `ARTICULO.VER_COSTO` | Ver columna `PRECIOCOSTO` y margenes | Grilla Articulos y detalle |
| `CAJA.APERTURA` | Abrir caja diaria | Vista Caja Diaria |
| `CAJA.CIERRE` | Cerrar caja diaria | Vista Caja Diaria |
| `CAJA.EDITAR_MOVIMIENTO` | Editar/eliminar un movimiento de caja | Vista Caja Diaria |
| `CONFIG.MAX_DESCUENTO` | Cambiar el `%` de descuento maximo permitido | `PUT /api/config/max-descuento` |
| `CONFIG.TIPOS_COBRO_PAGO` | Crear/editar/eliminar tipos de cobro/pago y TC pagos (plans, recargos) | `/api/tiposCobrosPagos`, `/api/tcPagos` |
| `CLIENTE.REACTIVAR` | Reactivar un cliente previamente deshabilitado | Boton "Reactivar" en lista/detalle de cliente |
| `CLIENTE.EDITAR_LIMITE_CREDITO` | Modificar limite de credito de un cliente | Edicion de cliente |
| `USUARIO.ELIMINAR` | Eliminar (soft delete) un usuario del sistema | Vista Usuarios (el nivel 4 del modulo USUARIOS **no** habilita esta accion) |
| `REPORTES.EXPORTAR` | Exportar listados completos (`?export=1`, hasta 50k filas) | Cualquier `GET /api/<modulo>?export=1` |
| `ARCA.AUTORIZAR` | Solicitar CAE a AFIP | `POST /api/arca/autorizar` |

---

## 5. Matriz de roles (seed inicial — escala 0-4)

Valores sugeridos para el seed. Los `Supervisor_n` arrancan con el mismo perfil base y despues el Admin los configura uno a uno (o los copia entre si desde la UI).

| Modulo / Permiso | Usuario | Supervisor (base) | Admin |
|---|:-:|:-:|:-:|
| POS | 3 | 3 | 4 |
| VENTAS | 1 | 3 | 4 |
| DEVOLUCIONES | 3 | 3 | 4 |
| CAMBIOS | 3 | 3 | 4 |
| ARTICULOS | 1 | 3 | 4 |
| TRANSFERENCIAS | 1 | 3 | 4 |
| COMPRAS | 0 | 3 | 4 |
| GASTOS | 1 | 3 | 4 |
| CAJA | 1 | 3 | 4 |
| CLIENTES | 3 | 3 | 4 |
| CTACTE | 1 | 3 | 4 |
| EMPLEADOS | 0 | 3 | 4 |
| PROVEEDORES | 0 | 3 | 4 |
| VENDEDORES | 0 | 3 | 4 |
| BANCOS | 0 | 1 | 4 |
| SUCURSALES | 0 | 0 | 4 |
| USUARIOS | 0 | 0 | 4 |
| AJUSTES | 0 | 0 | 4 |
| AUDITORIA_PRECIOS | 0 | 1 | 4 |
| ARCA | 0 | 0 | 4 |
| **SEGURIDAD** | **0** | **0** | **4** |
| `VENTA.ANULAR` | — | ✓ | ✓ |
| `VENTA.DESCUENTO_SOBRE_MAXIMO` | — | ✓ | ✓ |
| `VENTA.CTACTE_SOBRE_LIMITE` | — | — | ✓ |
| `VENTA.REIMPRIMIR` | — | ✓ | ✓ |
| `ARTICULO.AJUSTE_STOCK` | — | ✓ | ✓ |
| `ARTICULO.VER_COSTO` | — | ✓ | ✓ |
| `CAJA.APERTURA` | — | ✓ | ✓ |
| `CAJA.CIERRE` | — | ✓ | ✓ |
| `CAJA.EDITAR_MOVIMIENTO` | — | — | ✓ |
| `CONFIG.MAX_DESCUENTO` | — | — | ✓ |
| `CONFIG.TIPOS_COBRO_PAGO` | — | — | ✓ |
| `CLIENTE.REACTIVAR` | — | ✓ | ✓ |
| `CLIENTE.EDITAR_LIMITE_CREDITO` | — | ✓ | ✓ |
| `USUARIO.ELIMINAR` | — | — | ✓ |
| `REPORTES.EXPORTAR` | — | ✓ | ✓ |
| `ARCA.AUTORIZAR` | — | — | ✓ |

**Regla fija**: el rol `Usuario` NUNCA tiene permisos especiales. El rol `Admin` TIENE todos los modulos en 4 y todos los permisos especiales marcados — read-only desde la UI.

---

## 6. Contrato de datos del login

Sin JWT en esta fase. El login sigue como hoy pero devuelve el rol efectivo con sus permisos resueltos:

```json
{
  "usuario": {
    "guid": "…",
    "id": "AJE",
    "nombre": "…",
    "codigoUsuario": 1,
    "guidSucursal": "…",
    "rol": {
      "guid": "…",
      "nombre": "Admin",
      "tipo": "ADMIN"
    },
    "permisos": {
      "modulos": { "VENTAS": 4, "ARTICULOS": 4, "USUARIOS": 4, "SEGURIDAD": 4, "…": 0 },
      "especiales": ["VENTA.ANULAR", "USUARIO.ELIMINAR", "…"]
    }
  }
}
```

El front guarda esto en `State.usuario` y lo usa con el helper `Can` (ver 7.2).

**Identificacion del usuario en requests**: hasta que haya JWT, las rutas de mutacion reciben `guidUsuario` desde el frontend (body o header `X-User-Guid`). El backend valida que exista y no este borrado antes de procesar. Este `guidUsuario` es el que se graba en auditorias. **Es confiable solo en red cerrada** — al activar JWT en el futuro, se saca del body/header y se toma del token.

---

## 7. API de autorizacion

### 7.1. Backend (Node.js)

Middleware nuevo en `src/api/middleware/auth.js`:

- `loadUser(req, res, next)` — lee `guidUsuario` del body/header, carga `req.user` con `{ guid, rol, permisos }` desde la DB. Si no existe o esta borrado, 401.
- `requirePermission(spec)` — factory que valida permisos. Formato:

```js
// Nivel minimo en un modulo:
requirePermission({ modulo: 'ARTICULOS', nivel: 4 })

// Permiso especial:
requirePermission({ especial: 'VENTA.ANULAR' })

// OR logico (cualquiera alcanza):
requirePermission({ any: [{ modulo: 'VENTAS', nivel: 4 }, { especial: 'VENTA.ANULAR' }] })
```

Comportamiento del middleware:

1. Si `req.user.rol.tipo === 'ADMIN'`, permite siempre (shortcut).
2. Si el spec tiene `especial`: inserta fila en `AuditoriaAcciones`. `RESULTADO='OK'` si procede, `RESULTADO='DENIED'` si no.
3. Si el spec tiene `modulo/nivel`: compara contra `req.user.permisos.modulos`. No audita (volumen alto; solo 403 con mensaje).

Uso en rutas:

```js
router.delete('/:guid',
  loadUser,
  requirePermission({ especial: 'USUARIO.ELIMINAR' }),
  handler);
```

### 7.2. Frontend (SPA)

Helper unico en `public/js/app.js`:

```js
Can.modulo('ARTICULOS', 3)        // true si nivel >= 3
Can.especial('VENTA.ANULAR')       // true si el permiso esta en la lista
Can.any([...])                      // OR logico
```

Tres patrones de uso en UI:

1. **Menu lateral**: modulos con nivel `0` llevan `d-none` en el `<li>`.
2. **Botones de accion**: `disabled` con `title="Sin permiso"` en vez de ocultar — mejor UX.
3. **Campos editables**: `readonly` cuando solo hay nivel de lectura.

---

## 8. Vista "Seguridad" (solo Admin)

Accesible desde el menu lateral (dentro de Configuracion, oculta para no-Admin). Tiene 4 pestanas:

### 8.1. Roles
- Lista de los 12 roles con contador de usuarios asignados a cada uno.
- `Usuario` y `Admin` son read-only. `Supervisor_1..10` tienen boton Editar.

### 8.2. Configurar rol (detalle de un Supervisor_n)
- Grilla de modulos (filas) × niveles 0/1/2/3/4 (radios).
- Checkboxes de permisos especiales agrupados por prefijo (VENTA, ARTICULO, CAJA, CLIENTE, USUARIO, CONFIG, REPORTES, ARCA).
- Boton **"Copiar permisos de…"** con dropdown de los otros supervisores. Reemplaza `Roles_Modulos` y `Roles_PermisosEspeciales` del rol actual con los del origen. Registra en `AuditoriaSeguridad` con `ACCION='COPIAR'`.
- Boton Guardar: antes de commit, calcula diff con estado anterior y graba una fila por cada cambio en `AuditoriaSeguridad`.

### 8.3. Asignar rol a usuarios
- Lista de usuarios con dropdown de rol por fila.
- Cambio → `AuditoriaSeguridad` con `ENTIDAD='USUARIO_ROL'`, `ANTES_JSON` y `DESPUES_JSON` con el rol previo y el nuevo.
- Los usuarios actualmente con rol `Admin` aparecen deshabilitados (para cambiar un Admin se requiere operacion manual via SQL — decidido por seguridad).

### 8.4. Auditoria
Dos sub-tabs:

- **Cambios de configuracion** (`AuditoriaSeguridad`): filtro por usuario, fecha, entidad, accion. Cada fila expandible muestra `ANTES_JSON` vs `DESPUES_JSON`.
- **Intervenciones operativas** (`AuditoriaAcciones`): filtro por usuario, fecha, codigo de permiso, resultado (`OK` / `DENIED`). Cada fila con link al registro afectado (si aplica).

---

## 9. Plan de implementacion (fases)

Cada fase es un PR independiente contra `main`.

### Fase 1 — Modelo de datos
- Migracion SQL: tablas `Modulos`, `Roles`, `Roles_Modulos`, `Roles_PermisosEspeciales`, `AuditoriaSeguridad`, `AuditoriaAcciones`.
- `ALTER TABLE Usuarios ADD GUIDROLES`.
- Seeds: 21 modulos, 12 roles, matriz de la seccion 5 para roles `Usuario`, `Supervisor_1..10` (todos arrancan iguales) y `Admin`.
- Script de migracion de `Usuarios.GUIDROLES` segun `NIVEL` legacy.

### Fase 2 — Backend: login + middleware
- Endpoint `POST /api/usuarios/login` devuelve estructura del punto 6.
- Middleware `loadUser` + `requirePermission`.
- Aplicar `loadUser` a TODAS las rutas salvo `/login` y `/health`. Aun sin `requirePermission` por ahora — solo cargar el usuario para que este disponible.

### Fase 3 — Backend: permisos
- Aplicar `requirePermission({ modulo, nivel })` a las rutas CRUD de cada modulo.
- Aplicar `requirePermission({ especial })` a los 16 permisos especiales del punto 4.2.
- Auditoria en `AuditoriaAcciones` desde el middleware.

### Fase 4 — Frontend: helper Can + menu
- `Can.modulo()` / `Can.especial()` en `app.js`.
- Ocultar modulos con nivel 0 en el sidebar.
- Deshabilitar botones de acciones CRUD segun nivel.
- Deshabilitar botones de permisos especiales.

### Fase 5 — Vista Seguridad (CRUD)
- Implementar las 4 pestanas del punto 8.
- APIs: `/api/seguridad/roles`, `/api/seguridad/roles/:guid/modulos`, `/api/seguridad/roles/:guid/permisos`, `/api/seguridad/usuarios-rol`, `/api/seguridad/auditoria-seguridad`, `/api/seguridad/auditoria-acciones`.
- Todas las rutas protegidas por `requirePermission({ modulo: 'SEGURIDAD', nivel: 1 })` — solo Admin.

### Fase 6 (futuro, ya agendado) — Seguridad base
- JWT + hash bcrypt de claves. Desplaza el `guidUsuario` del body/header al token.
- Rate limit en login.

---

## 10. Decisiones cerradas

- **Escala de niveles**: 0-4 acumulativo. ✓
- **`CLIENTE.REACTIVAR`**: si, como permiso especial (solo este de Cliente por ahora). ✓
- **`USUARIO.ELIMINAR`**: permiso especial (el nivel 4 del modulo USUARIOS no habilita eliminar). ✓
- **`ARTICULO.AJUSTE_STOCK`, `CAJA.APERTURA`, `CAJA.CIERRE`, `VENTA.ANULAR`**: permisos especiales. ✓
- **JWT/hash**: pospuestos (Fase 6). ✓
- **Auditoria de DENIED**: si — se graba cuando un usuario intenta y no tiene. ✓
- **`AUDITORIA.VER` como permiso especial**: eliminado. Se cubre con nivel del modulo `AUDITORIA_PRECIOS`. ✓

---

## 11. Decisiones pendientes (opcionales para el futuro)

1. **Alias editable para Supervisor_n**: permitir renombrarlos a "Supervisor Caja", "Supervisor Tienda", etc. (columna `NOMBRE_ALIAS` en `Roles`). Decidir en Fase 5.
2. **Expiracion del rol Admin**: si algun dia se requiere MFA o confirmacion adicional para acciones de Admin. No urgente.
3. **Reportes de auditoria**: exportable a PDF/Excel con filtros por rango. Mejora opcional en Fase 5.

---

## 12. Lo que NO se cambia

- Logica de negocio existente (ventas, cta.cte., recargos, cambios, etc.) queda intacta.
- Modelo de `Usuarios` legacy (char(16), `NIVEL smallint`, `CLAVE char(20)`) se mantiene — se extiende con `GUIDROLES`, no se rompe.
- Tabla `Modulos_Usuarios` legacy se deja en paz. En una fase posterior se puede deprecar.
- Endpoints existentes mantienen su contrato. Solo suman validacion via `requirePermission`.
