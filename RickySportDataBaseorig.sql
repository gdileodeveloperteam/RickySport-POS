/*
 Navicat Premium Dump SQL

 Source Server         : Local SQLServer
 Source Server Type    : SQL Server
 Source Server Version : 16001000 (16.00.1000)
 Source Host           : localhost:1433
 Source Catalog        : RickySport
 Source Schema         : dbo

 Target Server Type    : SQL Server
 Target Server Version : 16001000 (16.00.1000)
 File Encoding         : 65001

 Date: 16/03/2026 13:34:26
*/


-- ----------------------------
-- Table structure for Articulos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Articulos]') AND type IN ('U'))
	DROP TABLE [dbo].[Articulos]
GO

CREATE TABLE [dbo].[Articulos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDGRUPOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [IPROVEE] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOARTICULO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOPROVEEDOR] int  NULL,
  [CODIGOARTICULOREL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOORIGINAL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(1023) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TALLEDESDE] decimal(7,2)  NULL,
  [TALLEHASTA] decimal(7,2)  NULL,
  [COLOR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PRECIOCOSTO] decimal(13,2)  NULL,
  [PRECIOVENTA] decimal(13,2)  NULL,
  [UTILIDAD] decimal(13,2)  NULL,
  [FECHAULTIMAACTUALIZACION] date  NULL,
  [NOMBREIMAGEN] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [RANGO] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO] char(2) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NTU] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOFAMILIA] int  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [IMAGEN] image  NULL,
  [CostoDolar] decimal(13,2)  NULL,
  [VentaDolar] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[Articulos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Auditoria
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Auditoria]') AND type IN ('U'))
	DROP TABLE [dbo].[Auditoria]
GO

CREATE TABLE [dbo].[Auditoria] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ACTION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TABLENAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PKNAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FIELDSPKNAME] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [VALUESPK] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [USERID] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PCNAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [USERNAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PROCEDURENAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [APPLICATIONNAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHA] int  NULL,
  [HORA] int  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Auditoria] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Bancos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Bancos]') AND type IN ('U'))
	DROP TABLE [dbo].[Bancos]
GO

CREATE TABLE [dbo].[Bancos] (
  [CUENTANUMERO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [BANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DIRECCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LOCALIDAD] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TELEFONO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SALDO] decimal(13,2)  NULL,
  [TIPOCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] int  NULL,
  [sts] int  NULL,
  [dts] int  NULL
)
GO

ALTER TABLE [dbo].[Bancos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for BancosConceptos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[BancosConceptos]') AND type IN ('U'))
	DROP TABLE [dbo].[BancosConceptos]
GO

CREATE TABLE [dbo].[BancosConceptos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDPLANCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPOCONCEPTO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[BancosConceptos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for BancosCuentas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[BancosCuentas]') AND type IN ('U'))
	DROP TABLE [dbo].[BancosCuentas]
GO

CREATE TABLE [dbo].[BancosCuentas] (
  [GUID] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDCONFIGURACION] varchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDBANCO] varchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDTIPOCUENTABANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPOCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NUMEROCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CBU] varchar(22) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ALIAS] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DIRECCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SUCURSAL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAAPERTURA] date  NULL,
  [FECHACIERRE] date  NULL,
  [SALDOINICIAL] int  NULL,
  [SALDO] decimal(7,2)  NULL,
  [TITULAR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[BancosCuentas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for browseformats
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[browseformats]') AND type IN ('U'))
	DROP TABLE [dbo].[browseformats]
GO

CREATE TABLE [dbo].[browseformats] (
  [GUID] char(16) COLLATE Modern_Spanish_CI_AI  NOT NULL,
  [DESCRIPTION] varchar(254) COLLATE Modern_Spanish_CI_AI  NOT NULL,
  [PROCEDIMIENTO] varchar(99) COLLATE Modern_Spanish_CI_AI  NOT NULL,
  [TITULOWINDOW] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [SQLQUERY] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [SQLQUERYUPDATE] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [SQLSUBQUERY] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [SQLSUBQUERYUPDATE] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [SQLQUERYUPDATEFORM] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [BROWSEFIELDS] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [UPDATEFORM] varchar(254) COLLATE Modern_Spanish_CI_AI  NOT NULL,
  [UPDATEFORMFIELDS] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [UPDATEFORMCATEGORIES] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [UPDATEFORMOKBUTTON] varchar(1998) COLLATE Modern_Spanish_CI_AI  NULL,
  [UPDATEFORMTITLEWINDOW] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [FILENAME] char(100) COLLATE Modern_Spanish_CI_AI  NULL,
  [APPLYTHEME] tinyint  NULL,
  [ENABLEFILTER] tinyint  NULL,
  [ENABLELOCATOR] tinyint  NULL,
  [ENABLEGROUP] tinyint  NULL,
  [ENABLEPRINT] tinyint  NULL,
  [ENABLESORTING] tinyint  NULL,
  [BACKGROUNDCOLOR] int  NULL,
  [FOREGROUNDCOLOR] int  NULL,
  [SELECTCOLOR] int  NULL,
  [FILTERCOLOR] int  NULL,
  [LOCATORCOLOR] int  NULL,
  [PRINTPAPERPOSITION] tinyint  NULL,
  [PRINTTITULO] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [PRINTFOOTER] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [PRINTPAPEL] varchar(19) COLLATE Modern_Spanish_CI_AI  NULL,
  [TASKPANELGROUP] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [TASKPANELITEM] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [TASKPANELPROCEDURE] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [TASKPANELPROCEDUREPARAMETERS] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [TASKPANELLEVEL] smallint  NULL,
  [TASKPANELEXPRESSION] varchar(500) COLLATE Modern_Spanish_CI_AI  NULL,
  [TASKPANELCREATE] smallint  NULL,
  [ts] int  NOT NULL,
  [sts] int  NOT NULL,
  [dts] int  NULL,
  [DATEADDED] int  NULL,
  [TIMEADDED] int  NULL,
  [USERADDED] int  NULL,
  [DATECHANGED] int  NULL,
  [TIMECHANGED] int  NULL,
  [USERCHANGED] int  NULL,
  [TAKEFIELDACCEPTED] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [TAKEFIELDSELECTED] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL,
  [CALLFILTER] smallint  NULL,
  [FILTERPROCEDURE] varchar(254) COLLATE Modern_Spanish_CI_AI  NULL
)
GO

ALTER TABLE [dbo].[browseformats] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for browseformatsactions
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[browseformatsactions]') AND type IN ('U'))
	DROP TABLE [dbo].[browseformatsactions]
GO

CREATE TABLE [dbo].[browseformatsactions] (
  [GUID] char(16) COLLATE Modern_Spanish_CI_AI  NOT NULL,
  [POSITION] int  NULL,
  [PROCEDIMIENTO] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [UPDATEFORM] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [FIELDNAME] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [EVENT] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [ACTION] varchar(1024) COLLATE Modern_Spanish_CI_AI  NULL,
  [REQUEST] int  NULL,
  [PROCEDURECALL] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [PROCEDUREPARAMETERS] varchar(1024) COLLATE Modern_Spanish_CI_AI  NULL,
  [PIF] varchar(1024) COLLATE Modern_Spanish_CI_AI  NULL,
  [PTHEN] varchar(1024) COLLATE Modern_Spanish_CI_AI  NULL,
  [PELSE] varchar(1024) COLLATE Modern_Spanish_CI_AI  NULL,
  [ACTIVE] int  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [NEWVALUE] varchar(max) COLLATE Modern_Spanish_CI_AI  NULL
)
GO

ALTER TABLE [dbo].[browseformatsactions] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for browseformatsbuttons
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[browseformatsbuttons]') AND type IN ('U'))
	DROP TABLE [dbo].[browseformatsbuttons]
GO

CREATE TABLE [dbo].[browseformatsbuttons] (
  [Guid] char(16) COLLATE Modern_Spanish_CI_AI  NOT NULL,
  [pProcedure] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pName] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [ButtonId] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pCreate] int  NULL,
  [pProcedureCall] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pProcedureCallParameters] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pIcon] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pParentID] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pToolTip] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pExpression] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pPopUp] int  NULL,
  [pShortCutKey] varchar(255) COLLATE Modern_Spanish_CI_AI  NULL,
  [pFlagAlign] int  NULL,
  [pSTDAction] int  NULL,
  [pOrder] int  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[browseformatsbuttons] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for CajaDiaria
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[CajaDiaria]') AND type IN ('U'))
	DROP TABLE [dbo].[CajaDiaria]
GO

CREATE TABLE [dbo].[CajaDiaria] (
  [FECHA] date  NOT NULL,
  [TIPOCOMPROBANTE] varchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DEBE] decimal(13,2)  NULL,
  [HABER] decimal(13,2)  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDMOVIMIENTOBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDFORMAPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCAJAGASTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[CajaDiaria] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for CajaGastos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[CajaGastos]') AND type IN ('U'))
	DROP TABLE [dbo].[CajaGastos]
GO

CREATE TABLE [dbo].[CajaGastos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDMOVIMIENTOPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDMOVIMIENTOBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDMOVIMIENTOADELANTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHA] decimal(7)  NULL,
  [RUBRO] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DEBE] decimal(13,3)  NULL,
  [TIPO_COMPROBANTE] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FACTURA] tinyint  NULL,
  [TIPO_FACTURA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IVA21] decimal(7,2)  NULL,
  [IVA105] decimal(7,2)  NULL,
  [IVA27] decimal(7,2)  NULL,
  [NUMERO_FACTURA] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] int  NULL,
  [sts] int  NULL,
  [dts] int  NULL
)
GO

ALTER TABLE [dbo].[CajaGastos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Clientes
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Clientes]') AND type IN ('U'))
	DROP TABLE [dbo].[Clientes]
GO

CREATE TABLE [dbo].[Clientes] (
  [CODIGO_CLIENTE] int  NULL,
  [CODIGO_VENDEDOR] int  NULL,
  [NOMBRE] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUENTA] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DIRECCION] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGO_DOCUMENTO_AFIP] int  NULL,
  [DESCRIPCION_DOCUMENTO_AFIP] char(250) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [EMAIL_FACTURACION] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGO_IVA] int  NULL,
  [IDCOMP] int  NULL,
  [DOCUMENTO] char(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CUIT] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [EMAIL] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO_IVA] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO_FACTURA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PROVINCIA] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LOCALIDAD] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGO_POSTAL] char(6) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TELEFONO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FAX] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CELULAR] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SALDO] decimal(13,3)  NULL,
  [ENVIAFACTURA] tinyint  NULL,
  [LIMITE_CREDITO] decimal(11,2)  NULL,
  [OBSERVACIONES] varchar(5000) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NOMBRE_EMPRESA] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CLIENTE_EMPRESA] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHA_ALTA] date  NULL,
  [RETENCION_BRUTOS] tinyint  NULL,
  [RETENCION_GANANCIA] tinyint  NULL,
  [AGENTE_NUMERO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SUCURSAL] tinyint  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [DATEADDED] int  NULL,
  [TIMEADDED] int  NULL,
  [USERADDED] int  NULL,
  [DATECHANGED] int  NULL,
  [TIMECHANGED] int  NULL,
  [USERCHANGED] int  NULL,
  [PERMITECREDITO] int  NULL
)
GO

