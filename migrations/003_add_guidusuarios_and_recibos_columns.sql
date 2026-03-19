SET NOCOUNT ON;
GO

-- =============================================================================
-- 003. CajaDiaria, CajaGastos — Agregar GUIDUSUARIOS
--      Recibos — Agregar GUIDCAJAGASTOS, GUIDCAJADIARIA, GUIDUSUARIOS, GUIDEMPLEADOS
-- =============================================================================

-- ── CajaDiaria.GUIDUSUARIOS ─────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[CajaDiaria]')
    AND name = 'GUIDUSUARIOS'
)
BEGIN
  ALTER TABLE [dbo].[CajaDiaria]
    ADD [GUIDUSUARIOS] char(16) NOT NULL DEFAULT '';
END;
GO

-- ── CajaGastos.GUIDUSUARIOS ─────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[CajaGastos]')
    AND name = 'GUIDUSUARIOS'
)
BEGIN
  ALTER TABLE [dbo].[CajaGastos]
    ADD [GUIDUSUARIOS] char(16) NOT NULL DEFAULT '';
END;
GO

-- ── Recibos.GUIDCAJAGASTOS ──────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[Recibos]')
    AND name = 'GUIDCAJAGASTOS'
)
BEGIN
  ALTER TABLE [dbo].[Recibos]
    ADD [GUIDCAJAGASTOS] char(16) NULL;
END;
GO

-- ── Recibos.GUIDCAJADIARIA ──────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[Recibos]')
    AND name = 'GUIDCAJADIARIA'
)
BEGIN
  ALTER TABLE [dbo].[Recibos]
    ADD [GUIDCAJADIARIA] char(16) NULL;
END;
GO

-- ── Recibos.GUIDUSUARIOS ────────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[Recibos]')
    AND name = 'GUIDUSUARIOS'
)
BEGIN
  ALTER TABLE [dbo].[Recibos]
    ADD [GUIDUSUARIOS] char(16) NULL;
END;
GO

-- ── Recibos.GUIDEMPLEADOS ───────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[Recibos]')
    AND name = 'GUIDEMPLEADOS'
)
BEGIN
  ALTER TABLE [dbo].[Recibos]
    ADD [GUIDEMPLEADOS] char(16) NULL;
END;
GO
