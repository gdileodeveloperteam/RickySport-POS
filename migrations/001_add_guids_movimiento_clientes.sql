SET NOCOUNT ON;
GO

-- =============================================================================
-- 001. MovimientoClientes — Agregar GUIDREMITOSDEVOLUCIONES y GUIDREMITOSCAMBIOS
-- =============================================================================
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoClientes]')
    AND name = 'GUIDREMITOSDEVOLUCIONES'
)
BEGIN
  ALTER TABLE [dbo].[MovimientoClientes]
    ADD [GUIDREMITOSDEVOLUCIONES] char(16) NOT NULL DEFAULT '';
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoClientes]')
    AND name = 'GUIDREMITOSCAMBIOS'
)
BEGIN
  ALTER TABLE [dbo].[MovimientoClientes]
    ADD [GUIDREMITOSCAMBIOS] char(16) NOT NULL DEFAULT '';
END;
GO
