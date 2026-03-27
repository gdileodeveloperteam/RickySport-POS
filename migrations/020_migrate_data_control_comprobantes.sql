SET NOCOUNT ON;
GO

-- =============================================================================
-- 020. Migración de datos históricos a ControlComprobantes
--      Reconstruye desde Remitos, RemitosDevoluciones, RemitosCambios y
--      MovimientoClientes (cobros).
--      Solo inserta registros que NO existan ya en ControlComprobantes.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. VENTAS CONTADO: Remitos sin deuda pendiente en MC
--    DEBE = HABER = TOTAL, Conciliado = 1, TipoMov = 1
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ControlComprobantes
    (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO,
     GUIDCLIENTE, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA,
     ts, sts)
SELECT
    LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 16),
    r.FECHA, r.HORA, 'VTA CONTADO',
    r.TOTAL, r.TOTAL, 1, 1,
    r.GUIDCLIENTES, r.GUID, '', '', '',
    r.ts, r.sts
FROM Remitos r
WHERE (r.dts IS NULL OR r.dts = 0)
  AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)
  -- No tiene MC con deuda pendiente (HABER=0 y sin GUIDFORMAPAGOS)
  AND NOT EXISTS (
      SELECT 1 FROM MovimientoClientes mc
      WHERE mc.GUIDREMITOS = r.GUID
        AND mc.DEBE > 0 AND mc.HABER = 0
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
        AND (mc.dts IS NULL OR mc.dts = 0)
  )
  -- No tiene MC con deuda cobrada tampoco (para no duplicar con paso 3)
  AND NOT EXISTS (
      SELECT 1 FROM MovimientoClientes mc2
      WHERE mc2.GUIDREMITOS = r.GUID
        AND mc2.DEBE > 0 AND mc2.HABER = 0
        AND mc2.GUIDFORMAPAGOS <> '' AND mc2.GUIDFORMAPAGOS IS NOT NULL
        AND (mc2.dts IS NULL OR mc2.dts = 0)
  )
  -- No existe ya en ControlComprobantes
  AND NOT EXISTS (
      SELECT 1 FROM ControlComprobantes cc WHERE cc.GUIDREMITO = r.GUID
  );

DECLARE @vtaContado INT = @@ROWCOUNT;
PRINT '1. Ventas contado migradas: ' + CAST(@vtaContado AS VARCHAR);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VENTAS CTA CTE PENDIENTES: Remitos con MC pendientes (sin GUIDFORMAPAGOS)
--    DEBE = TOTAL, HABER = 0, Conciliado = 0, TipoMov = 2
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ControlComprobantes
    (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO,
     GUIDCLIENTE, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA,
     ts, sts)
SELECT
    LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 16),
    r.FECHA, r.HORA, 'VTA CTA CTE',
    r.TOTAL, 0, 0, 2,
    r.GUIDCLIENTES, r.GUID, '', '', '',
    r.ts, r.sts
FROM Remitos r
WHERE (r.dts IS NULL OR r.dts = 0)
  AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)
  -- Tiene al menos un MC con deuda pendiente
  AND EXISTS (
      SELECT 1 FROM MovimientoClientes mc
      WHERE mc.GUIDREMITOS = r.GUID
        AND mc.DEBE > 0 AND mc.HABER = 0
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
        AND (mc.dts IS NULL OR mc.dts = 0)
  )
  AND NOT EXISTS (
      SELECT 1 FROM ControlComprobantes cc WHERE cc.GUIDREMITO = r.GUID
  );

DECLARE @vtaCtaCtePend INT = @@ROWCOUNT;
PRINT '2. Ventas cta cte pendientes migradas: ' + CAST(@vtaCtaCtePend AS VARCHAR);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. VENTAS CTA CTE COBRADAS: Remitos con MC cobrados (GUIDFORMAPAGOS seteado)
--    y sin MC pendientes
--    DEBE = TOTAL, HABER = 0, Conciliado = 1, TipoMov = 2
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ControlComprobantes
    (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO,
     GUIDCLIENTE, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA,
     ts, sts)
SELECT
    LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 16),
    r.FECHA, r.HORA, 'VTA CTA CTE',
    r.TOTAL, 0, 1, 2,
    r.GUIDCLIENTES, r.GUID, '', '', '',
    r.ts, r.sts
FROM Remitos r
WHERE (r.dts IS NULL OR r.dts = 0)
  AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)
  -- Tiene MC con DEBE>0, HABER=0 y GUIDFORMAPAGOS seteado (cobrado)
  AND EXISTS (
      SELECT 1 FROM MovimientoClientes mc
      WHERE mc.GUIDREMITOS = r.GUID
        AND mc.DEBE > 0 AND mc.HABER = 0
        AND mc.GUIDFORMAPAGOS <> '' AND mc.GUIDFORMAPAGOS IS NOT NULL
        AND (mc.dts IS NULL OR mc.dts = 0)
  )
  -- Y NO tiene MC pendientes sin cobrar
  AND NOT EXISTS (
      SELECT 1 FROM MovimientoClientes mc2
      WHERE mc2.GUIDREMITOS = r.GUID
        AND mc2.DEBE > 0 AND mc2.HABER = 0
        AND (mc2.GUIDFORMAPAGOS = '' OR mc2.GUIDFORMAPAGOS IS NULL)
        AND (mc2.dts IS NULL OR mc2.dts = 0)
  )
  AND NOT EXISTS (
      SELECT 1 FROM ControlComprobantes cc WHERE cc.GUIDREMITO = r.GUID
  );

