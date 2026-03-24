SET NOCOUNT ON;
GO

-- =============================================================================
-- 011. Renombrar CREDITO -> CREDITO DEVOLUCION en TiposCobrosPagos
-- =============================================================================
UPDATE TiposCobrosPagos
SET DESCRIPCION = 'CREDITO DEVOLUCION'
WHERE TIPO = 9 AND DESCRIPCION = 'DEBITO BANCARIO';
GO

PRINT '== Migración 011: CREDITO renombrado a CREDITO DEVOLUCION ==';
GO