ALTER TABLE [dbo].[Clientes] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for ColaImpresion
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ColaImpresion]') AND type IN ('U'))
	DROP TABLE [dbo].[ColaImpresion]
GO

CREATE TABLE [dbo].[ColaImpresion] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [IDV] int  NULL,
  [ESTADO] int  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[ColaImpresion] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Comprobantes
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Comprobantes]') AND type IN ('U'))
	DROP TABLE [dbo].[Comprobantes]
GO

CREATE TABLE [dbo].[Comprobantes] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGO_CONFIGURACION] int  NOT NULL,
  [IDCOMP] int  NOT NULL,
  [CODIGO_VENDEDOR] int  NOT NULL,
  [DECOMP] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ABCOMP] char(7) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [VASIGN] smallint  NULL,
  [LETRA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PUNTOVENTA] int  NULL,
  [NUMERO] int  NULL,
  [LIBROIVAVENTAS] tinyint  NULL,
  [COPIAS] tinyint  NULL,
  [COPIASREMITO] tinyint  NULL,
  [OBSERVACIONES] char(800) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NOPERC] tinyint  NULL,
  [DATECHANGED] int  NULL,
  [COAFIP] smallint  NOT NULL,
  [DATEADDED] int  NULL,
  [TIMEADDED] int  NULL,
  [USERADDED] int  NULL,
  [TIMECHANGED] int  NULL,
  [USERCHANGED] int  NULL,
  [FACTURAA] int  NULL,
  [REMITO] int  NULL,
  [ESCREDITO] tinyint  NULL,
  [FACTELECT] tinyint  NULL,
  [BAJA] tinyint  NULL
)
GO

ALTER TABLE [dbo].[Comprobantes] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for ComprobantesOrdenDePago
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ComprobantesOrdenDePago]') AND type IN ('U'))
	DROP TABLE [dbo].[ComprobantesOrdenDePago]
GO

CREATE TABLE [dbo].[ComprobantesOrdenDePago] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDFACTURASCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDORDENESDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TOTALPAGADO] decimal(13,2)  NULL,
  [NUMEROCOMPROBANTE] int  NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ESTADO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMPORTEDESCUENTO] decimal(13,2)  NULL,
  [IMPORTECOMPROBANTE] decimal(13,2)  NULL,
  [TOTALAPAGAR] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[ComprobantesOrdenDePago] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for ComprobantesXRecibos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ComprobantesXRecibos]') AND type IN ('U'))
	DROP TABLE [dbo].[ComprobantesXRecibos]
GO

CREATE TABLE [dbo].[ComprobantesXRecibos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDRECIBOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCOMPROBANTESORDENDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDORDENESDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [MONTOAPAGARCOMPROBANTE] decimal(13,2)  NULL,
  [MONTOPAGADOCOMPROBANTE] decimal(13,2)  NULL,
  [SALDOCOMPROBANTE] decimal(13,2)  NULL,
  [TIPOCOMPROBANTE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDRELACIONTIPOCOMPROBANTE] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[ComprobantesXRecibos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for ConceptosPorBanco
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ConceptosPorBanco]') AND type IN ('U'))
	DROP TABLE [dbo].[ConceptosPorBanco]
GO

CREATE TABLE [dbo].[ConceptosPorBanco] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDBANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONCEPTOBANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOCONCEPTOSEGUNBANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCIONSEGUNBANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[ConceptosPorBanco] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Configuracion
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Configuracion]') AND type IN ('U'))
	DROP TABLE [dbo].[Configuracion]
GO

CREATE TABLE [dbo].[Configuracion] (
  [CODIGO_CONFIGURACION] int  NOT NULL,
  [IDEMPRESA] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FIRMANTE] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CARGO] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [EMPRESA] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DIRECCION] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIT] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [INICIOACTIVIDAD] date  NULL,
  [EMAIL] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PUERTOMAIL] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SERVIDORMAIL] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CLAVEMAIL] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [USUARIOMAIL] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SSLMAIL] tinyint  NULL,
  [TLSMAIL] tinyint  NULL,
  [INGRESOSBRUTOS] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CONDICIONIVA] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LINEA1] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LINEA2] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LINEA3] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [RUTA] varchar(499) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [RUTA_PDF] varchar(499) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PAGADO] tinyint  NULL,
  [HABILITADO] tinyint  NULL,
  [FORMAPAGO] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAPAGO] int  NULL,
  [FECHA_INICIO] int  NULL,
  [FECHA_NOW] int  NULL,
  [VOLSERIALNO] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [COMPUTADORANOMBRE] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ENVIAMAIL] tinyint  NULL,
  [ARCHIVO_FRIMA] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ARCHIVO_NOMINA] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ARCHIVOS_BASES] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ARCHIVO_IMAGEN] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPOINGRESOSBRUTOS] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ALICUOTAINGRESOSBRUTOS] decimal(7,2)  NULL,
  [CELULAR] char(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [JURISDICCION] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IDPLANCUENTASVENTA] int  NULL,
  [IDPLANCUENTASCOMPRAS] int  NULL,
  [CBU] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [SUCURSAL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LOGO] image  NULL
)
GO

ALTER TABLE [dbo].[Configuracion] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for DBFST
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[DBFST]') AND type IN ('U'))
	DROP TABLE [dbo].[DBFST]
GO

CREATE TABLE [dbo].[DBFST] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODP] char(2) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODA] char(6) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NRO] numeric(5,1)  NOT NULL,
  [COLOR] char(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [REL] char(9) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ENTT1] smallint  NULL,
  [SALT1] smallint  NULL,
  [EXIST1] smallint  NULL,
  [ENTT2] smallint  NULL,
  [SALT2] smallint  NULL,
  [EXIST2] smallint  NULL,
  [ENTR] smallint  NULL,
  [SALR] smallint  NULL,
  [EXISR] smallint  NULL,
  [ENTCH] smallint  NULL,
  [SALCH] smallint  NULL,
  [EXISCH] smallint  NULL,
  [ENTO] smallint  NULL,
  [SALO] smallint  NULL,
  [EXISO] smallint  NULL,
  [ENTE] smallint  NULL,
  [SALE] smallint  NULL,
  [EXISE] smallint  NULL,
  [ENTT3] smallint  NULL,
  [SALT3] smallint  NULL,
  [EXIST3] smallint  NULL
)
GO

ALTER TABLE [dbo].[DBFST] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for DetAudit
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[DetAudit]') AND type IN ('U'))
	DROP TABLE [dbo].[DetAudit]
GO

CREATE TABLE [dbo].[DetAudit] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDAUDIT] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FIELDNAME] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [OLDVALUE] image  NULL,
  [NEWVALUE] image  NULL
)
GO

ALTER TABLE [dbo].[DetAudit] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Facturas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Facturas]') AND type IN ('U'))
	DROP TABLE [dbo].[Facturas]
GO

CREATE TABLE [dbo].[Facturas] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  [CODIGO_CONFIGURACION] int  NOT NULL,
  [CODIGO_IMPUTACION] int  NOT NULL,
  [CODIGO_VENDEDOR] int  NOT NULL,
  [VENDEDOR_NOMBRE] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [BONIFICACION] decimal(5,2)  NULL,
  [CODIGO_FACTURA] int  NULL,
  [CODIGO_CLIENTE] int  NULL,
  [CODIGO_DOCUMENTO_AFIP] decimal(3)  NOT NULL,
  [CODIGO_CONCEPTO_AFIP] decimal(3)  NOT NULL,
  [IDCOMP] int  NOT NULL,
  [NUMERO_FACTURA] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PUNTOVENTA] int  NOT NULL,
  [NUMERO] int  NOT NULL,
  [NUMEROHASTA] int  NULL,
  [NUMEROCIERREZ] int  NULL,
  [TIPO_COMPROBANTE] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPO_FACTURA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPO_IVA] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGO_REMITO] smallint  NULL,
  [FECHA] decimal(7)  NULL,
  [FECHA_VENCIMIENTO] date  NULL,
  [FECHASERVDESDE] date  NULL,
  [FECHASERVHASTA] date  NULL,
  [NOMBRE] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DIRECCION] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIT] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTAL_IVA21] decimal(15,2)  NULL,
  [TOTAL_IVA105] decimal(15,2)  NULL,
  [TOTAL_NETO21] decimal(15,2)  NULL,
  [TOTAL_NETO105] decimal(15,2)  NULL,
  [TOTAL_IVA0] decimal(15,2)  NULL,
  [TOTAL_NETO0] decimal(15,2)  NULL,
  [TOTAL_IVA25] decimal(15,2)  NULL,
  [TOTAL_NETO25] decimal(15,2)  NULL,
  [TOTAL_IVA27] decimal(15,2)  NULL,
  [TOTAL_NETO27] decimal(15,2)  NULL,
  [TOTAL_IVA5] decimal(15,2)  NULL,
  [TOTAL_NETO5] decimal(15,2)  NULL,
  [TOTAL_EXENTO] decimal(15,2)  NULL,
  [TOTAL_SUJETO] decimal(15,2)  NULL,
  [TOTAL_IMPUESTOSINTERNOS] decimal(15,2)  NULL,
  [TOTAL_NOGRAVADO] decimal(15,2)  NULL,
  [RETENCION_BRUTOS] tinyint  NULL,
  [RETENCION_GANANCIA] tinyint  NULL,
  [MONTO_BRUTOS] decimal(15,2)  NULL,
  [MONTO_GANANCIA] decimal(15,2)  NULL,
  [TOTAL] decimal(15,2)  NULL,
  [DECAE] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECAE] date  NULL,
  [PENDIENTE] tinyint  NULL,
  [CUENTA] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PROCESADAAFIP] tinyint  NULL,
  [APROBACION] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MONEDAID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MONEDACOTIZACION] decimal(11,6)  NULL,
  [OBSERVACIONES] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOERRORAFIP] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MESSAGEAFIP] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DATEADDED] int  NULL,
  [TIMEADDED] int  NULL,
  [USERADDED] int  NULL,
  [DATECHANGED] int  NULL,
  [TIMECHANGED] int  NULL,
  [USERCHANGED] int  NULL,
  [IDPLANCUENTAS] int  NULL,
  [GUIDCOMPROBANTEASOCIADO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [Codigo_ComprobanteAfip] int  NULL,
  [Recargo] decimal(13,2)  NULL,
  [Descuento] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[Facturas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for FacturasCompras
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[FacturasCompras]') AND type IN ('U'))
	DROP TABLE [dbo].[FacturasCompras]
GO

CREATE TABLE [dbo].[FacturasCompras] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOSCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOCOMPROBANTEAFIP] int  NOT NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [REMITONUMERO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [PUNTOVENTA] int  NOT NULL,
  [NUMERO] int  NOT NULL,
  [TIPOCOMPROBANTE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [LETRA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TOTAL] decimal(13,3)  NULL,
  [FECHA] int  NULL,
  [FECHACARGA] date  NOT NULL,
  [RETENCIONIVA] tinyint  NULL,
  [RETENCIONBRUTOS] tinyint  NULL,
  [RETENCIONGANANCIA] tinyint  NULL,
  [BONIFICACION] decimal(13,3)  NULL,
  [NETOGRAVADO] decimal(13,2)  NULL,
  [CONCEPTONOGRAVADO] decimal(13,3)  NULL,
  [EXENTO] decimal(13,2)  NULL,
  [IVA105] decimal(13,3)  NULL,
  [IVA21] decimal(13,3)  NULL,
  [IVA27] decimal(13,3)  NULL,
  [MONTOIVA] decimal(13,3)  NULL,
  [MONTOBRUTOS] decimal(13,3)  NULL,
  [MONTOGANANCIA] decimal(13,3)  NULL,
  [DESCUENTO] decimal(13,2)  NULL,
  [IMPUESTOSINTERNOS] decimal(13,2)  NULL,
  [JURISDICCION] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [OBSERVACIONES] varchar(1998) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PAGADA] tinyint  NULL,
  [TIPO] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IDPLANCUENTAS] int  NULL,
  [IMAGEN] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[FacturasCompras] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for FormaPagos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[FormaPagos]') AND type IN ('U'))
	DROP TABLE [dbo].[FormaPagos]
GO

CREATE TABLE [dbo].[FormaPagos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NUMEROFACTURA] int  NULL,
  [PUNTOVENTA] smallint  NULL,
  [NOMBRETIPOPAGO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMPORTEINTERES] decimal(11,2)  NULL,
  [CUOTAS] tinyint  NULL,
  [INTERES] decimal(7,2)  NULL,
  [COEFICIENTE] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUPONNUMERO] int  NULL,
  [LOTE] smallint  NULL,
  [TARJETANUMERO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAVENCIMIENTO] date  NULL,
  [FECHA] date  NOT NULL,
  [TIPOCOMPROBANTE] varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ABREVIADO] char(2) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMPORTEPAGAR] decimal(13,2)  NULL,
  [IMPORTE] decimal(13,3)  NULL,
  [DESCRIPCION] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SUCURSAL] tinyint  NULL,
  [TIPO] tinyint  NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFACTURAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCAJADIARIA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDMOVIMIENTOBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[FormaPagos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for ImputacionesPlanCuentas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ImputacionesPlanCuentas]') AND type IN ('U'))
	DROP TABLE [dbo].[ImputacionesPlanCuentas]
