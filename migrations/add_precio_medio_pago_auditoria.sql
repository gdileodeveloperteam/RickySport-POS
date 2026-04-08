SET NOCOUNT ON;
GO

-- =============================================================================
-- Migración: Agregar PrecioMedioPago a AuditoriaPreciosVenta
-- Descripción: Precio con recargo del medio de pago aplicado (entre base y modificado)
-- =============================================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AuditoriaPreciosVenta') AND name = 'PrecioMedioPago'
)
BEGIN
    ALTER TABLE AuditoriaPreciosVenta
        ADD PrecioMedioPago DECIMAL(13,2) NULL;

    PRINT 'Columna PrecioMedioPago agregada a AuditoriaPreciosVenta.';
END;
ELSE
    PRINT 'Columna PrecioMedioPago ya existe, se omite.';
GO
