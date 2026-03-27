SET NOCOUNT ON;
GO

-- =============================================================================
-- 016. Soft-delete MC duplicados de cambios
-- 1. MC insertados por migración 015 para remitos de cambio
-- 2. MC "Saldo a favor" que duplican la diferencia ya implícita en partida doble
-- =============================================================================

-- 1. Soft-delete MC de migración 015 para remitos de cambio
UPDATE mc
SET mc.dts = mc.ts
FROM MovimientoClientes mc
INNER JOIN Remitos r ON r.GUID = mc.GUIDREMITOS AND (r.dts IS NULL OR r.dts = 0)
WHERE mc.DESCRIPCION LIKE 'Venta - % crédito)'
  AND mc.DEBE > 0 AND mc.HABER = 0
  AND (mc.dts IS NULL OR mc.dts = 0)
  AND r.GUIDREMITOSCAMBIOS IS NOT NULL AND RTRIM(r.GUIDREMITOSCAMBIOS) <> '';

PRINT '016a - MC duplicados de migración 015 soft-deleted: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- 2. Soft-delete MC "Saldo a favor (diferencia ...)" que duplican la partida doble del cambio
UPDATE MovimientoClientes
SET dts = ts
WHERE DESCRIPCION LIKE 'Cambio - Saldo a favor (diferencia%'
  AND DEBE = 0 AND HABER > 0
  AND (dts IS NULL OR dts = 0);

PRINT '016b - MC "Saldo a favor" duplicados soft-deleted: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO
