SET NOCOUNT ON;
GO

-- =============================================================================
-- 013. SP_RecalcularSaldoCliente — Recalcula saldo de cta cte para uno o todos
--      los clientes. Incluye reconciliación de movimientos legacy.
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
    -- 1. Reconciliar movimientos legacy: HABER "Ingreso por venta"
    --    y TODOS los DEBE del mismo GUIDREMITOS como saldados
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

    -- =========================================================================
    -- 2. Reconciliar cobros legacy: HABER "Cobro Cta. Cte." sin GUIDFORMAPAGOS
    -- =========================================================================
    UPDATE MovimientoClientes
    SET GUIDFORMAPAGOS = 'RECONCILIADO'
    WHERE DESCRIPCION LIKE 'Cobro Cta. Cte.%'
      AND HABER > 0
      AND (GUIDFORMAPAGOS = '' OR GUIDFORMAPAGOS IS NULL)
      AND (dts IS NULL OR dts = 0)
      AND (@GuidCliente IS NULL OR GUIDCLIENTES = @GuidCliente);

    -- =========================================================================
    -- 3. Recalcular saldos: DEBE - pagos parciales - HABER (solo pendientes)
    -- =========================================================================
    UPDATE c
    SET c.SALDO = ISNULL(mov.SaldoReal, 0)
    FROM Clientes c
    CROSS APPLY (
        SELECT
            SUM(ISNULL(mc.DEBE, 0))
            - ISNULL(SUM(pp.TotalParcial), 0)
            - SUM(ISNULL(mc.HABER, 0)) AS SaldoReal
        FROM MovimientoClientes mc
        LEFT JOIN (
            SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
            FROM PagosParcialesMovimientos
            WHERE (dts IS NULL OR dts = 0)
            GROUP BY GUIDMOVIMIENTOCLIENTES
        ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
        WHERE mc.GUIDCLIENTES = c.GUID
          AND (mc.dts IS NULL OR mc.dts = 0)
          AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
    ) mov
    WHERE c.SALDO <> ISNULL(mov.SaldoReal, 0)
      AND (c.dts IS NULL OR c.dts = 0)
      AND (@GuidCliente IS NULL OR c.GUID = @GuidCliente);

    -- =========================================================================
    -- 4. Clientes sin movimientos pendientes deben quedar en 0
    -- =========================================================================
    UPDATE c
    SET c.SALDO = 0
    FROM Clientes c
    WHERE c.SALDO <> 0
      AND (c.dts IS NULL OR c.dts = 0)
      AND (@GuidCliente IS NULL OR c.GUID = @GuidCliente)
      AND NOT EXISTS (
          SELECT 1
          FROM MovimientoClientes mc
          WHERE mc.GUIDCLIENTES = c.GUID
            AND (mc.dts IS NULL OR mc.dts = 0)
            AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
      );
END;
GO

PRINT '== Migración 013 completada: SP_RecalcularSaldoCliente creada ==';
GO
