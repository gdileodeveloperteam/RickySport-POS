SET NOCOUNT ON;
GO

-- =============================================================================
-- Migracion: Agregar COEFICIENTE a FormaPagos
-- Descripcion: Almacena el coeficiente del plan/medio de pago usado en la venta,
--              necesario para aplicar el mismo recargo en cambios posteriores.
-- =============================================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('FormaPagos') AND name = 'COEFICIENTE'
)
BEGIN
    ALTER TABLE FormaPagos
        ADD COEFICIENTE DECIMAL(10,4) NULL DEFAULT 0;

    PRINT 'Columna COEFICIENTE agregada a FormaPagos.';
END;
ELSE
    PRINT 'Columna COEFICIENTE ya existe en FormaPagos, se omite.';
GO
