SET NOCOUNT ON;
GO

-- =============================================================================
-- 4. CreditosDevoluciones — Creditos a favor del cliente generados por devoluciones
--    CreditosDevolucionesUsos — Registro de cada uso parcial/total del credito
-- =============================================================================

-- ─── CreditosDevoluciones ──────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CreditosDevoluciones')
BEGIN
    CREATE TABLE CreditosDevoluciones (
        GUID                        CHAR(16)        NOT NULL,
        GUIDCLIENTES                CHAR(16)        NOT NULL,
        GUIDREMITOSDEVOLUCIONES     CHAR(16)        NOT NULL,
        GUIDSUCURSALES              CHAR(16)        NOT NULL,
        FECHA                       DATE            NOT NULL,
        MONTOORIGINAL               DECIMAL(13,3)   NOT NULL,
        MONTOUSADO                  DECIMAL(13,3)   NOT NULL DEFAULT 0,
        ESTADO                      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVO',
        ts                          FLOAT           NOT NULL,
        sts                         FLOAT           NOT NULL,
        dts                         FLOAT           NULL,

        CONSTRAINT PK_CreditosDevoluciones PRIMARY KEY (GUID),
        CONSTRAINT UQ_CreditosDevoluciones_Guid UNIQUE (GUID),
        CONSTRAINT FK_CreditosDevoluciones_GuidClientes
            FOREIGN KEY (GUIDCLIENTES) REFERENCES Clientes (GUID),
        CONSTRAINT FK_CreditosDevoluciones_GuidRemitosDevoluciones
            FOREIGN KEY (GUIDREMITOSDEVOLUCIONES) REFERENCES RemitosDevoluciones (GUID),
        CONSTRAINT FK_CreditosDevoluciones_GuidSucursales
            FOREIGN KEY (GUIDSUCURSALES) REFERENCES Sucursales (GUID)
    );

    CREATE INDEX IX_CreditosDevoluciones_GuidClientes_Estado
        ON CreditosDevoluciones (GUIDCLIENTES, ESTADO)
        WHERE dts IS NULL;

    CREATE INDEX IX_CreditosDevoluciones_GuidRemitosDevoluciones
        ON CreditosDevoluciones (GUIDREMITOSDEVOLUCIONES);
END;
GO

-- ─── CreditosDevolucionesUsos ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CreditosDevolucionesUsos')
BEGIN
    CREATE TABLE CreditosDevolucionesUsos (
        GUID                        CHAR(16)        NOT NULL,
        GUIDCREDITOSDEVOLUCIONES    CHAR(16)        NOT NULL,
        GUIDREMITOS                 CHAR(16)        NOT NULL,
        GUIDFORMAPAGOS              CHAR(16)        NOT NULL,
        MONTOUSADO                  DECIMAL(13,3)   NOT NULL,
        FECHA                       DATE            NOT NULL,
        ts                          FLOAT           NOT NULL,
        sts                         FLOAT           NOT NULL,
        dts                         FLOAT           NULL,

        CONSTRAINT PK_CreditosDevolucionesUsos PRIMARY KEY (GUID),
        CONSTRAINT UQ_CreditosDevolucionesUsos_Guid UNIQUE (GUID),
        CONSTRAINT FK_CreditosDevolucionesUsos_GuidCreditos
            FOREIGN KEY (GUIDCREDITOSDEVOLUCIONES) REFERENCES CreditosDevoluciones (GUID),
        CONSTRAINT FK_CreditosDevolucionesUsos_GuidRemitos
            FOREIGN KEY (GUIDREMITOS) REFERENCES Remitos (GUID),
        CONSTRAINT FK_CreditosDevolucionesUsos_GuidFormaPagos
            FOREIGN KEY (GUIDFORMAPAGOS) REFERENCES FormaPagos (GUID)
    );

    CREATE INDEX IX_CreditosDevolucionesUsos_GuidCreditos
        ON CreditosDevolucionesUsos (GUIDCREDITOSDEVOLUCIONES);

    CREATE INDEX IX_CreditosDevolucionesUsos_GuidRemitos
        ON CreditosDevolucionesUsos (GUIDREMITOS);
END;
GO