DECLARE @vtaCtaCteCob INT = @@ROWCOUNT;
PRINT '3. Ventas cta cte cobradas migradas: ' + CAST(@vtaCtaCteCob AS VARCHAR);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DEVOLUCIONES: desde RemitosDevoluciones
--    DEBE = 0, HABER = TOTAL, TipoMov = 2
--    Conciliado = 1 si crédito CONSUMIDO, 0 si ACTIVO
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ControlComprobantes
    (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO,
     GUIDCLIENTE, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA,
     ts, sts)
SELECT
    LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 16),
    rd.FECHA, rd.HORA, 'CRED P/DEVOLUCION',
    0, rd.TOTAL,
    CASE WHEN cd.ESTADO = 'CONSUMIDO' THEN 1 ELSE 0 END,
    2,
    rd.GUIDCLIENTES, ISNULL(rd.GUIDREMITOS, ''), rd.GUID, '', '',
    rd.ts, rd.sts
FROM RemitosDevoluciones rd
LEFT JOIN CreditosDevoluciones cd
    ON cd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (cd.dts IS NULL OR cd.dts = 0)
WHERE (rd.dts IS NULL OR rd.dts = 0)
  AND NOT EXISTS (
      SELECT 1 FROM ControlComprobantes cc WHERE cc.GUIDREMITOSDEVOLUCIONES = rd.GUID
  );

DECLARE @devs INT = @@ROWCOUNT;
PRINT '4. Devoluciones migradas: ' + CAST(@devs AS VARCHAR);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CAMBIOS: desde RemitosCambios
--    DEBE = total venta nueva, HABER = total cambio, Conciliado = 1, TipoMov = 2
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ControlComprobantes
    (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO,
     GUIDCLIENTE, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA,
     ts, sts)
SELECT
    LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 16),
    rc.FECHA, rc.HORA, 'CBIO MERCADERIA',
    ISNULL(rv.TOTAL, 0),   -- DEBE = total de la venta nueva
    rc.TOTAL,               -- HABER = total de items devueltos
    1, 2,
    rc.GUIDCLIENTES, ISNULL(rc.GUIDREMITOS, ''), '', rc.GUID, '',
    rc.ts, rc.sts
FROM RemitosCambios rc
-- Buscar el remito de venta nueva vinculado al cambio
LEFT JOIN Remitos rv
    ON rv.GUIDREMITOSCAMBIOS = rc.GUID
    AND (rv.dts IS NULL OR rv.dts = 0)
WHERE (rc.dts IS NULL OR rc.dts = 0)
  AND NOT EXISTS (
      SELECT 1 FROM ControlComprobantes cc WHERE cc.GUIDREMITOSCAMBIOS = rc.GUID
  );

DECLARE @cambios INT = @@ROWCOUNT;
PRINT '5. Cambios migrados: ' + CAST(@cambios AS VARCHAR);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. COBRANZAS CTA CTE: desde MovimientoClientes (cobros con HABER > 0)
--    DEBE = 0, HABER = total cobrado, Conciliado = 1, TipoMov = 2
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ControlComprobantes
    (GUID, FECHA, HORA, CONCEPTO, DEBE, HABER, CONCILIADO, TIPOMOVIMIENTO,
     GUIDCLIENTE, GUIDREMITO, GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDCAJADIARIA,
     ts, sts)
SELECT
    LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 16),
    mc.FECHA, 0, 'COBRANZA CTA.CTE.',
    0, mc.HABER,
    1, 2,
    mc.GUIDCLIENTES, '', '', '', ISNULL(mc.GUIDCAJADIARIA, ''),
    mc.ts, mc.sts
FROM MovimientoClientes mc
WHERE mc.DESCRIPCION LIKE 'Cobro Cta. Cte.%'
  AND mc.HABER > 0
  AND mc.DEBE = 0
  AND (mc.dts IS NULL OR mc.dts = 0)
  -- Evitar duplicados por GUID del MC
  AND NOT EXISTS (
      SELECT 1 FROM ControlComprobantes cc WHERE cc.GUID = mc.GUID
  );

DECLARE @cobros INT = @@ROWCOUNT;
PRINT '6. Cobranzas cta cte migradas: ' + CAST(@cobros AS VARCHAR);
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Recalcular saldos con los datos migrados
-- ─────────────────────────────────────────────────────────────────────────────
EXEC SP_RecalcularSaldoCliente;
GO

PRINT '020 — Migración de datos a ControlComprobantes completada + saldos recalculados';
GO
