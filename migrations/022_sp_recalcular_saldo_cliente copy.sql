ALTER PROCEDURE SP_RecalcularSaldoCliente
    @guid_cliente CHAR(16) = NULL -- Si se pasa NULL, actualiza todos
AS
BEGIN
    SET NOCOUNT ON;

    -- Usamos un CTE para pre-calcular los saldos y hacer el UPDATE más limpio
    WITH SaldosCalculados AS (
        SELECT 
            GUIDCLIENTE, 
            SUM(DEBE - HABER) AS NuevoSaldo
        FROM controlcomprobantes
        WHERE (@guid_cliente IS NULL OR GUIDCLIENTE = @guid_cliente) and TIPOMOVIMIENTO != 1
        GROUP BY GUIDCLIENTE
    )
    UPDATE c
    SET c.saldo = ISNULL(s.NuevoSaldo, 0) -- ISNULL asegura que si no hay movimientos, el saldo sea 0
    FROM clientes c
    INNER JOIN SaldosCalculados s ON c.guid = s.GUIDCLIENTE
    WHERE (@guid_cliente IS NULL OR c.guid = @guid_cliente);

    PRINT 'Saldos actualizados correctamente.';
END;