GO

CREATE TABLE [dbo].[ImputacionesPlanCuentas] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPLANCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[ImputacionesPlanCuentas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Jurisdicciones
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Jurisdicciones]') AND type IN ('U'))
	DROP TABLE [dbo].[Jurisdicciones]
GO

CREATE TABLE [dbo].[Jurisdicciones] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [PROVINCIA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[Jurisdicciones] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for LibroCheques
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[LibroCheques]') AND type IN ('U'))
	DROP TABLE [dbo].[LibroCheques]
GO

CREATE TABLE [dbo].[LibroCheques] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDORIGENFONDOSCHEQUES] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDGASTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDPROVEEDOR] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDBANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPOCHEQUE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAVENCIMIENTO] date  NULL,
  [GUIDUSUARIOCARGA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NUMEROCHEQUE] int  NULL,
  [GUIDFORMAPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUENTANUMERO] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TITULAR] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUITTITULAR] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TERCERO] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMPORTE] decimal(13,3)  NULL,
  [ESTADO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAEMISION] date  NULL,
  [FECHACOBRO] date  NULL
)
GO

ALTER TABLE [dbo].[LibroCheques] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Liquidaciones
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Liquidaciones]') AND type IN ('U'))
	DROP TABLE [dbo].[Liquidaciones]
GO

CREATE TABLE [dbo].[Liquidaciones] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPROVEEDOR] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NROLIQUIDACION] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHAPAGO] date  NULL,
  [TOTALVENTAS] decimal(15,2)  NULL,
  [ARANCEL] decimal(15,2)  NULL,
  [PORCENTAJEIVAARANCEL] decimal(15,2)  NULL,
  [MONTOIVAARANCEL] decimal(15,2)  NULL,
  [DESCUENTOFINANCIERO] decimal(15,2)  NULL,
  [PORCENTAJEIVADESCUENTOFINANCIERO] decimal(15,2)  NULL,
  [MONTOIVADESCUENTOFINANCIERO] decimal(15,2)  NULL,
  [MONTOINGRESOSBRUTOS] decimal(15,2)  NULL,
  [MONTOGANANCIAS] decimal(15,2)  NULL,
  [MONTOIVA] decimal(15,2)  NULL,
  [POSNET] decimal(15,2)  NULL,
  [PORCENTAJEIVAPOSNET] decimal(15,2)  NULL,
  [MONTOIVAPOSNET] decimal(15,2)  NULL,
  [CARGOSISTEMACUENTAMENSUAL] decimal(7,2)  NULL,
  [PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL] decimal(7,2)  NULL,
  [MONTOIVACARGOSISTEMACUENTAMENSUAL] decimal(15,2)  NULL,
  [FIRSTDATA] numeric(7,2)  NULL,
  [PORCENTAJEIVAFIRSTDATA] decimal(7,2)  NULL,
  [MONTOIVAFIRSTDATA] numeric(15,2)  NULL,
  [PESPECIALES] decimal(7,2)  NULL,
  [PORCENTAJEIVAPESPECIALES] decimal(7,2)  NULL,
  [MONTOIVAPESPECIALES] decimal(7,2)  NULL,
  [OBSERVACIONES] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHACARGA] date  NULL,
  [FECHALIQUIDACION] date  NULL,
  [USUARIOIDCARGA] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMPUESTOPERCEPCIONIVA] decimal(15,2)  NULL,
  [BASEEXENTA] decimal(15,2)  NULL,
  [OTROSDESCUENTOS] decimal(15,2)  NULL,
  [DEDUCCIONESIMPOSITIVAS] decimal(15,2)  NULL,
  [DEDUCCIONESNETAS] decimal(15,2)  NULL,
  [RESULTADO] decimal(15,2)  NULL,
  [IMAGEN] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTALNETO105] decimal(18,2)  NULL,
  [TOTALNETO21] decimal(18,2)  NULL,
  [TOTALNETO27] decimal(18,2)  NULL
)
GO

ALTER TABLE [dbo].[Liquidaciones] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Modulos_Usuarios
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Modulos_Usuarios]') AND type IN ('U'))
	DROP TABLE [dbo].[Modulos_Usuarios]
GO

CREATE TABLE [dbo].[Modulos_Usuarios] (
  [CODIGO_MODULO] int  NOT NULL,
  [CODIGO_USUARIO] int  NULL,
  [MODULO] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MODULO_INTERNO] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NIVEL] tinyint  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDUSUARIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Modulos_Usuarios] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientoArticulos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoArticulos]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientoArticulos]
GO

CREATE TABLE [dbo].[MovimientoArticulos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOPROVEEDOR] int  NULL,
  [CODIGOARTICULO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NUMERO] decimal(7,2)  NOT NULL,
  [COLOR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[MovimientoArticulos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientoClientes
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoClientes]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientoClientes]
GO

CREATE TABLE [dbo].[MovimientoClientes] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHA] decimal(7)  NULL,
  [CANTIDAD] smallint  NULL,
  [ARTICULO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] varchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TALLE] decimal(7,2)  NULL,
  [PRECIOUNITARIO] decimal(11,2)  NULL,
  [IVA] decimal(5,2)  NULL,
  [DEBE] decimal(13,3)  NULL,
  [HABER] decimal(13,3)  NULL,
  [SALDO] decimal(13,3)  NULL,
  [PAGO] char(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LINKPROCESADORPAGO] varchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SUCURSAL] tinyint  NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFORMAPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCAJADIARIA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDMOVIMIENTOBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[MovimientoClientes] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientoFactuas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoFactuas]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientoFactuas]
GO

CREATE TABLE [dbo].[MovimientoFactuas] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFACTURAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGO_FACTURA] int  NULL,
  [ARTICULO] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CANTIDAD] decimal(11,2)  NULL,
  [DETALLE] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [P_UNITARIO] decimal(13,3)  NULL,
  [P_TOTAL] decimal(13,3)  NULL,
  [PORCENTAJE_IVA] decimal(5,2)  NULL,
  [IVA25] decimal(13,3)  NULL,
  [IVA5] decimal(13,3)  NULL,
  [IVA105] decimal(13,3)  NULL,
  [IVA21] decimal(13,3)  NULL,
  [IVA27] decimal(13,3)  NULL,
  [SERVICIO] tinyint  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [Recargo] decimal(13,2)  NULL,
  [Descuento] decimal(13,2)  NULL,
  [Impuestos] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[MovimientoFactuas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientoRemitos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoRemitos]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientoRemitos]
GO

CREATE TABLE [dbo].[MovimientoRemitos] (
  [ARTICULO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NUMERO] decimal(5,1)  NULL,
  [CANTIDAD] decimal(7,2)  NULL,
  [NETO] decimal(11,2)  NULL,
  [IVA] decimal(9,2)  NULL,
  [SUBTOTAL] decimal(11,2)  NULL,
  [TOTAL] decimal(11,2)  NULL,
  [COSTO] decimal(13,2)  NULL,
  [PRECIO_ANTERIOR] decimal(11,2)  NULL,
  [UTILIDAD] decimal(11,2)  NULL,
  [FECHAACT] date  NULL,
  [TIPOOPERACION] varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCLIENTES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDMOVIMIENTOARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDREMITOSTRANSFERENCIAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDREMITOSCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[MovimientoRemitos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientosCheques
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientosCheques]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientosCheques]
GO

CREATE TABLE [dbo].[MovimientosCheques] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDLIBROCHEQUE] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDRELACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ENTIDAD] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ESTADO] char(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCIÓN] char(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[MovimientosCheques] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientosCuentaBancos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientosCuentaBancos]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientosCuentaBancos]
GO

CREATE TABLE [dbo].[MovimientosCuentaBancos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [FECHA] date  NULL,
  [DEBITOS] decimal(13,2)  NULL,
  [CREDITOS] decimal(13,2)  NULL,
  [IMPORTE] decimal(13,2)  NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDBANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [BANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONCEPTOBANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CONCEPTO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GuidTiposMovimientosCuentaBancos] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GuidBancosCuentas] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[MovimientosCuentaBancos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for MovimientoStock
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientoStock]') AND type IN ('U'))
	DROP TABLE [dbo].[MovimientoStock]
GO

