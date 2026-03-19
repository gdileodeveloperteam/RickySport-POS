SET NOCOUNT ON;
GO

-- =============================================================================
-- 2. MovimientoAdelantos — Registro de adelantos y retiros de efectivo personal
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'MovimientoAdelantos')
BEGIN
    CREATE TABLE MovimientoAdelantos (
        GUID                CHAR(16)        NOT NULL,
        GUIDEMPLEADOS       CHAR(16)        NOT NULL,
        GUIDSUCURSALES      CHAR(16)        NOT NULL,
        GUIDCAJAGASTOS      CHAR(16)        NULL,
        FECHA               DATE            NOT NULL,
        DEBE                DECIMAL(13,3)   NULL DEFAULT 0,
        HABER               DECIMAL(13,3)   NULL DEFAULT 0,
        SALDO               DECIMAL(13,3)   NULL DEFAULT 0,
        OBSERVACIONES       VARCHAR(255)    NULL,
        MESIMPUTACION       VARCHAR(7)      NULL,
        ts                  FLOAT           NULL,
        sts                 FLOAT           NULL,
        dts                 FLOAT           NULL,

        CONSTRAINT PK_MovimientoAdelantos PRIMARY KEY (Guid),
        CONSTRAINT FK_MovimientoAdelantos_GuidSucursales
            FOREIGN KEY (GuidSucursales) REFERENCES Sucursales (Guid)
    );

    CREATE INDEX IX_MovimientoAdelantos_GuidEmpleados_Fecha
        ON MovimientoAdelantos (GuidEmpleados, Fecha);

    CREATE INDEX IX_MovimientoAdelantos_GuidSucursales_Fecha
        ON MovimientoAdelantos (GuidSucursales, Fecha);

    CREATE INDEX IX_MovimientoAdelantos_MesImputacion
        ON MovimientoAdelantos (MesImputacion);
END;
GO
