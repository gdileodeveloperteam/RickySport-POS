SET NOCOUNT ON;
GO

-- =============================================================================
-- 6. FormaPagos — Agregar GUIDBANCOSCUENTAS, GUIDREMITOSCAMBIOS,
--                 GUIDREMITOSDEVOLUCIONES, GUIDTCPAGOS, GUIDTCPAGOSPLANES
-- =============================================================================

-- ── FormaPagos.GUIDBANCOSCUENTAS ───────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[FormaPagos]')
    AND name = 'GUIDBANCOSCUENTAS'
)
BEGIN
  ALTER TABLE [dbo].[FormaPagos]
    ADD [GUIDBANCOSCUENTAS] char(16) NOT NULL DEFAULT '';
END;
GO

-- ── FormaPagos.GUIDREMITOSCAMBIOS ──────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[FormaPagos]')
    AND name = 'GUIDREMITOSCAMBIOS'
)
BEGIN
  ALTER TABLE [dbo].[FormaPagos]
    ADD [GUIDREMITOSCAMBIOS] char(16) NOT NULL DEFAULT '';
END;
GO

-- ── FormaPagos.GUIDREMITOSDEVOLUCIONES ─────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[FormaPagos]')
    AND name = 'GUIDREMITOSDEVOLUCIONES'
)
BEGIN
  ALTER TABLE [dbo].[FormaPagos]
    ADD [GUIDREMITOSDEVOLUCIONES] char(16) NOT NULL DEFAULT '';
END;
GO

-- ── FormaPagos.GUIDTCPAGOS ─────────────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[FormaPagos]')
    AND name = 'GUIDTCPAGOS'
)
BEGIN
  ALTER TABLE [dbo].[FormaPagos]
    ADD [GUIDTCPAGOS] char(16) NOT NULL DEFAULT '';
END;
GO

-- ── FormaPagos.GUIDTCPAGOSPLANES ───────────────────────────────────────────────
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'[dbo].[FormaPagos]')
    AND name = 'GUIDTCPAGOSPLANES'
)
BEGIN
  ALTER TABLE [dbo].[FormaPagos]
    ADD [GUIDTCPAGOSPLANES] char(16) NOT NULL DEFAULT '';
END;
GO
