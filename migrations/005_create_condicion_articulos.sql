SET NOCOUNT ON;
GO

-- =============================================================================
-- 5. CondicionArticulos — Estados posibles de un articulo (NUEVO, USADO, etc.)
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CondicionArticulos')
BEGIN
    CREATE TABLE CondicionArticulos (
        GUID        CHAR(16)        NOT NULL,
        ESTADO      VARCHAR(50)     NOT NULL,

        CONSTRAINT PK_CondicionArticulos PRIMARY KEY (GUID),
        CONSTRAINT UQ_CondicionArticulos_Guid UNIQUE (GUID),
        CONSTRAINT UQ_CondicionArticulos_Estado UNIQUE (ESTADO)
    );

    -- Datos iniciales
    INSERT INTO CondicionArticulos (GUID, ESTADO) VALUES ('CONDNUEVO0000001', 'NUEVO');
    INSERT INTO CondicionArticulos (GUID, ESTADO) VALUES ('CONDUSADO0000002', 'USADO');
    INSERT INTO CondicionArticulos (GUID, ESTADO) VALUES ('CONDDEFEC0000003', 'DEFECTUOSO');
END;
GO
