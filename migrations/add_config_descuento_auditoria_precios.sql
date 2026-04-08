SET NOCOUNT ON;
GO

-- =============================================================================
-- Migración: ConfiguracionDescuento + AuditoriaPreciosVenta
-- Descripción: Tabla de configuración de % máximo de descuento en ventas
--              y tabla de auditoría para cambios manuales de precio en POS
-- Tablas: 2
-- Convenciones: campos base legacy (GUID char(16), ts/sts/dts float)
-- =============================================================================

-- =============================================================================
-- 1. ConfiguracionDescuento — % máximo de descuento permitido en ventas
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ConfiguracionDescuento')
BEGIN
    CREATE TABLE ConfiguracionDescuento (
        GUID                    CHAR(16)        NOT NULL,
        ts                      FLOAT(53)       NOT NULL,
        sts                     FLOAT(53)       NOT NULL,
        dts                     FLOAT(53)       NULL,

        MaxDescuentoPorcentaje  DECIMAL(5,2)    NOT NULL DEFAULT 10.00,

        CONSTRAINT PK_ConfiguracionDescuento PRIMARY KEY (GUID)
    );

    PRINT 'Tabla ConfiguracionDescuento creada correctamente.';
END;
ELSE
    PRINT 'Tabla ConfiguracionDescuento ya existe, se omite creación.';
GO

-- =============================================================================
-- 2. AuditoriaPreciosVenta — Registro de cambios manuales de precio en POS
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AuditoriaPreciosVenta')
BEGIN
    CREATE TABLE AuditoriaPreciosVenta (
        GUID                    CHAR(16)        NOT NULL,
        ts                      FLOAT(53)       NOT NULL,
        sts                     FLOAT(53)       NOT NULL,
        dts                     FLOAT(53)       NULL,

        -- FK referencias
        GuidRemito              CHAR(16)        NULL,
        GuidArticulo            CHAR(16)        NULL,
        GuidUsuario             CHAR(16)        NULL,

        -- Datos del artículo
        CodigoArticulo          VARCHAR(255)    NULL,
        Descripcion             VARCHAR(1024)   NULL,

        -- Precios y diferencias
        PrecioBase              DECIMAL(13,2)   NOT NULL,   -- precio original de la BD
        PrecioModificado        DECIMAL(13,2)   NOT NULL,   -- precio ingresado por el vendedor
        Diferencia              DECIMAL(13,2)   NOT NULL,   -- PrecioModificado - PrecioBase
        DiferenciaPorcentaje    DECIMAL(5,2)    NOT NULL,   -- ((PrecioModificado - PrecioBase) / PrecioBase) * 100

        -- Usuario que realizó el cambio
        NombreUsuario           VARCHAR(255)    NULL,

        -- Fecha y hora del cambio
        Fecha                   INT             NULL,
        Hora                    INT             NULL,

        CONSTRAINT PK_AuditoriaPreciosVenta PRIMARY KEY (GUID)
    );

    PRINT 'Tabla AuditoriaPreciosVenta creada correctamente.';
END;
ELSE
    PRINT 'Tabla AuditoriaPreciosVenta ya existe, se omite creación.';
GO

-- =============================================================================
-- Índices
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaPreciosVenta_GuidRemito' AND object_id = OBJECT_ID('AuditoriaPreciosVenta'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditoriaPreciosVenta_GuidRemito
        ON AuditoriaPreciosVenta (GuidRemito);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaPreciosVenta_GuidArticulo' AND object_id = OBJECT_ID('AuditoriaPreciosVenta'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditoriaPreciosVenta_GuidArticulo
        ON AuditoriaPreciosVenta (GuidArticulo);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaPreciosVenta_GuidUsuario' AND object_id = OBJECT_ID('AuditoriaPreciosVenta'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditoriaPreciosVenta_GuidUsuario
        ON AuditoriaPreciosVenta (GuidUsuario);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaPreciosVenta_Fecha' AND object_id = OBJECT_ID('AuditoriaPreciosVenta'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditoriaPreciosVenta_Fecha
        ON AuditoriaPreciosVenta (Fecha);
END;
GO

PRINT '== Migración completada: ConfiguracionDescuento + AuditoriaPreciosVenta ==';
GO
