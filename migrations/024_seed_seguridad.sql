SET NOCOUNT ON;

-- =============================================================================
-- 24. Seguridad — Seeds (Modulos, Roles, Roles_Modulos, Roles_PermisosEspeciales)
--                + migracion de Usuarios.GUIDROLES
--
--     Idempotente: se puede correr multiples veces sin duplicar ni pisar cambios
--     manuales (solo inserta filas faltantes, actualiza solo campos descriptivos).
--
--     Ejecutable en cualquier cliente ODBC (sin 'GO'). Todas las variables
--     DECLARE conviven en un solo batch con nombres distintos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 24.1 Modulos — 21 modulos del catalogo
-- -----------------------------------------------------------------------------
MERGE INTO Modulos AS tgt
USING (VALUES
    ('MOD_000000000001', 'POS',               'Nueva Venta',           1),
    ('MOD_000000000002', 'VENTAS',            'Ventas',                2),
    ('MOD_000000000003', 'DEVOLUCIONES',      'Devoluciones',          3),
    ('MOD_000000000004', 'CAMBIOS',           'Cambios',               4),
    ('MOD_000000000005', 'CLIENTES',          'Clientes',              5),
    ('MOD_000000000006', 'CTACTE',            'Cuenta Corriente',      6),
    ('MOD_000000000007', 'TRANSFERENCIAS',    'Transferencias',        7),
    ('MOD_000000000008', 'COMPRAS',           'Ingresos por Compras',  8),
    ('MOD_000000000009', 'GASTOS',            'Gastos/Adelantos',      9),
    ('MOD_000000000010', 'CAJA',              'Caja Diaria',          10),
    ('MOD_000000000011', 'ARTICULOS',         'Articulos',            11),
    ('MOD_000000000012', 'BANCOS',            'Bancos',               12),
    ('MOD_000000000013', 'SUCURSALES',        'Sucursales',           13),
    ('MOD_000000000014', 'EMPLEADOS',         'Empleados',            14),
    ('MOD_000000000015', 'PROVEEDORES',       'Proveedores',          15),
    ('MOD_000000000016', 'VENDEDORES',        'Vendedores',           16),
    ('MOD_000000000017', 'USUARIOS',          'Usuarios',             17),
    ('MOD_000000000018', 'AJUSTES',           'Ajustes',              18),
    ('MOD_000000000019', 'AUDITORIA_PRECIOS', 'Auditoria Precios',    19),
    ('MOD_000000000020', 'ARCA',              'ARCA / AFIP',          20),
    ('MOD_000000000021', 'SEGURIDAD',         'Seguridad',            21)
) AS src (GUID, CODIGO_INTERNO, NOMBRE, ORDEN)
ON tgt.CODIGO_INTERNO = src.CODIGO_INTERNO
WHEN MATCHED THEN
    UPDATE SET NOMBRE = src.NOMBRE, ORDEN = src.ORDEN
WHEN NOT MATCHED THEN
    INSERT (GUID, CODIGO_INTERNO, NOMBRE, ORDEN, ts, sts, dts)
    VALUES (src.GUID, src.CODIGO_INTERNO, src.NOMBRE, src.ORDEN,
            DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
            DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
            NULL);

-- -----------------------------------------------------------------------------
-- 24.2 Roles — 12 roles fijos
-- -----------------------------------------------------------------------------
MERGE INTO Roles AS tgt
USING (VALUES
    ('ROL_000000000001', 'Usuario',       'USUARIO',    1, 'Acceso solo por modulos. Sin permisos especiales.'),
    ('ROL_000000000002', 'Supervisor_1',  'SUPERVISOR', 0, 'Supervisor configurable N1'),
    ('ROL_000000000003', 'Supervisor_2',  'SUPERVISOR', 0, 'Supervisor configurable N2'),
    ('ROL_000000000004', 'Supervisor_3',  'SUPERVISOR', 0, 'Supervisor configurable N3'),
    ('ROL_000000000005', 'Supervisor_4',  'SUPERVISOR', 0, 'Supervisor configurable N4'),
    ('ROL_000000000006', 'Supervisor_5',  'SUPERVISOR', 0, 'Supervisor configurable N5'),
    ('ROL_000000000007', 'Supervisor_6',  'SUPERVISOR', 0, 'Supervisor configurable N6'),
    ('ROL_000000000008', 'Supervisor_7',  'SUPERVISOR', 0, 'Supervisor configurable N7'),
    ('ROL_000000000009', 'Supervisor_8',  'SUPERVISOR', 0, 'Supervisor configurable N8'),
    ('ROL_000000000010', 'Supervisor_9',  'SUPERVISOR', 0, 'Supervisor configurable N9'),
    ('ROL_000000000011', 'Supervisor_10', 'SUPERVISOR', 0, 'Supervisor configurable N10'),
    ('ROL_000000000012', 'Admin',         'ADMIN',      1, 'Acceso total. Unico con acceso al modulo SEGURIDAD.')
) AS src (GUID, NOMBRE, TIPO, ES_SISTEMA, DESCRIPCION)
ON tgt.NOMBRE = src.NOMBRE
WHEN MATCHED THEN
    UPDATE SET
        TIPO = src.TIPO,
        ES_SISTEMA = src.ES_SISTEMA,
        DESCRIPCION = src.DESCRIPCION
