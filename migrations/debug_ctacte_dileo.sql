-- =============================================================================
-- Debug Cta. Cte. para GUIDCLIENTES = '68a15739888e8908'
-- =============================================================================

DECLARE @guidCliente CHAR(16) = '68a15739888e8908';

;WITH MovimientosCompletos AS (
  -- 1. MovimientoClientes (libro de cta cte)
  SELECT mc.GUID, mc.FECHA, mc.DESCRIPCION,
         mc.DEBE,
         mc.HABER,
         mc.GUIDREMITOS, mc.GUIDREMITOSDEVOLUCIONES, mc.GUIDFORMAPAGOS, mc.ts,
         ISNULL(pp.TotalParcial, 0) AS TOTALPARCIAL
  FROM MovimientoClientes mc
  LEFT JOIN (
    SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
    FROM PagosParcialesMovimientos WHERE (dts IS NULL OR dts = 0)
    GROUP BY GUIDMOVIMIENTOCLIENTES
  ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
  WHERE mc.GUIDCLIENTES = @guidCliente AND (mc.dts IS NULL OR mc.dts = 0)

  UNION ALL

  -- 2. Ventas de contado sin MC: DEBE y HABER iguales (saldo 0)
  SELECT r.GUID, r.FECHA,
         CAST('Venta - ' + RTRIM(ISNULL(r.NOMBRE, ''))
           + ISNULL(' (CTDO. ' + fpAgg.Tipos + ')', '') AS VARCHAR(2000)),
         r.TOTAL AS DEBE, r.TOTAL AS HABER,
         r.GUID AS GUIDREMITOS, '' AS GUIDREMITOSDEVOLUCIONES,
         'PAGADO' AS GUIDFORMAPAGOS, r.ts, 0 AS TOTALPARCIAL
  FROM Remitos r
  LEFT JOIN (
    SELECT fp.GUIDREMITOS,
           STRING_AGG(RTRIM(LTRIM(fp.DESCRIPCION)), ' + ') AS Tipos
    FROM FormaPagos fp
    WHERE (fp.dts IS NULL OR fp.dts = 0)
      AND fp.DESCRIPCION IS NOT NULL AND RTRIM(fp.DESCRIPCION) <> ''
    GROUP BY fp.GUIDREMITOS
  ) fpAgg ON fpAgg.GUIDREMITOS = r.GUID
  WHERE r.GUIDCLIENTES = @guidCliente AND (r.dts IS NULL OR r.dts = 0)
    AND NOT EXISTS (
      SELECT 1 FROM MovimientoClientes mc2
      WHERE mc2.GUIDREMITOS = r.GUID AND (mc2.dts IS NULL OR mc2.dts = 0)
    )
    AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)

  UNION ALL

  -- 3. Devoluciones sin MC: siempre HABER (crédito a favor del cliente)
  SELECT rd.GUID, rd.FECHA, CAST('Devolucion - ' + RTRIM(ISNULL(rd.NOMBRE, '')) AS VARCHAR(2000)),
         0 AS DEBE,
         rd.TOTAL AS HABER,
         '' AS GUIDREMITOS, rd.GUID AS GUIDREMITOSDEVOLUCIONES,
         CASE WHEN cd.ESTADO = 'CONSUMIDO' THEN 'CONSUMIDO' ELSE '' END AS GUIDFORMAPAGOS,
         rd.ts, 0 AS TOTALPARCIAL
  FROM RemitosDevoluciones rd
  LEFT JOIN CreditosDevoluciones cd ON cd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (cd.dts IS NULL OR cd.dts = 0)
  WHERE rd.GUIDCLIENTES = @guidCliente AND (rd.dts IS NULL OR rd.dts = 0)
    AND NOT EXISTS (
      SELECT 1 FROM MovimientoClientes mc3
      WHERE mc3.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (mc3.dts IS NULL OR mc3.dts = 0)
    )
)
SELECT GUID, FECHA, DESCRIPCION, DEBE, HABER, GUIDREMITOS, GUIDREMITOSDEVOLUCIONES, GUIDFORMAPAGOS, TOTALPARCIAL
FROM MovimientosCompletos
ORDER BY FECHA ASC, ts ASC;

-- Saldo anterior (sin filtro de fecha = saldo total)
SELECT ISNULL(SUM(sub.DEBE), 0) - ISNULL(SUM(sub.HABER), 0) AS SaldoTotal
FROM (
  SELECT mc.DEBE, mc.HABER
  FROM MovimientoClientes mc
  WHERE mc.GUIDCLIENTES = @guidCliente AND (mc.dts IS NULL OR mc.dts = 0)
  UNION ALL
  SELECT r.TOTAL AS DEBE, r.TOTAL AS HABER
  FROM Remitos r
  WHERE r.GUIDCLIENTES = @guidCliente AND (r.dts IS NULL OR r.dts = 0)
    AND NOT EXISTS (SELECT 1 FROM MovimientoClientes mc2 WHERE mc2.GUIDREMITOS = r.GUID AND (mc2.dts IS NULL OR mc2.dts = 0))
    AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)
  UNION ALL
  SELECT 0 AS DEBE, rd.TOTAL AS HABER
  FROM RemitosDevoluciones rd
  LEFT JOIN CreditosDevoluciones cd ON cd.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (cd.dts IS NULL OR cd.dts = 0)
  WHERE rd.GUIDCLIENTES = @guidCliente AND (rd.dts IS NULL OR rd.dts = 0)
    AND NOT EXISTS (SELECT 1 FROM MovimientoClientes mc3 WHERE mc3.GUIDREMITOSDEVOLUCIONES = rd.GUID AND (mc3.dts IS NULL OR mc3.dts = 0))
) sub;
