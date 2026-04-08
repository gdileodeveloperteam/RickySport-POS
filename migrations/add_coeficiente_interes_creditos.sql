SET NOCOUNT ON;
GO

-- =============================================================================
-- Add COEFICIENTE and INTERES to CreditosDevoluciones
-- Stores the original payment method surcharge so it can be reapplied on reuse
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CreditosDevoluciones') AND name = 'COEFICIENTE')
    ALTER TABLE CreditosDevoluciones ADD COEFICIENTE DECIMAL(10,4) NOT NULL DEFAULT 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CreditosDevoluciones') AND name = 'INTERES')
    ALTER TABLE CreditosDevoluciones ADD INTERES DECIMAL(7,2) NOT NULL DEFAULT 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CreditosDevoluciones') AND name = 'TIPOPAGO')
    ALTER TABLE CreditosDevoluciones ADD TIPOPAGO VARCHAR(30) NOT NULL DEFAULT '';
GO

-- Backfill: update existing credits with original payment info from FormaPagos
UPDATE cd
SET cd.COEFICIENTE = ISNULL(fp.COEFICIENTE, 0),
    cd.INTERES     = ISNULL(fp.INTERES, 0),
    cd.TIPOPAGO    = ISNULL(RTRIM(LTRIM(fp.TIPOCOMPROBANTE)), '')
FROM CreditosDevoluciones cd
LEFT JOIN RemitosDevoluciones rd ON rd.GUID = cd.GUIDREMITOSDEVOLUCIONES AND RTRIM(cd.GUIDREMITOSDEVOLUCIONES) <> ''
LEFT JOIN RemitosCambios rc ON rc.GUID = cd.GUIDREMITOSCAMBIOS AND RTRIM(cd.GUIDREMITOSCAMBIOS) <> ''
OUTER APPLY (
    SELECT TOP 1 fp2.COEFICIENTE, fp2.INTERES, fp2.TIPOCOMPROBANTE
    FROM FormaPagos fp2
    WHERE fp2.GUIDREMITOS = COALESCE(NULLIF(RTRIM(rd.GUIDREMITOS), ''), NULLIF(RTRIM(rc.GUIDREMITOS), ''))
      AND (fp2.dts IS NULL OR fp2.dts = 0)
    ORDER BY fp2.ts DESC
) fp
WHERE cd.COEFICIENTE = 0 AND cd.INTERES = 0;
GO

PRINT 'Migration complete: COEFICIENTE, INTERES, TIPOPAGO added to CreditosDevoluciones';
GO