CREATE TABLE [dbo].[MovimientoStock] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOSCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOSTRANSFERENCIAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDMOVIMIENTOARTICULOS] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALORIGEN] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALDESTINO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  [CODIGOARTICULO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NUMERO] decimal(13,2)  NULL,
  [COLOR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [INGRESO] float(53)  NULL,
  [EGRESO] float(53)  NULL,
  [ESTADO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHA] date  NULL,
  [TIPO] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[MovimientoStock] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for OrdenesDePago
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[OrdenesDePago]') AND type IN ('U'))
	DROP TABLE [dbo].[OrdenesDePago]
GO

CREATE TABLE [dbo].[OrdenesDePago] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NUMEROORDENPAGO] int  NULL,
  [FECHA] date  NULL,
  [FECHAFINALPAGO] date  NULL,
  [MONTOTOTAL] decimal(13,2)  NULL,
  [MONEDA] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ESTADO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TERMINADA] tinyint  NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[OrdenesDePago] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for OrigenFondosCheques
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[OrigenFondosCheques]') AND type IN ('U'))
	DROP TABLE [dbo].[OrigenFondosCheques]
GO

CREATE TABLE [dbo].[OrigenFondosCheques] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [DESCRIPCION] char(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[OrigenFondosCheques] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for PagosRecibos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[PagosRecibos]') AND type IN ('U'))
	DROP TABLE [dbo].[PagosRecibos]
GO

CREATE TABLE [dbo].[PagosRecibos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDRECIBOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FORMAPAGO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MONTO] decimal(13,2)  NULL,
  [NUMEROCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TITULAR] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [BANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[PagosRecibos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for PlanCuentas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[PlanCuentas]') AND type IN ('U'))
	DROP TABLE [dbo].[PlanCuentas]
GO

CREATE TABLE [dbo].[PlanCuentas] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IDPLANCONTABLE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PLANCONTABLE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUENTACONTABLE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ETIQUETA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CUENTAPADRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GRUPOCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SUBGRUPOCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ESTADO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[PlanCuentas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Proveedores
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Proveedores]') AND type IN ('U'))
	DROP TABLE [dbo].[Proveedores]
GO

CREATE TABLE [dbo].[Proveedores] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NOMBRE] char(50) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DIRECCION] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LOCALIDAD] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PROVINCIA] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOPOSTAL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [EMAIL] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TELEFONO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CELULAR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ENCARGADO] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [OBSERVACIONES] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ACTIVO] tinyint  NULL,
  [CONDICION_IVA] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [RUBRO] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [CUIT] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Proveedores] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Recibos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Recibos]') AND type IN ('U'))
	DROP TABLE [dbo].[Recibos]
GO

CREATE TABLE [dbo].[Recibos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDORDENESDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TIPORECIBO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHACREACIONRECIBO] date  NULL,
  [IMPORTECOMPROBANTE] decimal(13,2)  NULL,
  [DESCUENTOCOMPROBANTE] decimal(13,2)  NULL,
  [SUBTOTALCOMPROBANTE] decimal(13,2)  NULL,
  [TOTALRECIBO] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[Recibos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Remitos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Remitos]') AND type IN ('U'))
	DROP TABLE [dbo].[Remitos]
GO

CREATE TABLE [dbo].[Remitos] (
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
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Remitos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for RemitosCompras
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[RemitosCompras]') AND type IN ('U'))
	DROP TABLE [dbo].[RemitosCompras]
GO

CREATE TABLE [dbo].[RemitosCompras] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFACTURASCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDVENDEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOCOMPROBANTEAFIP] int  NOT NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [REMITONUMERO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [PUNTOVENTA] int  NOT NULL,
  [NUMERO] int  NOT NULL,
  [TIPOCOMPROBANTE] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [LETRA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [TOTAL] decimal(13,3)  NULL,
  [FECHA] int  NULL,
  [FECHACARGA] date  NOT NULL,
  [RETENCIONIVA] tinyint  NULL,
  [RETENCIONBRUTOS] tinyint  NULL,
  [RETENCIONGANANCIA] tinyint  NULL,
  [BONIFICACION] decimal(13,3)  NULL,
  [NETOGRAVADO] decimal(13,2)  NULL,
  [CONCEPTONOGRAVADO] decimal(13,3)  NULL,
  [EXENTO] decimal(13,2)  NULL,
  [IVA105] decimal(13,3)  NULL,
  [IVA21] decimal(13,3)  NULL,
  [IVA27] decimal(13,3)  NULL,
  [MONTOIVA] decimal(13,3)  NULL,
  [MONTOBRUTOS] decimal(13,3)  NULL,
  [MONTOGANANCIA] decimal(13,3)  NULL,
  [DESCUENTO] decimal(13,2)  NULL,
  [IMPUESTOSINTERNOS] decimal(13,2)  NULL,
  [JURISDICCION] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [OBSERVACIONES] varchar(1998) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PAGADA] tinyint  NULL,
  [TIPO] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IDPLANCUENTAS] int  NULL,
  [IMAGEN] varchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[RemitosCompras] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for ReporteZ
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[ReporteZ]') AND type IN ('U'))
	DROP TABLE [dbo].[ReporteZ]
GO

CREATE TABLE [dbo].[ReporteZ] (
  [NROZ] int  NOT NULL,
  [TOTALFACTURADO] decimal(13,2)  NULL,
  [TOTALIVA] decimal(13,2)  NULL,
  [TOTALCOMPROBANTES] int  NULL,
  [TICKETANTERIOR] int  NULL,
  [ULTIMAFACTURAA] int  NULL,
  [ULTIMOTICKET] int  NULL,
  [FECHA] int  NOT NULL,
  [HORA] int  NULL,
  [DATEADDED] int  NULL,
  [TIMEADDED] int  NULL,
  [USERADDED] int  NULL,
  [DATECHANGED] int  NULL,
  [TIMECHANGED] int  NULL,
  [USERCHANGED] int  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[ReporteZ] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SliderImages
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SliderImages]') AND type IN ('U'))
	DROP TABLE [dbo].[SliderImages]
GO

CREATE TABLE [dbo].[SliderImages] (
  [Id] int  IDENTITY(1,1) NOT NULL,
  [FileName] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [OriginalName] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [MimeType] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ImageData] varbinary(max)  NOT NULL,
  [Title] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [Description] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LinkUrl] nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DisplayOrder] int DEFAULT 0 NULL,
  [Active] bit DEFAULT 1 NULL,
  [CreatedAt] datetime DEFAULT getdate() NULL,
  [UpdatedAt] datetime DEFAULT getdate() NULL
)
GO

ALTER TABLE [dbo].[SliderImages] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Sucursales
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Sucursales]') AND type IN ('U'))
	DROP TABLE [dbo].[Sucursales]
GO

CREATE TABLE [dbo].[Sucursales] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOCONFIGURACION] int  NULL,
  [CODIGOSUCURSAL] int  NOT NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CUIT] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PUNTOVENTA] smallint  NULL,
  [IDCOMPROBANTEFACA] int  NULL,
  [IDCOMPROBANTEFACB] int  NULL,
  [IDCOMPROBANTENCDA] int  NULL,
  [IDCOMPROBANTENCDB] int  NULL,
  [IDCOMPROBANTENDDA] int  NULL,
  [IDCOMPROBANTENDDB] int  NULL,
  [ULTIMAFACTURAA] int  NULL,
  [ULTIMAFACTURAB] int  NULL,
  [ULTIMANOTACREDITOA] int  NULL,
  [ULTIMANOTACREDITOB] int  NULL,
  [ULTIMANOTADEBITOA] int  NULL,
  [ULTIMANOTADEBITOB] int  NULL,
  [ULTIMOPRESUPUESTO] int  NULL,
  [RUTASCANFACTURAS] char(300) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PORCENTAJELISTA] decimal(7,2)  NULL,
  [TIEMPOACTUALIZA] tinyint  NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL,
  [LOGO] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [COTIZACIONDOLAR] decimal(13,2)  NULL,
  [IDCOMPROBANTEFACP] int  NULL
)
GO

ALTER TABLE [dbo].[Sucursales] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for TCPagos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TCPagos]') AND type IN ('U'))
	DROP TABLE [dbo].[TCPagos]
GO

CREATE TABLE [dbo].[TCPagos] (
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
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[TCPagos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for TCPagosPlanes
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TCPagosPlanes]') AND type IN ('U'))
	DROP TABLE [dbo].[TCPagosPlanes]
GO

CREATE TABLE [dbo].[TCPagosPlanes] (
  [CODIGO_TCP] int  NULL,
  [NOMBRECOMPROBANTEPAGO] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [INTERES] decimal(7,2)  NULL,
  [COEFICIENTE] decimal(11,5)  NULL,
  [CUOTAS] smallint  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDTCPAGOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NOT NULL,
  [DATEADDED] int  NULL,
  [TIMEADDED] int  NULL,
  [USERADDED] int  NULL,
  [DATECHANGED] int  NULL,
  [TIMECHANGED] int  NULL,
  [USERCHANGED] int  NULL
)
GO

ALTER TABLE [dbo].[TCPagosPlanes] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for TipoCuentaBanco
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TipoCuentaBanco]') AND type IN ('U'))
	DROP TABLE [dbo].[TipoCuentaBanco]
GO

CREATE TABLE [dbo].[TipoCuentaBanco] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [DESCRIPCION] char(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[TipoCuentaBanco] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for TiposComprobante
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TiposComprobante]') AND type IN ('U'))
	DROP TABLE [dbo].[TiposComprobante]
GO

CREATE TABLE [dbo].[TiposComprobante] (
  [CODIGOCOMPROBANTEAFIP] int  NOT NULL,
  [DESCRIPCION] char(250) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHADESDE] char(11) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAHASTA] char(11) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[TiposComprobante] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for TiposMovimientosCuentaBancos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TiposMovimientosCuentaBancos]') AND type IN ('U'))
	DROP TABLE [dbo].[TiposMovimientosCuentaBancos]
GO

CREATE TABLE [dbo].[TiposMovimientosCuentaBancos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CARGAPROVEEDOR] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDPROVEEDOR] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CATEGORIAOCULTA] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[TiposMovimientosCuentaBancos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Usuarios
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type IN ('U'))
	DROP TABLE [dbo].[Usuarios]
GO

CREATE TABLE [dbo].[Usuarios] (
  [CODIGO_USUARIO] smallint  NULL,
  [ID] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NOMBRE] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NIVEL] smallint  NULL,
  [CLAVE] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MODULOS] tinyint  NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDSUCURSALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Usuarios] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Vendedores
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendedores]') AND type IN ('U'))
	DROP TABLE [dbo].[Vendedores]
GO

CREATE TABLE [dbo].[Vendedores] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOVENDEDOR] int  NULL,
  [NOMBRE] char(40) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SALDO] decimal(11,2)  NULL,
  [ID] char(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SUCURSAL] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Vendedores] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Indexes structure for table Articulos
