SET NOCOUNT ON;
GO

-- =============================================================================
-- 010. Agregar GUIDFORMAPAGOS a MovimientoClientes + Crear PagosParcialesMovimientos
-- =============================================================================
-- Cambio arquitectónico: los cobros de Cta. Cte. ya NO eliminan (dts) ni reducen
-- DEBE en MovimientoClientes. En su lugar:
--   - Pago total: se setea GUIDFORMAPAGOS en el movimiento original
--   - Pago parcial: se registra en PagosParcialesMovimientos
-- Deuda activa = movimientos sin GUIDFORMAPAGOS (descontando parciales)
-- =============================================================================

-- 1. Agregar columna GUIDFORMAPAGOS a MovimientoClientes
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('MovimientoClientes') AND name = 'GUIDFORMAPAGOS'
)
BEGIN
    ALTER TABLE MovimientoClientes
        ADD GUIDFORMAPAGOS CHAR(16) NOT NULL DEFAULT '';
    PRINT 'Columna GUIDFORMAPAGOS agregada a MovimientoClientes';
END;
GO

-- 2. Crear tabla PagosParcialesMovimientos
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PagosParcialesMovimientos')
BEGIN
    CREATE TABLE PagosParcialesMovimientos (
        GUID              CHAR(16)        NOT NULL DEFAULT '',
        GUIDMOVIMIENTOCLIENTES CHAR(16)   NOT NULL DEFAULT '',
        GUIDFORMAPAGOS    CHAR(16)        NOT NULL DEFAULT '',
        IMPORTEPAGADO     DECIMAL(13,3)   NOT NULL DEFAULT 0,
        FECHA             DATE            NULL,
        ts                FLOAT(53)       NOT NULL DEFAULT 0,
        sts               FLOAT(53)       NOT NULL DEFAULT 0,
        dts               FLOAT(53)       NULL DEFAULT 0,

        CONSTRAINT PK_PagosParcialesMovimientos PRIMARY KEY (GUID),
        CONSTRAINT FK_PagosParcialesMovimientos_MovClientes
            FOREIGN KEY (GUIDMOVIMIENTOCLIENTES) REFERENCES MovimientoClientes(GUID)
    );
    PRINT 'Tabla PagosParcialesMovimientos creada';
END;
GO

-- 3. Índice para consultas de saldo parcial por movimiento
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('PagosParcialesMovimientos')
      AND name = 'IX_PagosParcialesMovimientos_GuidMovCli'
)
BEGIN
    CREATE INDEX IX_PagosParcialesMovimientos_GuidMovCli
        ON PagosParcialesMovimientos (GUIDMOVIMIENTOCLIENTES)
        INCLUDE (IMPORTEPAGADO, dts);
    PRINT 'Índice IX_PagosParcialesMovimientos_GuidMovCli creado';
END;
GO

-- 4. Índice para GUIDFORMAPAGOS en MovimientoClientes (filtro deuda activa)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('MovimientoClientes')
      AND name = 'IX_MovimientoClientes_GuidFormaPagos'
)
BEGIN
    CREATE INDEX IX_MovimientoClientes_GuidFormaPagos
        ON MovimientoClientes (GUIDFORMAPAGOS)
        WHERE GUIDFORMAPAGOS = '';
    PRINT 'Índice filtrado IX_MovimientoClientes_GuidFormaPagos creado';
END;
GO

PRINT '== Migración 010 completada: GUIDFORMAPAGOS + PagosParcialesMovimientos ==';
GO
