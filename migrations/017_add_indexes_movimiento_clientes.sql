-- ============================================================================
-- 017 - Indexes para MovimientoClientes
-- Mejora de performance en queries de CTA CTE, reconciliacion y listados
-- Fecha: 2026-03-26
-- ============================================================================

SET NOCOUNT ON;
GO

-- 1. GuidClientes: usado en GetMovimientos, GetDeudaActiva, SP_RecalcularSaldoCliente
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MovimientoClientes_GuidClientes' AND object_id = OBJECT_ID('MovimientoClientes'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_MovimientoClientes_GuidClientes]
    ON [dbo].[MovimientoClientes] ([GUIDCLIENTES] ASC)
    INCLUDE ([FECHA], [DEBE], [HABER], [GUIDFORMAPAGOS], [GUIDREMITOS], [GUIDREMITOSDEVOLUCIONES], [dts]);
END;
GO

-- 2. GuidRemitos: usado en reconciliacion de cambios y NOT EXISTS en listado CTA CTE
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MovimientoClientes_GuidRemitos' AND object_id = OBJECT_ID('MovimientoClientes'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_MovimientoClientes_GuidRemitos]
    ON [dbo].[MovimientoClientes] ([GUIDREMITOS] ASC)
    WHERE ([GUIDREMITOS] <> '');
END;
GO

-- 3. GuidRemitosCambios: usado en reconciliacion de cambios
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MovimientoClientes_GuidRemitosCambios' AND object_id = OBJECT_ID('MovimientoClientes'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_MovimientoClientes_GuidRemitosCambios]
    ON [dbo].[MovimientoClientes] ([GUIDREMITOSCAMBIOS] ASC)
    WHERE ([GUIDREMITOSCAMBIOS] <> '');
END;
GO

PRINT '017 - Indexes MovimientoClientes creados OK';
GO
