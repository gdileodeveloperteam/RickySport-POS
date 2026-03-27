SET NOCOUNT ON;
GO

-- =============================================================================
-- 019. SP_RecalcularSaldoCliente — Actualización para calcular saldo desde
--      ControlComprobantes en vez de MovimientoClientes.
--      Mantiene reconciliación legacy de MC para compatibilidad.
--
-- Uso:
--   EXEC SP_RecalcularSaldoCliente @GuidCliente = 'ABC123...'  -- un cliente
--   EXEC SP_RecalcularSaldoCliente                              -- todos
-- =============================================================================

IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'SP_RecalcularSaldoCliente') AND type = 'P')
    DROP PROCEDURE SP_RecalcularSaldoCliente;
GO

CREATE PROCEDURE SP_RecalcularSaldoCliente
    @GuidCliente CHAR(16) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- =========================================================================
    -- 1. Reconciliar movimientos legacy en MovimientoClientes
    --    (mantener para que MC no quede inconsistente)
    -- =========================================================================
    ;WITH RemitosConIngreso AS (
        SELECT DISTINCT RTRIM(mc.GUIDREMITOS) AS GuidRemito
        FROM MovimientoClientes mc
        WHERE mc.DESCRIPCION LIKE '%Ingreso por venta %'
          AND mc.HABER > 0
          AND mc.GUIDREMITOS <> ''
          AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
          AND (mc.dts IS NULL OR mc.dts = 0)
          AND (@GuidCliente IS NULL OR mc.GUIDCLIENTES = @GuidCliente)
    )
    UPDATE mc
    SET mc.GUIDFORMAPAGOS = 'RECONCILIADO'
    FROM MovimientoClientes mc
    INNER JOIN RemitosConIngreso r ON RTRIM(mc.GUIDREMITOS) = r.GuidRemito
    WHERE (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
      AND (mc.dts IS NULL OR mc.dts = 0)
      AND (@GuidCliente IS NULL OR mc.GUIDCLIENTES = @GuidCliente);

    UPDATE MovimientoClientes
    SET GUIDFORMAPAGOS = 'RECONCILIADO'
    WHERE DESCRIPCION LIKE 'Cobro Cta. Cte.%'
      AND HABER > 0
      AND (GUIDFORMAPAGOS = '' OR GUIDFORMAPAGOS IS NULL)
      AND (dts IS NULL OR dts = 0)
      AND (@GuidCliente IS NULL OR GUIDCLIENTES = @GuidCliente);

    -- =========================================================================
    -- 2. Recalcular saldos desde ControlComprobantes (CONCILIADO = 0)
    --    Saldo = SUM(DEBE) - SUM(HABER) de comprobantes NO conciliados
    -- =========================================================================
    UPDATE c
    SET c.SALDO = ISNULL(cc.SaldoReal, 0)
    FROM Clientes c
    CROSS APPLY (
        SELECT SUM(ISNULL(cc2.DEBE, 0)) - SUM(ISNULL(cc2.HABER, 0)) AS SaldoReal
        FROM ControlComprobantes cc2
        WHERE cc2.GUIDCLIENTE = c.GUID
          AND cc2.CONCILIADO = 0
          AND (cc2.dts IS NULL OR cc2.dts = 0)
    ) cc
    WHERE c.SALDO <> ISNULL(cc.SaldoReal, 0)
      AND (c.dts IS NULL OR c.dts = 0)
      AND (@GuidCliente IS NULL OR c.GUID = @GuidCliente);

    -- =========================================================================
    -- 3. Clientes sin comprobantes pendientes deben quedar en 0
    -- =========================================================================
    UPDATE c
    SET c.SALDO = 0
    FROM Clientes c
    WHERE c.SALDO <> 0
      AND (c.dts IS NULL OR c.dts = 0)
      AND (@GuidCliente IS NULL OR c.GUID = @GuidCliente)
      AND NOT EXISTS (
          SELECT 1
          FROM ControlComprobantes cc
          WHERE cc.GUIDCLIENTE = c.GUID
            AND cc.CONCILIADO = 0
            AND (cc.dts IS NULL OR cc.dts = 0)
      );
END;
GO

PRINT '019 — SP_RecalcularSaldoCliente actualizado: saldo desde ControlComprobantes';
GO
