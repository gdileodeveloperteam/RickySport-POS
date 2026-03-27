ALTER TABLE [dbo].[Bancos] ADD [CUENTANUMERO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Bancos] ADD [SALDO] decimal(13,2)  NULL
GO

ALTER TABLE [dbo].[Bancos] ADD [TIPOCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Bancos] ALTER COLUMN [ID] int NULL
GO


ALTER TABLE [dbo].[BancosCuentas] ALTER COLUMN [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

EXEC sp_rename 'BancosCuentas.GUIDBANCO', 'GUIDBANCOS', 'COLUMN'
GO 


ALTER TABLE [dbo].[CajaDiaria] ADD [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[CajaDiaria] ADD [GUIDUSUARIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[CajaGastos] ADD [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[CajaGastos] ADD [GUIDCAJADIARIA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[CajaGastos] ADD [GUIDUSUARIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL
GO

ALTER TABLE [dbo].[Sucursales] ADD [CELULAR] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Sucursales] ADD [EMAIL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO


CREATE TABLE [dbo].[CondicionArticulos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ESTADO] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  CONSTRAINT [PK_CondicionArticulos] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ_CondicionArticulos_Estado] UNIQUE NONCLUSTERED ([ESTADO] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ_CondicionArticulos_Guid] UNIQUE NONCLUSTERED ([GUID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[CondicionArticulos] SET (LOCK_ESCALATION = TABLE)
GO



CREATE TABLE [dbo].[CreditosDevoluciones] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHA] date  NOT NULL,
  [MONTOORIGINAL] decimal(13,3)  NOT NULL,
  [MONTOUSADO] decimal(13,3) DEFAULT 0 NOT NULL,
  [ESTADO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'ACTIVO' NOT NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  CONSTRAINT [PK_CreditosDevoluciones] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ_CreditosDevoluciones_Guid] UNIQUE NONCLUSTERED ([GUID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[CreditosDevoluciones] SET (LOCK_ESCALATION = TABLE)
GO

CREATE TABLE [dbo].[CreditosDevolucionesUsos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCREDITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFORMAPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [MONTOUSADO] decimal(13,3)  NOT NULL,
  [FECHA] date  NOT NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  CONSTRAINT [PK_CreditosDevolucionesUsos] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ_CreditosDevolucionesUsos_Guid] UNIQUE NONCLUSTERED ([GUID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[CreditosDevolucionesUsos] SET (LOCK_ESCALATION = TABLE)
GO

ALTER TABLE [dbo].[Facturas] ALTER COLUMN [TIPO_IVA] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [CODIGO_REMITO] smallint  NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [DATEADDED] int  NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [TIMEADDED] int  NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [USERADDED] int  NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [DATECHANGED] int  NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [TIMECHANGED] int  NULL
GO

ALTER TABLE [dbo].[Facturas] ADD [USERCHANGED] int  NULL
GO


ALTER TABLE [dbo].[Facturas] ADD [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

EXEC sp_rename 'Facturas.DECAE', 'CAE', 'COLUMN'
GO

EXEC sp_rename 'Facturas.FECAE', 'FECHAVENCIMIENTOCAE', 'COLUMN'
GO

ALTER TABLE [dbo].[Facturas] ADD CONSTRAINT [UQ__Facturas__GUID] UNIQUE NONCLUSTERED ([GUID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


ALTER TABLE [dbo].[FormaPagos] ADD [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[FormaPagos] ADD [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[FormaPagos] ADD [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[FormaPagos] ADD [GUIDTIPOSCOMPROBANTESPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[FormaPagos] ADD [GUIDTCPAGOSPLANES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[FormaPagos] ADD [NOMBRETITULARTARJETA] varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

EXEC sp_rename 'LibroCheques.GUIDBANCO', 'GUIDBANCOS', 'COLUMN'
GO

CREATE TABLE [dbo].[MovimientoAdelantos] (
  [Guid] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GuidEmpleados] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GuidSucursales] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GuidCajaGastos] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [Fecha] date  NOT NULL,
  [Debe] decimal(13,3) DEFAULT 0 NULL,
  [Haber] decimal(13,3) DEFAULT 0 NULL,
  [Saldo] decimal(13,3) DEFAULT 0 NULL,
  [Observaciones] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MesImputacion] varchar(7) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  CONSTRAINT [PK_MovimientoAdelantos] PRIMARY KEY CLUSTERED ([Guid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[MovimientoAdelantos] SET (LOCK_ESCALATION = TABLE)
GO

ALTER TABLE [dbo].[MovimientoClientes] ADD [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[MovimientoClientes] ADD [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[MovimientoClientes] ADD [GUIDFORMAPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NULL
GO

ALTER TABLE [dbo].[MovimientoRemitos] ADD [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[MovimientoRemitos] ADD [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[MovimientosCuentaBancos] ADD [IMPORTE] decimal(13,2)  NULL
GO

ALTER TABLE [dbo].[MovimientoStock] ALTER COLUMN [GUIDMOVIMIENTOARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

CREATE TABLE [dbo].[PagosParcialesMovimientos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
  [GUIDMOVIMIENTOCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
  [GUIDFORMAPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
  [IMPORTEPAGADO] decimal(13,3) DEFAULT 0 NOT NULL,
  [FECHA] date  NULL,
  [ts] float(53) DEFAULT 0 NOT NULL,
  [sts] float(53) DEFAULT 0 NOT NULL,
  [dts] float(53) DEFAULT 0 NULL,
  CONSTRAINT [PK_PagosParcialesMovimientos] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[PagosParcialesMovimientos] SET (LOCK_ESCALATION = TABLE)
GO


ALTER TABLE [dbo].[Recibos] ADD [GUIDCAJAGASTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Recibos] ADD [GUIDCAJADIARIA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Recibos] ADD [GUIDUSUARIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Recibos] ADD [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

ALTER TABLE [dbo].[Remitos] ADD [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
GO

CREATE TABLE [dbo].[RemitosCambios] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHA] int  NULL,
  [HORA] int  NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CATFISCAL] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DOCUMENTO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIT] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PRECIODOLAR] decimal(7,2)  NULL,
  [NETO] decimal(13,2)  NULL,
  [IVA] decimal(13,2)  NULL,
  [BONIFICACION] decimal(13,2)  NULL,
  [TOTAL] decimal(13,3)  NULL,
  [TIPO_COMPROBANTE] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PUNTO_VENTA] smallint  NULL,
  [NUMERO_FACTURA] int  NULL,
  [TOTAL_PAGOS] decimal(13,2)  NULL,
  [TIPOOPERACION] varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDVENDEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDFACTURAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [PENDIENTEFACTURAR] int  NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  CONSTRAINT [PK__RemitosCambios__15B69B8EEBA627FA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[RemitosCambios] SET (LOCK_ESCALATION = TABLE)
GO

CREATE TABLE [dbo].[RemitosDevoluciones] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHA] int  NULL,
  [HORA] int  NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CATFISCAL] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DOCUMENTO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIT] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PRECIODOLAR] decimal(7,2)  NULL,
  [NETO] decimal(13,2)  NULL,
  [IVA] decimal(13,2)  NULL,
  [BONIFICACION] decimal(13,2)  NULL,
  [TOTAL] decimal(13,3)  NULL,
  [TIPO_COMPROBANTE] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PUNTO_VENTA] smallint  NULL,
  [NUMERO_FACTURA] int  NULL,
  [TOTAL_PAGOS] decimal(13,2)  NULL,
  [TIPOOPERACION] varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDVENDEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDFACTURAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [PENDIENTEFACTURAR] int  NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  CONSTRAINT [PK__RemitosDevoluciones__15B69B8EEBA627FA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[RemitosDevoluciones] SET (LOCK_ESCALATION = TABLE)
GO



CREATE TABLE [dbo].[TiposCobrosPagos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPO] tinyint  NOT NULL,
  [DESCRIPCION] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPOMOVIMIENTO] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  CONSTRAINT [PK_TiposCobrosPagos] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ_TiposCobrosPagos_Guid] UNIQUE NONCLUSTERED ([GUID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [CK_TiposCobrosPagos_TipoMov] CHECK ([TIPOMOVIMIENTO]='X' OR [TIPOMOVIMIENTO]='E' OR [TIPOMOVIMIENTO]='I' OR [TIPOMOVIMIENTO]='A')
)
GO

ALTER TABLE [dbo].[TiposCobrosPagos] SET (LOCK_ESCALATION = TABLE)
GO

CREATE TABLE [dbo].[TiposComprobantesPagos] (
  [CODIGO_TCP] int  NULL,
  [ABREVIADO] char(2) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO_COMPROBANTE] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [INTERES] decimal(7,2)  NULL,
  [COEFICIENTE] decimal(11,7)  NULL,
  [TELEFONO] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [OBSERVACIONES] varchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NUMERO_COMERCIO] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DATOSADICIONAL] tinyint  NULL,
  [TIPO] tinyint  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFORMAPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
  [GUIDTIPOSCOBROSPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  CONSTRAINT [PK__TCPagos___15B69B8EFD170DD8] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ__TCPagos___0FA19C51D6084539] UNIQUE NONCLUSTERED ([CODIGO_TCP] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY],
  CONSTRAINT [UQ__TCPagos___9750319162DCA33C] UNIQUE NONCLUSTERED ([TIPO_COMPROBANTE] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
)
GO

ALTER TABLE [dbo].[TiposComprobantesPagos] SET (LOCK_ESCALATION = TABLE)
GO


EXEC sp_rename 'TCPagosPlanes.GUIDTCPAGOS', 'GUIDTIPOSCOMPROBANTESPAGOS', 'COLUMN'
GO

DROP TABLE [dbo].[TCPagoS]
GO

EXEC sp_rename 'TransferenciasBancos.GUIDBANCO', 'GUIDBANCOS', 'COLUMN'
GO


EXEC sp_rename 'Usuarios.GUIDBANCOS', 'GUIDBANCOSCUENTAS', 'COLUMN'
GO

ALTER TABLE [dbo].[CreditosDevoluciones] ADD CONSTRAINT [FK_CreditosDevoluciones_GuidClientes] FOREIGN KEY ([GUIDCLIENTES]) REFERENCES [dbo].[Clientes] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[CreditosDevoluciones] ADD CONSTRAINT [FK_CreditosDevoluciones_GuidRemitosDevoluciones] FOREIGN KEY ([GUIDREMITOSDEVOLUCIONES]) REFERENCES [dbo].[RemitosDevoluciones] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[CreditosDevoluciones] ADD CONSTRAINT [FK_CreditosDevoluciones_GuidSucursales] FOREIGN KEY ([GUIDSUCURSALES]) REFERENCES [dbo].[Sucursales] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[CreditosDevolucionesUsos] ADD CONSTRAINT [FK_CreditosDevolucionesUsos_GuidCreditos] FOREIGN KEY ([GUIDCREDITOSDEVOLUCIONES]) REFERENCES [dbo].[CreditosDevoluciones] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[CreditosDevolucionesUsos] ADD CONSTRAINT [FK_CreditosDevolucionesUsos_GuidRemitos] FOREIGN KEY ([GUIDREMITOS]) REFERENCES [dbo].[Remitos] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[CreditosDevolucionesUsos] ADD CONSTRAINT [FK_CreditosDevolucionesUsos_GuidFormaPagos] FOREIGN KEY ([GUIDFORMAPAGOS]) REFERENCES [dbo].[FormaPagos] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[MovimientoAdelantos] ADD CONSTRAINT [FK_MovimientoAdelantos_GuidSucursales] FOREIGN KEY ([GuidSucursales]) REFERENCES [dbo].[Sucursales] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO

ALTER TABLE [dbo].[PagosParcialesMovimientos] ADD CONSTRAINT [FK_PagosParcialesMovimientos_MovClientes] FOREIGN KEY ([GUIDMOVIMIENTOCLIENTES]) REFERENCES [dbo].[MovimientoClientes] ([GUID]) ON DELETE NO ACTION ON UPDATE NO ACTION
GO


CREATE NONCLUSTERED INDEX [IX_CreditosDevoluciones_GuidClientes_Estado]
ON [dbo].[CreditosDevoluciones] (
  [GUIDCLIENTES] ASC,
  [ESTADO] ASC
)
WHERE ([dts] IS NULL)
GO

CREATE NONCLUSTERED INDEX [IX_CreditosDevoluciones_GuidRemitosDevoluciones]
ON [dbo].[CreditosDevoluciones] (
  [GUIDREMITOSDEVOLUCIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_CreditosDevolucionesUsos_GuidCreditos]
ON [dbo].[CreditosDevolucionesUsos] (
  [GUIDCREDITOSDEVOLUCIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_CreditosDevolucionesUsos_GuidRemitos]
ON [dbo].[CreditosDevolucionesUsos] (
  [GUIDREMITOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_MovimientoAdelantos_GuidEmpleados_Fecha]
ON [dbo].[MovimientoAdelantos] (
  [GuidEmpleados] ASC,
  [Fecha] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_MovimientoAdelantos_GuidSucursales_Fecha]
ON [dbo].[MovimientoAdelantos] (
  [GuidSucursales] ASC,
  [Fecha] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_MovimientoAdelantos_MesImputacion]
ON [dbo].[MovimientoAdelantos] (
  [MesImputacion] ASC
)
GO

CREATE NONCLUSTERED INDEX [IX_MovimientoClientes_GuidFormaPagos]
ON [dbo].[MovimientoClientes] (
  [GUIDFORMAPAGOS] ASC
)
WHERE ([GUIDFORMAPAGOS]='')
GO

CREATE NONCLUSTERED INDEX [IX_PagosParcialesMovimientos_GuidMovCli]
ON [dbo].[PagosParcialesMovimientos] (
  [GUIDMOVIMIENTOCLIENTES] ASC
)
INCLUDE ([IMPORTEPAGADO], [dts])
GO

DROP INDEX [MCB_GUIDBANCOKEY] ON [dbo].[MovimientosCuentaBancos]
GO

CREATE NONCLUSTERED INDEX [MCB_GUIDBANCOKEY]
ON [dbo].[MovimientosCuentaBancos] (
  [GUIDBANCOS] ASC
)
GO

DROP INDEX [TRB_GUIDBANCOKEY] ON [dbo].[TransferenciasBancos]
GO

CREATE NONCLUSTERED INDEX [TRB_GUIDBANCOKEY]
ON [dbo].[TransferenciasBancos] (
  [GUIDBANCOS] ASC
)
GO



CREATE UNIQUE NONCLUSTERED INDEX [UQ_Bancos_CuentaNumero]
ON [dbo].[Bancos] (
  [CUENTANUMERO] ASC
)
WHERE ([CUENTANUMERO] IS NOT NULL)
GO

DROP TABLE IF EXISTS [dbo].[TiposComprobantesDePagos]
GO


SET NOCOUNT ON;
GO

-- =============================================================================
-- 013. SP_RecalcularSaldoCliente — Recalcula saldo de cta cte para uno o todos
--      los clientes. Incluye reconciliación de movimientos legacy.
--
-- Uso:
--   EXEC SP_RecalcularSaldoCliente @GuidCliente = 'ABC123...'  -- un cliente
--   EXEC SP_RecalcularSaldoCliente                              -- todos
-- =============================================================================

IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'SP_RecalcularSaldoCliente') AND type = 'P')
    DROP PROCEDURE SP_RecalcularSaldoCliente;
GO

CREATE PROCEDURE SP_RecalcularSaldoCliente
    @GuidCliente CHAR(16) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- =========================================================================
    -- 1. Reconciliar movimientos legacy: HABER "Ingreso por venta"
    --    y TODOS los DEBE del mismo GUIDREMITOS como saldados
    -- =========================================================================
    ;WITH RemitosConIngreso AS (
        SELECT DISTINCT RTRIM(mc.GUIDREMITOS) AS GuidRemito
        FROM MovimientoClientes mc
        WHERE mc.DESCRIPCION LIKE '%Ingreso por venta %'
          AND mc.HABER > 0
          AND mc.GUIDREMITOS <> ''
          AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
          AND (mc.dts IS NULL OR mc.dts = 0)
          AND (@GuidCliente IS NULL OR mc.GUIDCLIENTES = @GuidCliente)
    )
    UPDATE mc
    SET mc.GUIDFORMAPAGOS = 'RECONCILIADO'
    FROM MovimientoClientes mc
    INNER JOIN RemitosConIngreso r ON RTRIM(mc.GUIDREMITOS) = r.GuidRemito
    WHERE (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
      AND (mc.dts IS NULL OR mc.dts = 0)
      AND (@GuidCliente IS NULL OR mc.GUIDCLIENTES = @GuidCliente);

    -- =========================================================================
    -- 2. Reconciliar cobros legacy: HABER "Cobro Cta. Cte." sin GUIDFORMAPAGOS
    -- =========================================================================
    UPDATE MovimientoClientes
    SET GUIDFORMAPAGOS = 'RECONCILIADO'
    WHERE DESCRIPCION LIKE 'Cobro Cta. Cte.%'
      AND HABER > 0
      AND (GUIDFORMAPAGOS = '' OR GUIDFORMAPAGOS IS NULL)
      AND (dts IS NULL OR dts = 0)
      AND (@GuidCliente IS NULL OR GUIDCLIENTES = @GuidCliente);

    -- =========================================================================
    -- 3. Recalcular saldos: DEBE - pagos parciales - HABER (solo pendientes)
    -- =========================================================================
    UPDATE c
    SET c.SALDO = ISNULL(mov.SaldoReal, 0)
    FROM Clientes c
    CROSS APPLY (
        SELECT
            SUM(ISNULL(mc.DEBE, 0))
            - ISNULL(SUM(pp.TotalParcial), 0)
            - SUM(ISNULL(mc.HABER, 0)) AS SaldoReal
        FROM MovimientoClientes mc
        LEFT JOIN (
            SELECT GUIDMOVIMIENTOCLIENTES, SUM(IMPORTEPAGADO) AS TotalParcial
            FROM PagosParcialesMovimientos
            WHERE (dts IS NULL OR dts = 0)
            GROUP BY GUIDMOVIMIENTOCLIENTES
        ) pp ON pp.GUIDMOVIMIENTOCLIENTES = mc.GUID
        WHERE mc.GUIDCLIENTES = c.GUID
          AND (mc.dts IS NULL OR mc.dts = 0)
          AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
    ) mov
    WHERE c.SALDO <> ISNULL(mov.SaldoReal, 0)
      AND (c.dts IS NULL OR c.dts = 0)
      AND (@GuidCliente IS NULL OR c.GUID = @GuidCliente);

    -- =========================================================================
    -- 4. Clientes sin movimientos pendientes deben quedar en 0
    -- =========================================================================
    UPDATE c
    SET c.SALDO = 0
    FROM Clientes c
    WHERE c.SALDO <> 0
      AND (c.dts IS NULL OR c.dts = 0)
      AND (@GuidCliente IS NULL OR c.GUID = @GuidCliente)
      AND NOT EXISTS (
          SELECT 1
          FROM MovimientoClientes mc
          WHERE mc.GUIDCLIENTES = c.GUID
            AND (mc.dts IS NULL OR mc.dts = 0)
            AND (mc.GUIDFORMAPAGOS = '' OR mc.GUIDFORMAPAGOS IS NULL)
      );
END;
GO

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
