SET NOCOUNT ON;
GO

-- =============================================================================
-- 015. Fix MovimientoClientes faltantes para ventas pagadas con crédito devolución
-- Remitos que usaron CreditosDevolucionesUsos pero no tienen MC con DEBE
-- =============================================================================

-- Insertar MC con DEBE = monto usado del crédito, HABER = 0
INSERT INTO MovimientoClientes (
  GUID, FECHA, CANTIDAD, ARTICULO, DESCRIPCION, TALLE,
  PRECIOUNITARIO, IVA, DEBE, HABER, SALDO, PAGO, SUCURSAL,
  GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
  GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
  GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, GUIDFORMAPAGOS, ts, sts, dts
)
SELECT
  LEFT(NEWID(), 16)         AS GUID,
  r.FECHA,
  0                         AS CANTIDAD,
  ''                        AS ARTICULO,
  'Venta - ' + RTRIM(ISNULL(r.NOMBRE, 'S/N')) + ' ($' + CAST(CAST(cdu.MONTOUSADO AS INT) AS VARCHAR) + ' crédito)' AS DESCRIPCION,
  0                         AS TALLE,
  0                         AS PRECIOUNITARIO,
  0                         AS IVA,
  cdu.MONTOUSADO            AS DEBE,
  0                         AS HABER,
  0                         AS SALDO,
  ''                        AS PAGO,
  0                         AS SUCURSAL,
  r.GUIDCLIENTES,
  ''                        AS GUIDARTICULOS,
  r.GUID                    AS GUIDREMITOS,
  cdu.GUIDFORMAPAGOS        AS GUIDFORMAPAGO,
  ''                        AS GUIDCAJADIARIA,
  ''                        AS GUIDBANCOS,
  ''                        AS GUIDMOVIMIENTOBANCOS,
  ''                        AS GUIDREMITOSDEVOLUCIONES,
  ''                        AS GUIDREMITOSCAMBIOS,
  cdu.GUIDFORMAPAGOS        AS GUIDFORMAPAGOS,
  r.ts, r.ts, 0
FROM CreditosDevolucionesUsos cdu
INNER JOIN Remitos r ON r.GUID = cdu.GUIDREMITOS
WHERE (cdu.dts IS NULL OR cdu.dts = 0)
  AND (r.dts IS NULL OR r.dts = 0)
  AND (r.GUIDREMITOSCAMBIOS = '' OR r.GUIDREMITOSCAMBIOS IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM MovimientoClientes mc
    WHERE mc.GUIDREMITOS = r.GUID
      AND mc.DEBE > 0
      AND (mc.dts IS NULL OR mc.dts = 0)
  );

PRINT '015 - MC insertados para ventas con crédito devolución: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO
