SET NOCOUNT ON;
GO

-- =============================================================================
-- 8. TiposCobrosPagos — Tipos de cobros/pagos con dirección de movimiento
--    TIPOMOVIMIENTO: A=Ambos (Ingresos-Egresos), I=Ingresos, E=Egresos,
--                    X=Para Cuentas Corrientes
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TiposCobrosPagos')
BEGIN
    CREATE TABLE TiposCobrosPagos (
        GUID              CHAR(16)    NOT NULL,
        TIPO              TINYINT     NOT NULL,
        DESCRIPCION       CHAR(40)    NOT NULL,
        TIPOMOVIMIENTO    CHAR(1)     NOT NULL,

        ts                FLOAT       NULL,
        sts               FLOAT       NULL,
        dts               FLOAT       NULL,

        CONSTRAINT PK_TiposCobrosPagos PRIMARY KEY (GUID),
        CONSTRAINT UQ_TiposCobrosPagos_Guid UNIQUE (GUID),
        CONSTRAINT CK_TiposCobrosPagos_TipoMov CHECK (TIPOMOVIMIENTO IN ('A','I','E','X'))
    );
END;
GO
