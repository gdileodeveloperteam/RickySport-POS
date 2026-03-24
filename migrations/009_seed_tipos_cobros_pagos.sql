SET NOCOUNT ON;
GO

-- =============================================================================
-- 9. TiposCobrosPagos — Seed de tipos estándar de cobro/pago
--    TIPOMOVIMIENTO: A=Ingreso+Egreso, I=Solo Ingreso, E=Solo Egreso, X=Cta. Cte.
-- =============================================================================
MERGE INTO TiposCobrosPagos AS tgt
USING (VALUES
    ('TCP_EFECTIVO_01', 1,  'EFECTIVO',              'A'),
    ('TCP_TARJ_DEB_02', 2,  'TARJETA DE DEBITO',     'I'),
    ('TCP_TARJ_CRE_03', 3,  'TARJETA DE CREDITO',    'I'),
    ('TCP_TRANSF_B_04', 4,  'TRANSFERENCIA BANCARIA', 'A'),
    ('TCP_MERC_PAG_05', 5,  'MERCADO PAGO',           'A'),
    ('TCP_CHQ_PRO_06', 6,  'CHEQUE PROPIO',          'E'),
    ('TCP_CHQ_3RO_07', 7,  'CHEQUES 3ROS',           'I'),
    ('TCP_DEP_BAN_08', 8,  'DEPOSITO BANCARIO',      'I'),
    ('TCP_CREDITO_09',  9,  'CREDITO DEVOLUCION',     'I'),
    ('TCP_CTA_CTE_10', 10, 'CUENTA CORRIENTE',       'X')
) AS src (GUID, TIPO, DESCRIPCION, TIPOMOVIMIENTO)
ON tgt.TIPO = src.TIPO
WHEN MATCHED THEN
    UPDATE SET
        DESCRIPCION    = src.DESCRIPCION,
        TIPOMOVIMIENTO = src.TIPOMOVIMIENTO
WHEN NOT MATCHED THEN
    INSERT (GUID, TIPO, DESCRIPCION, TIPOMOVIMIENTO, ts, sts, dts)
    VALUES (src.GUID, src.TIPO, src.DESCRIPCION, src.TIPOMOVIMIENTO,
            DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
            DATEDIFF(SECOND, '1970-01-01', SYSDATETIME()),
            NULL);
GO
