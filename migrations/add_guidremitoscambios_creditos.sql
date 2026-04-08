SET NOCOUNT ON;
GO

-- =============================================================================
-- Add GUIDREMITOSCAMBIOS to CreditosDevoluciones
-- Allows cambios with surplus (totalCambio > totalVenta) to generate reusable credits
-- =============================================================================

-- Drop FK on GUIDREMITOSDEVOLUCIONES so cambio-origin credits can have empty value
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_CreditosDevoluciones_GuidRemitosDevoluciones')
    ALTER TABLE CreditosDevoluciones DROP CONSTRAINT FK_CreditosDevoluciones_GuidRemitosDevoluciones;
GO

-- Add GUIDREMITOSCAMBIOS column
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CreditosDevoluciones') AND name = 'GUIDREMITOSCAMBIOS')
    ALTER TABLE CreditosDevoluciones ADD GUIDREMITOSCAMBIOS CHAR(16) NOT NULL DEFAULT '';
GO

-- Index for lookup by cambio
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CreditosDevoluciones_GuidRemitosCambios' AND object_id = OBJECT_ID('CreditosDevoluciones'))
    CREATE INDEX IX_CreditosDevoluciones_GuidRemitosCambios
        ON CreditosDevoluciones (GUIDREMITOSCAMBIOS)
        WHERE GUIDREMITOSCAMBIOS <> '';
GO

PRINT 'Migration complete: GUIDREMITOSCAMBIOS added to CreditosDevoluciones';
GO
