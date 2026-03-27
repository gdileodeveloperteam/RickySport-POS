-- =============================================================================
-- Debug Remitos, RemitosDevoluciones, RemitosCambios
-- GUIDCLIENTES = '68a15739888e8908' — Fecha: 26/03/2026
-- =============================================================================

DECLARE @guidCliente CHAR(16) = '68a15739888e8908';
DECLARE @fechaHoy DECIMAL(7) = DATEDIFF(DAY, '1800-12-28', CAST(GETDATE() AS DATE));

-- 1. Remitos (ventas)
SELECT r.GUID, r.FECHA, RTRIM(r.NOMBRE) AS NOMBRE, r.TOTAL, r.TOTAL_PAGOS,
       RTRIM(r.TIPOOPERACION) AS TIPOOPERACION,
       RTRIM(r.GUIDREMITOSCAMBIOS) AS GUIDREMITOSCAMBIOS,
       r.ts
FROM Remitos r
WHERE r.GUIDCLIENTES = @guidCliente
  AND r.FECHA = @fechaHoy
  AND (r.dts IS NULL OR r.dts = 0)
ORDER BY r.ts ASC;

-- 2. RemitosDevoluciones
SELECT rd.GUID, rd.FECHA, RTRIM(rd.NOMBRE) AS NOMBRE, rd.NETO, rd.TOTAL,
       RTRIM(rd.TIPOOPERACION) AS TIPOOPERACION,
       RTRIM(rd.GUIDREMITOS) AS GUIDREMITOS,
       rd.ts
FROM RemitosDevoluciones rd
WHERE rd.GUIDCLIENTES = @guidCliente
  AND rd.FECHA = @fechaHoy
  AND (rd.dts IS NULL OR rd.dts = 0)
ORDER BY rd.ts ASC;

-- 3. RemitosCambios
SELECT rc.GUID, rc.FECHA, RTRIM(rc.NOMBRE) AS NOMBRE, rc.NETO, rc.TOTAL,
       RTRIM(rc.TIPOOPERACION) AS TIPOOPERACION,
       RTRIM(rc.GUIDREMITOS) AS GUIDREMITOS,
       rc.ts
FROM RemitosCambios rc
WHERE rc.GUIDCLIENTES = @guidCliente
  AND rc.FECHA = @fechaHoy
  AND (rc.dts IS NULL OR rc.dts = 0)
ORDER BY rc.ts ASC;

-- 4. MovimientoClientes (todos los MC del día)
SELECT mc.GUID, mc.FECHA, RTRIM(mc.DESCRIPCION) AS DESCRIPCION,
       mc.DEBE, mc.HABER,
       RTRIM(mc.GUIDREMITOS) AS GUIDREMITOS,
       RTRIM(mc.GUIDREMITOSDEVOLUCIONES) AS GUIDREMITOSDEVOLUCIONES,
       RTRIM(mc.GUIDREMITOSCAMBIOS) AS GUIDREMITOSCAMBIOS,
       RTRIM(mc.GUIDFORMAPAGOS) AS GUIDFORMAPAGOS,
       mc.ts
FROM MovimientoClientes mc
WHERE mc.GUIDCLIENTES = @guidCliente
  AND mc.FECHA = @fechaHoy
  AND (mc.dts IS NULL OR mc.dts = 0)
ORDER BY mc.ts ASC;

-- 5. FormaPagos de los remitos del día
SELECT fp.GUID, RTRIM(fp.TIPOCOMPROBANTE) AS TIPOCOMPROBANTE,
       RTRIM(fp.DESCRIPCION) AS DESCRIPCION, fp.IMPORTE,
       RTRIM(fp.GUIDREMITOS) AS GUIDREMITOS,
       fp.ts
FROM FormaPagos fp
WHERE fp.GUIDREMITOS IN (
    SELECT r.GUID FROM Remitos r
    WHERE r.GUIDCLIENTES = @guidCliente AND r.FECHA = @fechaHoy AND (r.dts IS NULL OR r.dts = 0)
  )
  AND (fp.dts IS NULL OR fp.dts = 0)
ORDER BY fp.ts ASC;

-- 6. CreditosDevolucionesUsos del día
SELECT cdu.GUID, cdu.MONTOUSADO, cdu.FECHA,
       RTRIM(cdu.GUIDCREDITOSDEVOLUCIONES) AS GUIDCREDITOSDEVOLUCIONES,
       RTRIM(cdu.GUIDREMITOS) AS GUIDREMITOS,
       RTRIM(cdu.GUIDFORMAPAGOS) AS GUIDFORMAPAGOS
FROM CreditosDevolucionesUsos cdu
WHERE cdu.GUIDREMITOS IN (
    SELECT r.GUID FROM Remitos r
    WHERE r.GUIDCLIENTES = @guidCliente AND r.FECHA = @fechaHoy AND (r.dts IS NULL OR r.dts = 0)
  )
  AND (cdu.dts IS NULL OR cdu.dts = 0);
