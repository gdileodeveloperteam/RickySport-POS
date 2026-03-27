SET NOCOUNT ON;
GO

-- =============================================================================
-- 014. Fix crédito remanente devolución
--
-- Bug: cuando se usaba parcialmente un crédito de devolución para pagar un
-- remito, se marcaban TODOS los HABER originales como cobrados (GUIDFORMAPAGOS)
-- pero no se creaba un nuevo HABER por la diferencia remanente. Esto hacía
-- desaparecer el crédito a favor del cliente en MovimientoClientes y en el saldo.
--
-- Este script:
--   1. Detecta créditos parcialmente consumidos cuyo HABER original ya fue
--      marcado como cobrado y no tienen HABER remanente creado.
--   2. Inserta un nuevo movimiento HABER por el monto disponible restante.
--   3. Recalcula saldos de los clientes afectados.
-- =============================================================================

DECLARE @ts FLOAT = DATEDIFF_BIG(SECOND, '1970-01-01', SYSUTCDATETIME());
DECLARE @fechaHoy DECIMAL(7) = DATEDIFF(DAY, '1800-12-28', GETDATE());

-- Insertar HABER remanente para créditos parcialmente consumidos
INSERT INTO MovimientoClientes (
    GUID, FECHA, CANTIDAD, ARTICULO, DESCRIPCION, TALLE,
    PRECIOUNITARIO, IVA, DEBE, HABER, SALDO, PAGO, SUCURSAL,
    GUIDCLIENTES, GUIDARTICULOS, GUIDREMITOS, GUIDFORMAPAGO,
    GUIDCAJADIARIA, GUIDBANCOS, GUIDMOVIMIENTOBANCOS,
    GUIDREMITOSDEVOLUCIONES, GUIDREMITOSCAMBIOS, ts, sts, dts
)
SELECT
    CONVERT(CHAR(16), CONVERT(VARBINARY(8), CRYPT_GEN_RANDOM(8)), 2),  -- GUID 16-char hex
    @fechaHoy,                          -- FECHA (Clarion)
    0,                                  -- CANTIDAD
    '',                                 -- ARTICULO
    'Crédito remanente devolución',     -- DESCRIPCION
    0,                                  -- TALLE
    0,                                  -- PRECIOUNITARIO
    0,                                  -- IVA
    0,                                  -- DEBE
    cd.MONTOORIGINAL - cd.MONTOUSADO,   -- HABER (monto remanente)
    0,                                  -- SALDO
    '',                                 -- PAGO
    0,                                  -- SUCURSAL
    cd.GUIDCLIENTES,                    -- GUIDCLIENTES
    '',                                 -- GUIDARTICULOS
    '',                                 -- GUIDREMITOS
    '',                                 -- GUIDFORMAPAGO (vacío = pendiente, visible en deuda activa)
    '',                                 -- GUIDCAJADIARIA
    '',                                 -- GUIDBANCOS
    '',                                 -- GUIDMOVIMIENTOBANCOS
    cd.GUIDREMITOSDEVOLUCIONES,          -- GUIDREMITOSDEVOLUCIONES
    '',                                 -- GUIDREMITOSCAMBIOS
    @ts,                                -- ts
    @ts,                                -- sts
    0                                   -- dts
FROM CreditosDevoluciones cd
WHERE cd.ESTADO = 'ACTIVO'
  AND (cd.MONTOORIGINAL - cd.MONTOUSADO) > 0.01
  AND (cd.dts IS NULL OR cd.dts = 0)
  -- Solo si TODOS los HABER originales de esta devolución ya están marcados como cobrados
  AND NOT EXISTS (
      SELECT 1
      FROM MovimientoClientes mc
      WHERE mc.GUIDREMITOSDEVOLUCIONES = cd.GUIDREMITOSDEVOLUCIONES
        AND mc.HABER > 0
        AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
        AND (mc.dts IS NULL OR mc.dts = 0)
  )
  -- Pero sí existen HABER marcados (confirma que se procesó el crédito)
  AND EXISTS (
      SELECT 1
      FROM MovimientoClientes mc2
      WHERE mc2.GUIDREMITOSDEVOLUCIONES = cd.GUIDREMITOSDEVOLUCIONES
        AND mc2.HABER > 0
        AND mc2.GUIDFORMAPAGOS <> ''
        AND mc2.GUIDFORMAPAGOS IS NOT NULL
        AND (mc2.dts IS NULL OR mc2.dts = 0)
  )
  -- No existe ya un HABER remanente creado previamente
  AND NOT EXISTS (
      SELECT 1
      FROM MovimientoClientes mc3
      WHERE mc3.GUIDREMITOSDEVOLUCIONES = cd.GUIDREMITOSDEVOLUCIONES
        AND mc3.HABER > 0
        AND mc3.DESCRIPCION = 'Crédito remanente devolución'
        AND (mc3.dts IS NULL OR mc3.dts = 0)
  );

DECLARE @affected INT = @@ROWCOUNT;

-- Recalcular saldos de todos los clientes
EXEC SP_RecalcularSaldoCliente;

PRINT '== Migración 014 completada: ' + CAST(@affected AS VARCHAR) + ' créditos remanentes restaurados ==';
GO