WHEN NOT MATCHED THEN
    INSERT (GUID, NOMBRE, TIPO, ES_SISTEMA, DESCRIPCION, ts, sts, dts)
    VALUES (src.GUID, src.NOMBRE, src.TIPO, src.ES_SISTEMA, src.DESCRIPCION,
            DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
            DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
            NULL);

-- -----------------------------------------------------------------------------
-- 24.3 Roles_Modulos — matriz de niveles por rol x modulo
--
--     Niveles base (seccion 5 de docs/PERMISOS.md):
--       Usuario:          segun tabla (mezcla 0/1/3)
--       Supervisor_1..10: todos arrancan con mismo "Supervisor base"
--       Admin:            4 en TODOS los modulos
--
--     Idempotente: solo inserta filas faltantes (nunca pisa NIVEL modificado manualmente)
-- -----------------------------------------------------------------------------
DECLARE @nivelesBase TABLE (
    CODIGO_INTERNO    NVARCHAR(64) PRIMARY KEY,
    NIVEL_USUARIO     TINYINT,
    NIVEL_SUPERVISOR  TINYINT,
    NIVEL_ADMIN       TINYINT
);

INSERT INTO @nivelesBase (CODIGO_INTERNO, NIVEL_USUARIO, NIVEL_SUPERVISOR, NIVEL_ADMIN) VALUES
    ('POS',               3, 3, 4),
    ('VENTAS',            1, 3, 4),
    ('DEVOLUCIONES',      3, 3, 4),
    ('CAMBIOS',           3, 3, 4),
    ('CLIENTES',          3, 3, 4),
    ('CTACTE',            1, 3, 4),
    ('TRANSFERENCIAS',    1, 3, 4),
    ('COMPRAS',           0, 3, 4),
    ('GASTOS',            1, 3, 4),
    ('CAJA',              1, 3, 4),
    ('ARTICULOS',         1, 3, 4),
    ('BANCOS',            0, 1, 4),
    ('SUCURSALES',        0, 0, 4),
    ('EMPLEADOS',         0, 3, 4),
    ('PROVEEDORES',       0, 3, 4),
    ('VENDEDORES',        0, 3, 4),
    ('USUARIOS',          0, 0, 4),
    ('AJUSTES',           0, 0, 4),
    ('AUDITORIA_PRECIOS', 0, 1, 4),
    ('ARCA',              0, 0, 4),
    ('SEGURIDAD',         0, 0, 4);

