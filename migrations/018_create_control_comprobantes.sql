SET NOCOUNT ON;
GO

-- =============================================================================
-- 018. ControlComprobantes — Registro consolidado de ventas, devoluciones,
--      cambios y cobranzas por comprobante y total.
--      Permite consulta de deuda activa (Conciliado=0) y cuenta corriente
--      con saldo inicial/final por rango de fechas.
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ControlComprobantes')
BEGIN
    CREATE TABLE ControlComprobantes (
        GUID                        CHAR(16)        NOT NULL,
        FECHA                       INT             NOT NULL DEFAULT 0,      -- Clarion date
        HORA                        INT             NOT NULL DEFAULT 0,      -- Clarion time
        CONCEPTO                    VARCHAR(255)    NOT NULL DEFAULT '',
        DEBE                        DECIMAL(13,3)   NOT NULL DEFAULT 0,
        HABER                       DECIMAL(13,3)   NOT NULL DEFAULT 0,
        CONCILIADO                  TINYINT         NOT NULL DEFAULT 0,      -- 0=Sin Conciliar, 1=Conciliado
        TIPOMOVIMIENTO              TINYINT         NOT NULL DEFAULT 1,      -- 1=Contado, 2=Cuenta Corriente
        GUIDCLIENTE                 CHAR(16)        NOT NULL DEFAULT '',
        GUIDREMITO                  CHAR(16)        NOT NULL DEFAULT '',
        GUIDREMITOSDEVOLUCIONES     CHAR(16)        NOT NULL DEFAULT '',
        GUIDREMITOSCAMBIOS          CHAR(16)        NOT NULL DEFAULT '',
        GUIDCAJADIARIA              CHAR(16)        NOT NULL DEFAULT '',
        ts                          FLOAT           NULL,
        sts                         FLOAT           NULL,
        dts                         FLOAT           NULL,

        CONSTRAINT PK_ControlComprobantes PRIMARY KEY (GUID)
    );
END;
GO

-- Indices para consultas frecuentes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ControlComprobantes_GuidCliente_Conciliado')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ControlComprobantes_GuidCliente_Conciliado
    ON ControlComprobantes (GUIDCLIENTE, CONCILIADO)
    INCLUDE (FECHA, CONCEPTO, DEBE, HABER, TIPOMOVIMIENTO, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ControlComprobantes_GuidCliente_Fecha')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ControlComprobantes_GuidCliente_Fecha
    ON ControlComprobantes (GUIDCLIENTE, FECHA)
    INCLUDE (CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ControlComprobantes_GuidRemito')
BEGIN
    CREATE NONCLUSTERED INDEX IX_ControlComprobantes_GuidRemito
    ON ControlComprobantes (GUIDREMITO)
    WHERE GUIDREMITO <> '';
END;
GO

PRINT '018 — ControlComprobantes: tabla + 3 indices creados';
GO
