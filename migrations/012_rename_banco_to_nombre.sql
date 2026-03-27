SET NOCOUNT ON;
GO

-- =============================================================================
-- 012. Rename BANCO column to NOMBRE in Bancos table
-- =============================================================================

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Bancos') AND name = 'BANCO'
)
BEGIN
    EXEC sp_rename 'dbo.Bancos.BANCO', 'NOMBRE', 'COLUMN';
    PRINT 'Column BANCO renamed to NOMBRE in Bancos table.';
END
ELSE
BEGIN
    PRINT 'Column BANCO does not exist in Bancos table (already renamed or missing).';
END;
GO