INSERT INTO Roles_Modulos (GUID, GUIDROLES, CODIGO_MODULO, NIVEL, ts, sts, dts)
SELECT
    LEFT(LOWER(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', '')), 16),
    r.GUID,
    m.CODIGO,
    CASE
        WHEN r.TIPO = 'ADMIN'      THEN nb.NIVEL_ADMIN
        WHEN r.TIPO = 'SUPERVISOR' THEN nb.NIVEL_SUPERVISOR
        ELSE                            nb.NIVEL_USUARIO
    END,
    DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
    DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
    NULL
FROM Roles r
CROSS JOIN Modulos m
INNER JOIN @nivelesBase nb ON nb.CODIGO_INTERNO = m.CODIGO_INTERNO
WHERE NOT EXISTS (
    SELECT 1 FROM Roles_Modulos rm
    WHERE rm.GUIDROLES = r.GUID AND rm.CODIGO_MODULO = m.CODIGO
);

-- -----------------------------------------------------------------------------
-- 24.4 Roles_PermisosEspeciales — permisos puntuales base
--
--     Usuario:     ninguno (por definicion)
--     Supervisor:  solo los marcados SUPERVISOR
--     Admin:       todos los permisos especiales
--
--     Idempotente: solo inserta pares (rol, codigo) faltantes
-- -----------------------------------------------------------------------------
DECLARE @permisos TABLE (
    CODIGO           NVARCHAR(64) PRIMARY KEY,
    PARA_SUPERVISOR  BIT,
    PARA_ADMIN       BIT
);

INSERT INTO @permisos (CODIGO, PARA_SUPERVISOR, PARA_ADMIN) VALUES
    ('VENTA.ANULAR',                   1, 1),
    ('VENTA.DESCUENTO_SOBRE_MAXIMO',   1, 1),
    ('VENTA.CTACTE_SOBRE_LIMITE',      0, 1),
    ('VENTA.REIMPRIMIR',               1, 1),
    ('ARTICULO.AJUSTE_STOCK',          1, 1),
    ('ARTICULO.VER_COSTO',             1, 1),
    ('CAJA.APERTURA',                  1, 1),
    ('CAJA.CIERRE',                    1, 1),
    ('CAJA.EDITAR_MOVIMIENTO',         0, 1),
    ('CONFIG.MAX_DESCUENTO',           0, 1),
    ('CONFIG.TIPOS_COBRO_PAGO',        0, 1),
    ('CLIENTE.REACTIVAR',              1, 1),
    ('CLIENTE.EDITAR_LIMITE_CREDITO',  1, 1),
    ('USUARIO.ELIMINAR',               0, 1),
    ('REPORTES.EXPORTAR',              1, 1),
    ('ARCA.AUTORIZAR',                 0, 1);

INSERT INTO Roles_PermisosEspeciales (GUID, GUIDROLES, CODIGO, ts, sts, dts)
SELECT
    LEFT(LOWER(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', '')), 16),
    r.GUID,
    p.CODIGO,
    DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
    DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
    NULL
FROM Roles r
CROSS JOIN @permisos p
WHERE
    (
        (r.TIPO = 'ADMIN'      AND p.PARA_ADMIN = 1)
     OR (r.TIPO = 'SUPERVISOR' AND p.PARA_SUPERVISOR = 1)
    )
    AND NOT EXISTS (
        SELECT 1 FROM Roles_PermisosEspeciales rpe
        WHERE rpe.GUIDROLES = r.GUID AND rpe.CODIGO = p.CODIGO
    );

-- -----------------------------------------------------------------------------
-- 24.5 Usuarios.GUIDROLES — migracion inicial segun NIVEL legacy
--
--     NIVEL = 99              -> Admin
--     NIVEL BETWEEN 50 AND 98 -> Supervisor_1 (default, Admin lo reconfigura luego)
--     Resto                   -> Usuario
--
--     Tambien: el admin hardcodeado (ID='AJE', CODIGOUSUARIO=1) va a Admin
--              independiente del NIVEL.
-- -----------------------------------------------------------------------------
DECLARE @guidAdmin       CHAR(16) = (SELECT GUID FROM Roles WHERE NOMBRE = 'Admin');
DECLARE @guidSupervisor1 CHAR(16) = (SELECT GUID FROM Roles WHERE NOMBRE = 'Supervisor_1');
DECLARE @guidUsuario     CHAR(16) = (SELECT GUID FROM Roles WHERE NOMBRE = 'Usuario');

-- Admin explicito (AJE)
UPDATE Usuarios
   SET GUIDROLES = @guidAdmin
 WHERE GUIDROLES IS NULL
   AND LTRIM(RTRIM(ID)) = 'AJE'
   AND CODIGOUSUARIO = 1;

-- NIVEL = 99 -> Admin
UPDATE Usuarios
   SET GUIDROLES = @guidAdmin
 WHERE GUIDROLES IS NULL
   AND NIVEL = 99;

-- NIVEL 50..98 -> Supervisor_1
UPDATE Usuarios
   SET GUIDROLES = @guidSupervisor1
 WHERE GUIDROLES IS NULL
   AND NIVEL BETWEEN 50 AND 98;

-- Resto -> Usuario
UPDATE Usuarios
   SET GUIDROLES = @guidUsuario
 WHERE GUIDROLES IS NULL;

-- -----------------------------------------------------------------------------
-- Resumen
-- -----------------------------------------------------------------------------
DECLARE @countModulos INT = (SELECT COUNT(*) FROM Modulos);
DECLARE @countRoles   INT = (SELECT COUNT(*) FROM Roles);
DECLARE @countRM      INT = (SELECT COUNT(*) FROM Roles_Modulos);
DECLARE @countRPE     INT = (SELECT COUNT(*) FROM Roles_PermisosEspeciales);
DECLARE @countUsr     INT = (SELECT COUNT(*) FROM Usuarios WHERE GUIDROLES IS NOT NULL);
DECLARE @countUsrNull INT = (SELECT COUNT(*) FROM Usuarios WHERE GUIDROLES IS NULL);

PRINT 'Migracion 024 completada.';
PRINT '  Modulos:                 ' + CAST(@countModulos AS NVARCHAR);
PRINT '  Roles:                   ' + CAST(@countRoles   AS NVARCHAR);
PRINT '  Roles_Modulos:           ' + CAST(@countRM      AS NVARCHAR);
PRINT '  Roles_PermisosEspeciales:' + CAST(@countRPE     AS NVARCHAR);
PRINT '  Usuarios con rol:        ' + CAST(@countUsr     AS NVARCHAR);
PRINT '  Usuarios sin rol:        ' + CAST(@countUsrNull AS NVARCHAR);