-- ----------------------------
CREATE NONCLUSTERED INDEX [ART_GUIDGRUPOSKEY]
ON [dbo].[Articulos] (
  [GUIDGRUPOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [ART_GUIDPROVEEDORESKEY]
ON [dbo].[Articulos] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [ART_CODIGOARTICULOKEY]
ON [dbo].[Articulos] (
  [CODIGOARTICULO] ASC
)
GO

CREATE NONCLUSTERED INDEX [ART_CODIGOARTICULORELKEY]
ON [dbo].[Articulos] (
  [CODIGOARTICULOREL] ASC
)
GO

CREATE NONCLUSTERED INDEX [ART_CODIGOORIGINALKEY]
ON [dbo].[Articulos] (
  [CODIGOORIGINAL] ASC
)
GO

CREATE NONCLUSTERED INDEX [ART_DESCRIPCIONKEY]
ON [dbo].[Articulos] (
  [DESCRIPCION] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Articulos
-- ----------------------------
ALTER TABLE [dbo].[Articulos] ADD CONSTRAINT [PK__Articulo__15B69B8EB2A494CB] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Auditoria
-- ----------------------------
ALTER TABLE [dbo].[Auditoria] ADD CONSTRAINT [PK__Auditori__15B69B8E58DDA5CE] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Bancos
-- ----------------------------
CREATE NONCLUSTERED INDEX [BAN_NOMBREBANCOKEY]
ON [dbo].[Bancos] (
  [BANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [BAN_TIPOCUENTAKEY]
ON [dbo].[Bancos] (
  [TIPOCUENTA] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Bancos
-- ----------------------------
ALTER TABLE [dbo].[Bancos] ADD CONSTRAINT [UQ__Bancos__55A059988BC45C0C] UNIQUE NONCLUSTERED ([CUENTANUMERO] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Bancos
-- ----------------------------
ALTER TABLE [dbo].[Bancos] ADD CONSTRAINT [PK__Bancos__15B69B8EC46E38F2] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table BancosConceptos
-- ----------------------------
CREATE NONCLUSTERED INDEX [BCO_CONCEPTOBANCOKEY]
ON [dbo].[BancosConceptos] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [BCO_GUIDPLANCUENTASKEY]
ON [dbo].[BancosConceptos] (
  [GUIDPLANCUENTAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [BCO_IDKEY]
ON [dbo].[BancosConceptos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table BancosConceptos
-- ----------------------------
ALTER TABLE [dbo].[BancosConceptos] ADD CONSTRAINT [PK__BancosCo__15B69B8EB434E3C9] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table BancosCuentas
-- ----------------------------
CREATE NONCLUSTERED INDEX [BCU_GUIDBANCOKEY]
ON [dbo].[BancosCuentas] (
  [GUIDBANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [BCU_GUIDTIPOCUENTABANCOKEY]
ON [dbo].[BancosCuentas] (
  [GUIDTIPOCUENTABANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [BCU_IDKEY]
ON [dbo].[BancosCuentas] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table BancosCuentas
-- ----------------------------
ALTER TABLE [dbo].[BancosCuentas] ADD CONSTRAINT [PK__BancosCu__15B69B8ED4436002] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table browseformats
-- ----------------------------
CREATE NONCLUSTERED INDEX [BRF_PROCEDIMIENTOKEY]
ON [dbo].[browseformats] (
  [PROCEDIMIENTO] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRF_GuidKey]
ON [dbo].[browseformats] (
  [GUID] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRF_UPDATEFORMKEY]
ON [dbo].[browseformats] (
  [UPDATEFORM] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRF_FINDKEY]
ON [dbo].[browseformats] (
  [PROCEDIMIENTO] ASC,
  [UPDATEFORM] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRF_DESCRIPTIONKEY]
ON [dbo].[browseformats] (
  [DESCRIPTION] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRF_TimeStampKey]
ON [dbo].[browseformats] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRF_ServerTimeStampKey]
ON [dbo].[browseformats] (
  [sts] ASC
)
GO


-- ----------------------------
-- Indexes structure for table browseformatsactions
-- ----------------------------
CREATE NONCLUSTERED INDEX [BRA_GuidKey]
ON [dbo].[browseformatsactions] (
  [GUID] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRA_TimeStampKey]
ON [dbo].[browseformatsactions] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [BRA_ServerTimeStampKey]
ON [dbo].[browseformatsactions] (
  [sts] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table browseformatsbuttons
-- ----------------------------
ALTER TABLE [dbo].[browseformatsbuttons] ADD CONSTRAINT [PK__browsefo__A2B5777CB83947E5] PRIMARY KEY CLUSTERED ([Guid])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table CajaDiaria
-- ----------------------------
CREATE NONCLUSTERED INDEX [CAJ_GUIDSUCURSALESKEY]
ON [dbo].[CajaDiaria] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_GUIDCAJAGASTOSKEY]
ON [dbo].[CajaDiaria] (
  [GUIDCAJAGASTOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_GUIDBANCOSKEY]
ON [dbo].[CajaDiaria] (
  [GUIDBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_GUIDCLIENTESKEY]
ON [dbo].[CajaDiaria] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_GUIDFOMAPAGOSKEY]
ON [dbo].[CajaDiaria] (
  [GUIDFORMAPAGOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_GUIDPROVEEDORESKEY]
ON [dbo].[CajaDiaria] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_GUIDEMPLEADOSKEY]
ON [dbo].[CajaDiaria] (
  [GUIDEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAJ_FECHAKEY]
ON [dbo].[CajaDiaria] (
  [FECHA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table CajaDiaria
-- ----------------------------
ALTER TABLE [dbo].[CajaDiaria] ADD CONSTRAINT [PK__CajaDiar__15B69B8EC24F638B] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table CajaGastos
-- ----------------------------
CREATE NONCLUSTERED INDEX [CJG_GUIDSUCURSALESKEY]
ON [dbo].[CajaGastos] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [CJG_GUIDBANCOSKEY]
ON [dbo].[CajaGastos] (
  [GUIDBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CJG_GUIDIMPUTACIONKEY]
ON [dbo].[CajaGastos] (
  [GUIDIMPUTACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [CJG_COMPROBANTE_KEY]
ON [dbo].[CajaGastos] (
  [TIPO_COMPROBANTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [CJG_RUBRO_KEY]
ON [dbo].[CajaGastos] (
  [RUBRO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CJG_FECHA_KEY]
ON [dbo].[CajaGastos] (
  [FECHA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table CajaGastos
-- ----------------------------
ALTER TABLE [dbo].[CajaGastos] ADD CONSTRAINT [PK__CajaGast__15B69B8E6346B598] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Clientes
-- ----------------------------
CREATE NONCLUSTERED INDEX [CLI_DOCUMENTO_KEY]
ON [dbo].[Clientes] (
  [DOCUMENTO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_CLIENTE_KEY]
ON [dbo].[Clientes] (
  [CODIGO_CLIENTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_FECHAALTA_KEY]
ON [dbo].[Clientes] (
  [FECHA_ALTA] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_CUENTA_KEY]
ON [dbo].[Clientes] (
  [CUENTA] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_NOMBREEMPRESA_KEY]
ON [dbo].[Clientes] (
  [NOMBRE_EMPRESA] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_CLIENTEEMPRESA_KEY]
ON [dbo].[Clientes] (
  [CLIENTE_EMPRESA] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_CEMPRESA_KEY]
ON [dbo].[Clientes] (
  [CODIGO_VENDEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_NOMBRE_KEY]
ON [dbo].[Clientes] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [CLI_FIND_KEY]
ON [dbo].[Clientes] (
  [CLIENTE_EMPRESA] ASC,
  [NOMBRE] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Clientes
-- ----------------------------
ALTER TABLE [dbo].[Clientes] ADD CONSTRAINT [PK__Clientes__15B69B8E2BB1FB68] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table ColaImpresion
-- ----------------------------
CREATE NONCLUSTERED INDEX [COL_GUIDREMITOSKEY]
ON [dbo].[ColaImpresion] (
  [GUIDREMITOS] ASC
)
GO

CREATE UNIQUE NONCLUSTERED INDEX [COL_GUIDKEY]
ON [dbo].[ColaImpresion] (
  [GUID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table ColaImpresion
-- ----------------------------
ALTER TABLE [dbo].[ColaImpresion] ADD CONSTRAINT [PK__ColaImpr__15B69B8E67081918] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Comprobantes
-- ----------------------------
CREATE NONCLUSTERED INDEX [COM_CLAVEIDCOMP]
ON [dbo].[Comprobantes] (
  [IDCOMP] ASC
)
GO

CREATE NONCLUSTERED INDEX [COM_GUIDCONFIGURACIONKEY]
ON [dbo].[Comprobantes] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [COM_VENDEDOR_KEY]
ON [dbo].[Comprobantes] (
  [CODIGO_VENDEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [COM_CONFIGURACION_KEY]
ON [dbo].[Comprobantes] (
  [CODIGO_CONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [COM_CODIGOAFIP_KEY]
ON [dbo].[Comprobantes] (
  [COAFIP] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Comprobantes
-- ----------------------------
ALTER TABLE [dbo].[Comprobantes] ADD CONSTRAINT [UQ__Comproba__18FB5469E1E2D866] UNIQUE NONCLUSTERED ([CODIGO_CONFIGURACION] ASC, [COAFIP] ASC, [PUNTOVENTA] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Comprobantes
-- ----------------------------
ALTER TABLE [dbo].[Comprobantes] ADD CONSTRAINT [PK__Comproba__15B69B8E7DE50DCA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table ComprobantesOrdenDePago
-- ----------------------------
CREATE NONCLUSTERED INDEX [COP_GUIDFACTURASCOMPRASKEY]
ON [dbo].[ComprobantesOrdenDePago] (
  [GUIDFACTURASCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [COP_GUIDORDENESDEPAGOKEY]
ON [dbo].[ComprobantesOrdenDePago] (
  [GUIDORDENESDEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [COP_IDKEY]
ON [dbo].[ComprobantesOrdenDePago] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table ComprobantesOrdenDePago
-- ----------------------------
ALTER TABLE [dbo].[ComprobantesOrdenDePago] ADD CONSTRAINT [PK__Comproba__15B69B8E62787FC3] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table ComprobantesXRecibos
-- ----------------------------
CREATE NONCLUSTERED INDEX [CXR_GUIDCOMPROBANTESORDENDEPAGOKEY]
ON [dbo].[ComprobantesXRecibos] (
  [GUIDCOMPROBANTESORDENDEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CXR_GUIDORDENESDEPAGOKEY]
ON [dbo].[ComprobantesXRecibos] (
  [GUIDORDENESDEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CXR_GUIDRECIBOSKEY]
ON [dbo].[ComprobantesXRecibos] (
  [GUIDRECIBOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CXR_IDKEY]
ON [dbo].[ComprobantesXRecibos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table ComprobantesXRecibos
-- ----------------------------
ALTER TABLE [dbo].[ComprobantesXRecibos] ADD CONSTRAINT [PK__Comproba__15B69B8E665D0A5C] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table ConceptosPorBanco
-- ----------------------------
CREATE NONCLUSTERED INDEX [CPB_GUIDBANCOKEY]
ON [dbo].[ConceptosPorBanco] (
  [GUIDBANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CPB_GUIDCONCEPTOBANCOKEY]
ON [dbo].[ConceptosPorBanco] (
  [GUIDCONCEPTOBANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CPB_IDKEY]
ON [dbo].[ConceptosPorBanco] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table ConceptosPorBanco
-- ----------------------------
ALTER TABLE [dbo].[ConceptosPorBanco] ADD CONSTRAINT [PK__Concepto__15B69B8EBDC68CAA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Configuracion
-- ----------------------------
CREATE NONCLUSTERED INDEX [CNF_CONFIGURACION_KEY]
ON [dbo].[Configuracion] (
  [CODIGO_CONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNF_EMPRESA_KEY]
ON [dbo].[Configuracion] (
  [EMPRESA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Configuracion
-- ----------------------------
ALTER TABLE [dbo].[Configuracion] ADD CONSTRAINT [PK__Configur__15B69B8EECD0EBC5] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table DBFST
-- ----------------------------
CREATE NONCLUSTERED INDEX [SQS_CAN]
ON [dbo].[DBFST] (
  [CODP] ASC,
  [CODA] ASC,
  [NRO] ASC
)
GO

CREATE NONCLUSTERED INDEX [rel]
ON [dbo].[DBFST] (
  [REL] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table DBFST
-- ----------------------------
ALTER TABLE [dbo].[DBFST] ADD CONSTRAINT [PK__DBFST__15B69B8E89B118C0] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table DetAudit
-- ----------------------------
ALTER TABLE [dbo].[DetAudit] ADD CONSTRAINT [PK__DetAudit__15B69B8EEEC1D43A] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Facturas
-- ----------------------------
CREATE NONCLUSTERED INDEX [FAC_TimeStampKey]
ON [dbo].[Facturas] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_ServerTimeStampKey]
ON [dbo].[Facturas] (
  [sts] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_GUIDCLIENTESKEY]
ON [dbo].[Facturas] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_GUIDCONFIGURACIONKEY]
ON [dbo].[Facturas] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_IMPUTACION_KEY]
ON [dbo].[Facturas] (
  [CODIGO_IMPUTACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_CONFIGURACION_KEY]
ON [dbo].[Facturas] (
  [CODIGO_CONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_DOCUMENTOAFIP_KEY]
ON [dbo].[Facturas] (
  [CODIGO_DOCUMENTO_AFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_CONCEPTOAFIP_KEY]
ON [dbo].[Facturas] (
  [CODIGO_CONCEPTO_AFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_VENDEDOR_KEY]
ON [dbo].[Facturas] (
  [CODIGO_VENDEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_FIND_KEY]
ON [dbo].[Facturas] (
  [TIPO_COMPROBANTE] ASC,
  [TIPO_FACTURA] ASC,
  [PUNTOVENTA] ASC,
  [NUMERO] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_PENDIENTE_KEY]
ON [dbo].[Facturas] (
  [PENDIENTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_FACTURANUMERO_KEY]
ON [dbo].[Facturas] (
  [NUMERO_FACTURA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_REMITO_KEY]
ON [dbo].[Facturas] (
  [CODIGO_REMITO] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_FECHA_KEY]
ON [dbo].[Facturas] (
  [FECHA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_NOMBRE_KEY]
ON [dbo].[Facturas] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_FACTURATIPO_KEY]
ON [dbo].[Facturas] (
  [TIPO_FACTURA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_IDCOMP_KEY]
ON [dbo].[Facturas] (
  [IDCOMP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FAC_CLIENTE_KEY]
ON [dbo].[Facturas] (
  [CODIGO_CLIENTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_CONCEPTOAFIP_KEY]
ON [dbo].[Facturas] (
  [CODIGO_CONCEPTO_AFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_CONFIGURACION_KEY]
ON [dbo].[Facturas] (
  [CODIGO_CONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_DOCUMENTOAFIP_KEY]
ON [dbo].[Facturas] (
  [CODIGO_DOCUMENTO_AFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_FACTURANUMERO_KEY]
ON [dbo].[Facturas] (
  [NUMERO_FACTURA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_FACTURATIPO_KEY]
ON [dbo].[Facturas] (
  [TIPO_FACTURA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_FECHA_KEY]
ON [dbo].[Facturas] (
  [FECHA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_FIND_KEY]
ON [dbo].[Facturas] (
  [TIPO_COMPROBANTE] ASC,
  [TIPO_FACTURA] ASC,
  [PUNTOVENTA] ASC,
  [NUMERO] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_GUIDCLIENTESKEY]
ON [dbo].[Facturas] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_GUIDCONFIGURACIONKEY]
ON [dbo].[Facturas] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_IDCOMP_KEY]
ON [dbo].[Facturas] (
  [IDCOMP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_IMPUTACION_KEY]
ON [dbo].[Facturas] (
  [CODIGO_IMPUTACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_NOMBRE_KEY]
ON [dbo].[Facturas] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_PENDIENTE_KEY]
ON [dbo].[Facturas] (
  [PENDIENTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FACALIAS_VENDEDOR_KEY]
ON [dbo].[Facturas] (
  [CODIGO_VENDEDOR] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Facturas
-- ----------------------------
ALTER TABLE [dbo].[Facturas] ADD CONSTRAINT [UQ__Facturas__15B69B8F7B67DC8A] UNIQUE NONCLUSTERED ([GUID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Facturas
-- ----------------------------
ALTER TABLE [dbo].[Facturas] ADD CONSTRAINT [PK__Facturas__73C59E9F678A7DAD] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table FacturasCompras
-- ----------------------------
CREATE NONCLUSTERED INDEX [FCM_GUIDIMPUTACIONESKEY]
ON [dbo].[FacturasCompras] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDCONFIGURACIONKEY]
ON [dbo].[FacturasCompras] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDPROVEEDORESKEY]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDREMITOSCOMPRASKEY]
ON [dbo].[FacturasCompras] (
  [GUIDREMITOSCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_CODIGOCOMPROBANTEAFIPKEY]
ON [dbo].[FacturasCompras] (
  [CODIGOCOMPROBANTEAFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_FECHACARGA_KEY]
ON [dbo].[FacturasCompras] (
  [FECHACARGA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_COMPROBANTE_KEY]
ON [dbo].[FacturasCompras] (
  [TIPOCOMPROBANTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_NUMERO_KEY]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC,
  [REMITONUMERO] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_FECHA_KEY]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC,
  [FECHA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_PROVEEDOR_KEY]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_CONFIGURACION_KEY]
ON [dbo].[FacturasCompras] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_CODIGOCOMPROBANTEAFIPKEY_copy1]
ON [dbo].[FacturasCompras] (
  [CODIGOCOMPROBANTEAFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_COMPROBANTE_KEY_copy1]
ON [dbo].[FacturasCompras] (
  [TIPOCOMPROBANTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_CONFIGURACION_KEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_FECHACARGA_KEY_copy1]
ON [dbo].[FacturasCompras] (
  [FECHACARGA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDCONFIGURACIONKEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDIMPUTACIONESKEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDPROVEEDORESKEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_GUIDREMITOSCOMPRASKEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDREMITOSCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_NUMERO_KEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FCM_PROVEEDOR_KEY_copy1]
ON [dbo].[FacturasCompras] (
  [GUIDPROVEEDORES] ASC
)
GO


-- ----------------------------
-- Uniques structure for table FacturasCompras
-- ----------------------------
ALTER TABLE [dbo].[FacturasCompras] ADD CONSTRAINT [UQ__Facturas__ABF5154AFDD8A579] UNIQUE NONCLUSTERED ([GUIDCONFIGURACION] ASC, [GUIDPROVEEDORES] ASC, [PUNTOVENTA] ASC, [NUMERO] ASC, [TIPOCOMPROBANTE] ASC, [LETRA] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table FacturasCompras
-- ----------------------------
ALTER TABLE [dbo].[FacturasCompras] ADD CONSTRAINT [PK__Facturas__15B69B8E81DFE807] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table FormaPagos
-- ----------------------------
CREATE NONCLUSTERED INDEX [FOR_GUIDREMITOSKEY]
ON [dbo].[FormaPagos] (
  [GUIDREMITOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_GUIDFACTURASKEY]
ON [dbo].[FormaPagos] (
  [GUIDFACTURAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_GUIDCLIENTESKEY]
ON [dbo].[FormaPagos] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_GUIDCAJADIARIAKEY]
ON [dbo].[FormaPagos] (
  [GUIDCAJADIARIA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_GUIDBANCOSKEY]
ON [dbo].[FormaPagos] (
  [GUIDBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_GUIDMOVIMIENTOBANCOSKEY]
ON [dbo].[FormaPagos] (
  [GUIDMOVIMIENTOBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_FECHAKEY]
ON [dbo].[FormaPagos] (
  [FECHA] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_TIPOCOMPROBANTE_KEY]
ON [dbo].[FormaPagos] (
  [TIPOCOMPROBANTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [FOR_FINDKEY]
ON [dbo].[FormaPagos] (
  [TIPOCOMPROBANTE] ASC,
  [FECHA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table FormaPagos
-- ----------------------------
ALTER TABLE [dbo].[FormaPagos] ADD CONSTRAINT [PK__FormaPag__15B69B8ECBF450E2] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table ImputacionesPlanCuentas
-- ----------------------------
CREATE NONCLUSTERED INDEX [IMP_DESCRIPCIONKEY]
ON [dbo].[ImputacionesPlanCuentas] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [IMP_PLANCUENTASKEY]
ON [dbo].[ImputacionesPlanCuentas] (
  [GUIDPLANCUENTAS] ASC
)
GO


-- ----------------------------
-- Uniques structure for table ImputacionesPlanCuentas
-- ----------------------------
ALTER TABLE [dbo].[ImputacionesPlanCuentas] ADD CONSTRAINT [UQ__Imputaci__3214EC261EED93C9] UNIQUE NONCLUSTERED ([ID] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table ImputacionesPlanCuentas
-- ----------------------------
ALTER TABLE [dbo].[ImputacionesPlanCuentas] ADD CONSTRAINT [PK__Imputaci__15B69B8EBFE7E5FE] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Jurisdicciones
-- ----------------------------
CREATE NONCLUSTERED INDEX [JUR_IDKEY]
ON [dbo].[Jurisdicciones] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [JUR_PROVINCIAKEY]
ON [dbo].[Jurisdicciones] (
  [PROVINCIA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Jurisdicciones
-- ----------------------------
ALTER TABLE [dbo].[Jurisdicciones] ADD CONSTRAINT [PK__Jurisdic__15B69B8E40746355] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table LibroCheques
-- ----------------------------
CREATE NONCLUSTERED INDEX [LIC_CUENTAKEY]
ON [dbo].[LibroCheques] (
  [CUENTANUMERO] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_ESTADOKEY]
ON [dbo].[LibroCheques] (
  [ESTADO] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_FECHACOBROKEY]
ON [dbo].[LibroCheques] (
  [FECHACOBRO] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_GASTOSKEY]
ON [dbo].[LibroCheques] (
  [GUIDGASTOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_GUIDCONFIGURACIONKEY]
ON [dbo].[LibroCheques] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_GUIDORIGENFONDOSCHEQUESKEY]
ON [dbo].[LibroCheques] (
  [GUIDORIGENFONDOSCHEQUES] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_GUIDPROVEEDORKEY]
ON [dbo].[LibroCheques] (
  [GUIDPROVEEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_IDKEY]
ON [dbo].[LibroCheques] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_NUMEROCHEQUEKEY]
ON [dbo].[LibroCheques] (
  [NUMEROCHEQUE] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_PAGOKEY]
ON [dbo].[LibroCheques] (
  [GUIDFORMAPAGO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table LibroCheques
-- ----------------------------
ALTER TABLE [dbo].[LibroCheques] ADD CONSTRAINT [PK__LibroChe__15B69B8E7AD09FA3] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Liquidaciones
-- ----------------------------
CREATE NONCLUSTERED INDEX [LIQ_GUIDCONFIGURACIONKEY]
ON [dbo].[Liquidaciones] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIQ_GUIDPROVEEDORKEY]
ON [dbo].[Liquidaciones] (
  [GUIDPROVEEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIQ_IDKEY]
ON [dbo].[Liquidaciones] (
  [ID] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Liquidaciones
-- ----------------------------
ALTER TABLE [dbo].[Liquidaciones] ADD CONSTRAINT [UQ__Liquidac__8EC03F1E39FAA7A5] UNIQUE NONCLUSTERED ([NROLIQUIDACION] ASC, [GUIDPROVEEDOR] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Liquidaciones
-- ----------------------------
ALTER TABLE [dbo].[Liquidaciones] ADD CONSTRAINT [PK__Liquidac__15B69B8ED09F6FE3] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Modulos_Usuarios
-- ----------------------------
CREATE NONCLUSTERED INDEX [MDS_MODULO_KEY]
ON [dbo].[Modulos_Usuarios] (
  [CODIGO_MODULO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MDS_GUIDUSUARIOSKEY]
ON [dbo].[Modulos_Usuarios] (
  [GUIDUSUARIOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MDS_USUARIO_KEY]
ON [dbo].[Modulos_Usuarios] (
  [CODIGO_USUARIO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MDS_NOMBREMODULO_KEY]
ON [dbo].[Modulos_Usuarios] (
  [MODULO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MDS_MODULOINTERNO_KEY]
ON [dbo].[Modulos_Usuarios] (
  [MODULO_INTERNO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Modulos_Usuarios
-- ----------------------------
ALTER TABLE [dbo].[Modulos_Usuarios] ADD CONSTRAINT [PK__Modulos___15B69B8E9147828A] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientoArticulos
-- ----------------------------
CREATE NONCLUSTERED INDEX [MMA_GUIDARTICULOSKEY]
ON [dbo].[MovimientoArticulos] (
  [GUIDARTICULOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVA_FindKey]
ON [dbo].[MovimientoArticulos] (
  [CODIGOARTICULO] ASC,
  [NUMERO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientoArticulos
-- ----------------------------
ALTER TABLE [dbo].[MovimientoArticulos] ADD CONSTRAINT [PK__Movimien__15B69B8E72952B42] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientoClientes
-- ----------------------------
CREATE NONCLUSTERED INDEX [MVC_GUIDCLIENTESKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_GUIDARTICULOSKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDARTICULOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_GUIDREMITOSKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDREMITOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_GUIDFORMAPAGOSKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDFORMAPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_GUIDCAJADIARIAKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDCAJADIARIA] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_GUIDBANCOSKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_GUIDMOVIMIENTOBANCOSKEY]
ON [dbo].[MovimientoClientes] (
  [GUIDMOVIMIENTOBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_ARTICULOKEY]
ON [dbo].[MovimientoClientes] (
  [ARTICULO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVC_FECHA_KEY]
ON [dbo].[MovimientoClientes] (
  [FECHA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientoClientes
-- ----------------------------
ALTER TABLE [dbo].[MovimientoClientes] ADD CONSTRAINT [PK__Movimien__15B69B8E23D3E321] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientoFactuas
-- ----------------------------
CREATE NONCLUSTERED INDEX [MVF_GUIDFACTURASKEY]
ON [dbo].[MovimientoFactuas] (
  [GUIDFACTURAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVF_FACTURA_KEY]
ON [dbo].[MovimientoFactuas] (
  [CODIGO_FACTURA] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVF_SERVICIO_KEY]
ON [dbo].[MovimientoFactuas] (
  [SERVICIO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVF_ARTICULO_KEY]
ON [dbo].[MovimientoFactuas] (
  [ARTICULO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientoFactuas
-- ----------------------------
ALTER TABLE [dbo].[MovimientoFactuas] ADD CONSTRAINT [PK__Movimien__15B69B8E8EEF6BA3] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientoRemitos
-- ----------------------------
CREATE NONCLUSTERED INDEX [MVRALIAS_GUIDREMITOSKEY]
ON [dbo].[MovimientoRemitos] (
  [GUIDREMITOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVRALIAS_GUIDCLIENTESKEY]
ON [dbo].[MovimientoRemitos] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVRALIAS_GUIDREMITOKEY]
ON [dbo].[MovimientoRemitos] (
  [GUIDREMITOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVRALIAS_GUIDSUCURSALESKEY]
ON [dbo].[MovimientoRemitos] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVRALIAS_ARTICULO_KEY]
ON [dbo].[MovimientoRemitos] (
  [ARTICULO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVR_TimeStampKey]
ON [dbo].[MovimientoRemitos] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVR_ServerTimeStampKey]
ON [dbo].[MovimientoRemitos] (
  [sts] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientoRemitos
-- ----------------------------
ALTER TABLE [dbo].[MovimientoRemitos] ADD CONSTRAINT [PK__Movimien__15B69B8E71E6028C] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientosCheques
-- ----------------------------
CREATE NONCLUSTERED INDEX [MC_ENTIDADKEY]
ON [dbo].[MovimientosCheques] (
  [ENTIDAD] ASC
)
GO

CREATE NONCLUSTERED INDEX [MC_GUIDLIBROCHEQUEKEY]
ON [dbo].[MovimientosCheques] (
  [GUIDLIBROCHEQUE] ASC
)
GO

CREATE NONCLUSTERED INDEX [MC_GUIDRELACIONKEY]
ON [dbo].[MovimientosCheques] (
  [GUIDRELACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [MC_IDKEY]
ON [dbo].[MovimientosCheques] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientosCheques
-- ----------------------------
ALTER TABLE [dbo].[MovimientosCheques] ADD CONSTRAINT [PK__Movimien__15B69B8EF4689FC8] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientosCuentaBancos
-- ----------------------------
CREATE NONCLUSTERED INDEX [MCB_GUIDBANCOKEY]
ON [dbo].[MovimientosCuentaBancos] (
  [GUIDBANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MCB_GUIDCONCEPTOBANCOKEY]
ON [dbo].[MovimientosCuentaBancos] (
  [GUIDCONCEPTOBANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MCB_IDKEY]
ON [dbo].[MovimientosCuentaBancos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientosCuentaBancos
-- ----------------------------
ALTER TABLE [dbo].[MovimientosCuentaBancos] ADD CONSTRAINT [PK__Movimien__15B69B8E58C9BDF8] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table MovimientoStock
-- ----------------------------
CREATE NONCLUSTERED INDEX [MVS_GUIDREMITOSKEY]
ON [dbo].[MovimientoStock] (
  [GUIDREMITOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GUIDARTICULOSKEY]
ON [dbo].[MovimientoStock] (
  [GUIDARTICULOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GUIDMOVIMIENTOARTICULOSKEY]
ON [dbo].[MovimientoStock] (
  [GUIDMOVIMIENTOARTICULOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GUIDSUCURSALORIGENKEY]
ON [dbo].[MovimientoStock] (
  [GUIDSUCURSALORIGEN] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GUIDSUCURSALDESTINOKEY]
ON [dbo].[MovimientoStock] (
  [GUIDSUCURSALDESTINO] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GuidRemitosComprasKey]
ON [dbo].[MovimientoStock] (
  [GUIDREMITOSCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GuidRemitosDevolucionesKey]
ON [dbo].[MovimientoStock] (
  [GUIDREMITOSDEVOLUCIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GuidRemitosTransferenciasKey]
ON [dbo].[MovimientoStock] (
  [GUIDREMITOSTRANSFERENCIAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_GuidRemitosCambiosKey]
ON [dbo].[MovimientoStock] (
  [GUIDREMITOSCAMBIOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_TimeStampKey]
ON [dbo].[MovimientoStock] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [MVS_ServerTimeStampKey]
ON [dbo].[MovimientoStock] (
  [sts] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table MovimientoStock
-- ----------------------------
ALTER TABLE [dbo].[MovimientoStock] ADD CONSTRAINT [PK__Movimien__15B69B8E566DBB5C] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table OrdenesDePago
-- ----------------------------
CREATE NONCLUSTERED INDEX [ODP_GUIDPROVEEDORESKEY]
ON [dbo].[OrdenesDePago] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [ODP_IDKEY]
ON [dbo].[OrdenesDePago] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table OrdenesDePago
-- ----------------------------
ALTER TABLE [dbo].[OrdenesDePago] ADD CONSTRAINT [PK__OrdenesD__15B69B8EFB80B585] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table OrigenFondosCheques
-- ----------------------------
CREATE NONCLUSTERED INDEX [OFC_DESCRIPCIONKEY]
ON [dbo].[OrigenFondosCheques] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [OFC_IDKEY]
ON [dbo].[OrigenFondosCheques] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table OrigenFondosCheques
-- ----------------------------
ALTER TABLE [dbo].[OrigenFondosCheques] ADD CONSTRAINT [PK__OrigenFo__15B69B8E40D30D4D] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table PagosRecibos
-- ----------------------------
CREATE NONCLUSTERED INDEX [PREC_GUIDBANCOSCUENTASKEY]
ON [dbo].[PagosRecibos] (
  [GUIDBANCOSCUENTAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [PREC_GUIDRECIBOSKEY]
ON [dbo].[PagosRecibos] (
  [GUIDRECIBOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [PREC_IDKEY]
ON [dbo].[PagosRecibos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table PagosRecibos
-- ----------------------------
ALTER TABLE [dbo].[PagosRecibos] ADD CONSTRAINT [PK__PagosRec__15B69B8E8D5308DB] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table PlanCuentas
-- ----------------------------
CREATE NONCLUSTERED INDEX [PLA_ETIQUETAKEY]
ON [dbo].[PlanCuentas] (
  [ETIQUETA] ASC
)
GO

CREATE NONCLUSTERED INDEX [PLA_IDKEY]
ON [dbo].[PlanCuentas] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table PlanCuentas
-- ----------------------------
ALTER TABLE [dbo].[PlanCuentas] ADD CONSTRAINT [PK__PlanCuen__15B69B8ED092DCF4] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Proveedores
-- ----------------------------
CREATE NONCLUSTERED INDEX [PRO_IDKEY]
ON [dbo].[Proveedores] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_GUIDIMPUTACIONESKEY]
ON [dbo].[Proveedores] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_GUIDCONFIGURACIONKEY]
ON [dbo].[Proveedores] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_NOMBRE_KEY]
ON [dbo].[Proveedores] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_RUBRO_KEY]
ON [dbo].[Proveedores] (
  [RUBRO] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Proveedores
-- ----------------------------
ALTER TABLE [dbo].[Proveedores] ADD CONSTRAINT [UQ__Proveedo__9AF05AD6B8A4E7E6] UNIQUE NONCLUSTERED ([GUID] ASC, [CUIT] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Proveedores
-- ----------------------------
ALTER TABLE [dbo].[Proveedores] ADD CONSTRAINT [PK__Proveedo__15B69B8E9D97B2EF] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Recibos
-- ----------------------------
CREATE NONCLUSTERED INDEX [REC_GUIDORDENESDEPAGOKEY]
ON [dbo].[Recibos] (
  [GUIDORDENESDEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [REC_GUIDPROVEEDORESKEY]
ON [dbo].[Recibos] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [REC_IDKEY]
ON [dbo].[Recibos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Recibos
-- ----------------------------
ALTER TABLE [dbo].[Recibos] ADD CONSTRAINT [PK__Recibos__15B69B8E941ABE7E] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Remitos
-- ----------------------------
CREATE NONCLUSTERED INDEX [REM_GUIDVENDEDORESKEY]
ON [dbo].[Remitos] (
  [GUIDVENDEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_GUIDCLIENTESKEY]
ON [dbo].[Remitos] (
  [GUIDCLIENTES] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_GUIDSUCURSALESKEY]
ON [dbo].[Remitos] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_GUIDFACTURASKEY]
ON [dbo].[Remitos] (
  [GUIDFACTURAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_COMPROBANTE_KEY]
ON [dbo].[Remitos] (
  [TIPO_COMPROBANTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_FECHA_KEY]
ON [dbo].[Remitos] (
  [FECHA] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_NOMBRE_KEY]
ON [dbo].[Remitos] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_TimeStampKey]
ON [dbo].[Remitos] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [REM_ServerTimeStampKey]
ON [dbo].[Remitos] (
  [sts] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Remitos
-- ----------------------------
ALTER TABLE [dbo].[Remitos] ADD CONSTRAINT [PK__Remitos__15B69B8EEBA629FA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table RemitosCompras
-- ----------------------------
CREATE NONCLUSTERED INDEX [RMP_GUIDIMPUTACIONESKEY]
ON [dbo].[RemitosCompras] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_GUIDCONFIGURACIONKEY]
ON [dbo].[RemitosCompras] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_GUIDPROVEEDORESKEY]
ON [dbo].[RemitosCompras] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_GUIDFACTURASCOMPRASKEY]
ON [dbo].[RemitosCompras] (
  [GUIDFACTURASCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_GUIDVENDEDORESKEY]
ON [dbo].[RemitosCompras] (
  [GUIDVENDEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_GUIDSUCURSALESKEY]
ON [dbo].[RemitosCompras] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_CODIGOCOMPROBANTEAFIPKEY]
ON [dbo].[RemitosCompras] (
  [CODIGOCOMPROBANTEAFIP] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_FECHACARGA_KEY]
ON [dbo].[RemitosCompras] (
  [FECHACARGA] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_COMPROBANTE_KEY]
ON [dbo].[RemitosCompras] (
  [TIPOCOMPROBANTE] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_NUMERO_KEY]
ON [dbo].[RemitosCompras] (
  [GUIDPROVEEDORES] ASC,
  [REMITONUMERO] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_FECHA_KEY]
ON [dbo].[RemitosCompras] (
  [GUIDPROVEEDORES] ASC,
  [FECHA] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_PROVEEDOR_KEY]
ON [dbo].[RemitosCompras] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [RMP_CONFIGURACION_KEY]
ON [dbo].[RemitosCompras] (
  [GUIDCONFIGURACION] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table RemitosCompras
-- ----------------------------
ALTER TABLE [dbo].[RemitosCompras] ADD CONSTRAINT [PK__RemitosC__15B69B8E9BF77C51] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table ReporteZ
-- ----------------------------
CREATE NONCLUSTERED INDEX [RPZ_FECHA_KEY]
ON [dbo].[ReporteZ] (
  [FECHA] ASC
)
GO


-- ----------------------------
-- Uniques structure for table ReporteZ
-- ----------------------------
ALTER TABLE [dbo].[ReporteZ] ADD CONSTRAINT [UQ__ReporteZ__E2F692DBD4FE41D2] UNIQUE NONCLUSTERED ([NROZ] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table ReporteZ
-- ----------------------------
ALTER TABLE [dbo].[ReporteZ] ADD CONSTRAINT [PK__ReporteZ__15B69B8EC2DC1F31] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Auto increment value for SliderImages
-- ----------------------------
DBCC CHECKIDENT ('[dbo].[SliderImages]', RESEED, 1001)
GO


-- ----------------------------
-- Primary Key structure for table SliderImages
-- ----------------------------
ALTER TABLE [dbo].[SliderImages] ADD CONSTRAINT [PK__SliderIm__3214EC077D79D9BF] PRIMARY KEY CLUSTERED ([Id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Sucursales
-- ----------------------------
CREATE NONCLUSTERED INDEX [SUC_TimeStampKey]
ON [dbo].[Sucursales] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [SUC_ServerTimeStampKey]
ON [dbo].[Sucursales] (
  [sts] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Sucursales
-- ----------------------------
ALTER TABLE [dbo].[Sucursales] ADD CONSTRAINT [UQ__Sucursal__2A97C66BB82806F8] UNIQUE NONCLUSTERED ([CODIGOSUCURSAL] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO

ALTER TABLE [dbo].[Sucursales] ADD CONSTRAINT [UQ__Sucursal__B21D0AB946DCCA25] UNIQUE NONCLUSTERED ([NOMBRE] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Sucursales
-- ----------------------------
ALTER TABLE [dbo].[Sucursales] ADD CONSTRAINT [PK__Sucursal__15B69B8EFCA2839F] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table TCPagos
-- ----------------------------
CREATE NONCLUSTERED INDEX [TCP_GUIDFORMA_PAGOKEY]
ON [dbo].[TCPagos] (
  [GUIDFORMAPAGOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [TCP_TimeStampKEY]
ON [dbo].[TCPagos] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [TCP_ServerTimeStampKEY]
ON [dbo].[TCPagos] (
  [sts] ASC
)
GO

CREATE NONCLUSTERED INDEX [TCP_DeletedTimeStampKEY]
ON [dbo].[TCPagos] (
  [dts] ASC
)
GO

CREATE UNIQUE NONCLUSTERED INDEX [TCP_GUIDKEY]
ON [dbo].[TCPagos] (
  [GUID] ASC
)
GO


-- ----------------------------
-- Uniques structure for table TCPagos
-- ----------------------------
ALTER TABLE [dbo].[TCPagos] ADD CONSTRAINT [UQ__TCPagos__0FA19C51DA1B919A] UNIQUE NONCLUSTERED ([CODIGO_TCP] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO

ALTER TABLE [dbo].[TCPagos] ADD CONSTRAINT [UQ__TCPagos__975031918CCAF877] UNIQUE NONCLUSTERED ([TIPO_COMPROBANTE] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table TCPagos
-- ----------------------------
ALTER TABLE [dbo].[TCPagos] ADD CONSTRAINT [PK__TCPagos__15B69B8E03A206C3] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table TCPagosPlanes
-- ----------------------------
CREATE NONCLUSTERED INDEX [TPP_GUIDTCPAGOSKEY]
ON [dbo].[TCPagosPlanes] (
  [GUIDTCPAGOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPP_TimeStampKEY]
ON [dbo].[TCPagosPlanes] (
  [ts] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPP_ServerTimeStampKEY]
ON [dbo].[TCPagosPlanes] (
  [sts] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPP_DeletedTimeStampKEY]
ON [dbo].[TCPagosPlanes] (
  [dts] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPP_TIPOCOMPROBANTE_KEY]
ON [dbo].[TCPagosPlanes] (
  [NOMBRECOMPROBANTEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPP_TCP_KEY]
ON [dbo].[TCPagosPlanes] (
  [CODIGO_TCP] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table TCPagosPlanes
-- ----------------------------
ALTER TABLE [dbo].[TCPagosPlanes] ADD CONSTRAINT [PK__TCPPlane__15B69B8EC84D59C9] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table TipoCuentaBanco
-- ----------------------------
CREATE NONCLUSTERED INDEX [TCB_DESCRIPCIONKEY]
ON [dbo].[TipoCuentaBanco] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [TCB_IDKEY]
ON [dbo].[TipoCuentaBanco] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table TipoCuentaBanco
-- ----------------------------
ALTER TABLE [dbo].[TipoCuentaBanco] ADD CONSTRAINT [PK__TipoCuen__15B69B8E0F87A9F0] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table TiposComprobante
-- ----------------------------
CREATE NONCLUSTERED INDEX [TPC_DESCRIPCIONKEY]
ON [dbo].[TiposComprobante] (
  [DESCRIPCION] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table TiposComprobante
-- ----------------------------
ALTER TABLE [dbo].[TiposComprobante] ADD CONSTRAINT [PK__TiposCom__16041FBBDA404997] PRIMARY KEY CLUSTERED ([CODIGOCOMPROBANTEAFIP])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table TiposMovimientosCuentaBancos
-- ----------------------------
CREATE NONCLUSTERED INDEX [TPM_DESCRIPCIONKEY]
ON [dbo].[TiposMovimientosCuentaBancos] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPM_GUIDCONFIGURACIONKEY]
ON [dbo].[TiposMovimientosCuentaBancos] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPM_GUIDPROVEEDORKEY]
ON [dbo].[TiposMovimientosCuentaBancos] (
  [GUIDPROVEEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [TPM_IDKEY]
ON [dbo].[TiposMovimientosCuentaBancos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table TiposMovimientosCuentaBancos
-- ----------------------------
ALTER TABLE [dbo].[TiposMovimientosCuentaBancos] ADD CONSTRAINT [PK__TiposMov__15B69B8E93954135] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Usuarios
-- ----------------------------
CREATE NONCLUSTERED INDEX [USU_GUIDBANCOSKEY]
ON [dbo].[Usuarios] (
  [GUIDBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [USU_GUIDSUCURSALESKEY]
ON [dbo].[Usuarios] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [USU_USUARIO_KEY]
ON [dbo].[Usuarios] (
  [CODIGO_USUARIO] ASC
)
GO

CREATE NONCLUSTERED INDEX [USU_NOMBRE_KEY]
ON [dbo].[Usuarios] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [USU_CLAVE_KEY]
ON [dbo].[Usuarios] (
  [CLAVE] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Usuarios
-- ----------------------------
ALTER TABLE [dbo].[Usuarios] ADD CONSTRAINT [PK__Usuarios__15B69B8EA5EC34D4] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Vendedores
-- ----------------------------
CREATE NONCLUSTERED INDEX [VEN_VENDEDOR_KEY]
ON [dbo].[Vendedores] (
  [CODIGOVENDEDOR] ASC
)
GO

CREATE NONCLUSTERED INDEX [VEN_NOMBRE_KEY]
ON [dbo].[Vendedores] (
  [NOMBRE] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table Vendedores
-- ----------------------------
ALTER TABLE [dbo].[Vendedores] ADD CONSTRAINT [PK__Vendedor__15B69B8EFA8A0751] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO

