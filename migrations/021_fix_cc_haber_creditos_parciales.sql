SET NOCOUNT ON;
GO

-- =============================================================================
-- 021. Fix HABER en ControlComprobantes para créditos parcialmente consumidos
--      HABER debe reflejar el saldo restante, no el monto original
-- =============================================================================

-- Actualizar HABER = MONTOORIGINAL - MONTOUSADO (saldo restante del crédito)
UPDATE cc
SET cc.HABER = cd.MONTOORIGINAL - cd.MONTOUSADO
FROM ControlComprobantes cc
INNER JOIN CreditosDevoluciones cd
    ON cd.GUIDREMITOSDEVOLUCIONES = cc.GUIDREMITOSDEVOLUCIONES
    AND cc.GUIDREMITOSDEVOLUCIONES <> ''
    AND (cd.dts IS NULL OR cd.dts = 0)
WHERE cc.CONCILIADO = 0
  AND (cc.dts IS NULL OR cc.dts = 0)
  AND cd.MONTOUSADO > 0
  AND cc.HABER <> (cd.MONTOORIGINAL - cd.MONTOUSADO);

DECLARE @fixed INT = @@ROWCOUNT;
PRINT '021 — CC creditos parciales corregidos: ' + CAST(@fixed AS VARCHAR);

-- Recalcular saldos
EXEC SP_RecalcularSaldoCliente;
GO

PRINT '021 — Saldos recalculados';
GO
