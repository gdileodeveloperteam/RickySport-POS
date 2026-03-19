/*
 Navicat Premium Data Transfer

 Source Server         : LocalHost
 Source Server Type    : SQL Server
 Source Server Version : 17001000
 Source Host           : localhost:1433
 Source Catalog        : RickySport
 Source Schema         : dbo

 Target Server Type    : SQL Server
 Target Server Version : 17001000
 File Encoding         : 65001

 Date: 17/03/2026 15:55:22
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
  [dts] int  NULL,
  [ID] int  NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ACTIVO] tinyint  NULL
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
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDBANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
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
  [TITULAR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
  [dts] float(53)  NULL,
  [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
  [dts] int  NULL,
  [GUIDBANCOSCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCAJADIARIA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
-- Table structure for COMPROBA
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[COMPROBA]') AND type IN ('U'))
	DROP TABLE [dbo].[COMPROBA]
GO

CREATE TABLE [dbo].[COMPROBA] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFACTURASCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NUMEROCOMPROBANTEPAGO] int  NULL,
  [FECHA] date  NULL,
  [FECHAVENCIMIENTO] date  NULL,
  [MONTOTOTAL] decimal(13,2)  NULL,
  [MONEDA] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ESTADO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[COMPROBA] SET (LOCK_ESCALATION = TABLE)
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
  [DESCRIPCIONSEGUNBANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
  [NOMBREEMPRESA] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DIRECCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
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
  [LOGO] image  NULL,
  [ID] int  NULL,
  [FECHAINICIO] date  NULL,
  [RESPONSABLE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DOMICILIO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DOCUMENTOFIRMANTE] varchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CELULARFIRMANTE] varchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [EMAILFIRMANTE] varchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TokenWhatsApp] varchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TokenDocumentSign] varchar(2048) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[Configuracion] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for CuentaCorrienteProveedor
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[CuentaCorrienteProveedor]') AND type IN ('U'))
	DROP TABLE [dbo].[CuentaCorrienteProveedor]
GO

CREATE TABLE [dbo].[CuentaCorrienteProveedor] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDPROVEEDORES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDFACTURASCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHA] date  NULL,
  [DEBE] decimal(13,2)  NULL,
  [HABER] decimal(13,2)  NULL,
  [SALDO] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[CuentaCorrienteProveedor] SET (LOCK_ESCALATION = TABLE)
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
-- Table structure for Empleados
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Empleados]') AND type IN ('U'))
	DROP TABLE [dbo].[Empleados]
GO

CREATE TABLE [dbo].[Empleados] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCATEGORIAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDSITUACIONESREVISTA] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONDICIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDACTIVIDADES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDZONAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDOBRASSOCIALES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDMODALIDADCONTRATACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDSINIESTRADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDREGIMENES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOLEGAJOS] int  NOT NULL,
  [NOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DIRECCION] varchar(39) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [EMAIL] varchar(149) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [LOCALIDAD] varchar(155) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PROVINCIA] varchar(149) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DOCUMENTO] char(9) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIL] char(13) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TAREA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAINGRESO] date  NULL,
  [FECHACOMPUTOANTIGUEDAD] date  NULL,
  [FECHAEGRESO] date  NULL,
  [CARGAFAMILIAR] tinyint  NULL,
  [HIJOS] tinyint  NULL,
  [FECHANACIMIENTO] date  NULL,
  [ESTADOCIVIL] char(30) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CONDICION] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ESTADO] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPOEMPRESA] decimal(1)  NULL,
  [DESCRIPCIONTIPOEMPRESA] varchar(99) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SITUACIONREVISTA1] decimal(3)  NULL,
  [DIASITUACIONREVISTA1] decimal(3)  NULL,
  [SITUACIONREVISTA2] decimal(3)  NULL,
  [DIASITUACIONREVISTA2] decimal(3)  NULL,
  [SITUACIONREVISTA3] decimal(3)  NULL,
  [DIASITUACIONREVISTA3] decimal(3)  NULL,
  [ADHERENTESCANTIDAD] tinyint  NULL,
  [CONTRIBUCIONTAREADIFERENCIAL] decimal(5,2)  NULL,
  [FECHAULTIMOSAC] date  NULL,
  [FECHAULTIMOVACACIONES] date  NULL,
  [VACACIONESACUMULADAS] tinyint  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [CELULAR] char(17) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOOBRASOCIAL] int  NULL,
  [APORTASINDICATO] char(1) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[Empleados] SET (LOCK_ESCALATION = TABLE)
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
  [TOTAL] decimal(15,2)  NULL,
  [FECHA] int  NULL,
  [FECHACARGA] date  NOT NULL,
  [RETENCIONIVA] tinyint  NULL,
  [RETENCIONBRUTOS] tinyint  NULL,
  [RETENCIONGANANCIA] tinyint  NULL,
  [BONIFICACION] decimal(15,2)  NULL,
  [NETOGRAVADO] decimal(15,2)  NULL,
  [CONCEPTONOGRAVADO] decimal(15,2)  NULL,
  [EXENTO] decimal(13,2)  NULL,
  [IVA105] decimal(13,2)  NULL,
  [IVA21] decimal(13,2)  NULL,
  [IVA27] decimal(13,2)  NULL,
  [MONTOIVA] decimal(15,2)  NULL,
  [MONTOBRUTOS] decimal(15,2)  NULL,
  [MONTOGANANCIA] decimal(15,2)  NULL,
  [DESCUENTO] decimal(13,2)  NULL,
  [IMPUESTOSINTERNOS] decimal(13,2)  NULL,
  [JURISDICCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [OBSERVACIONES] varchar(1998) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PAGADA] tinyint  NULL,
  [TIPO] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IDPLANCUENTAS] int  NULL,
  [IMAGEN] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ts] float(53)  NULL,
  [sts] float(53)  NULL,
  [dts] float(53)  NULL,
  [ID] int  NULL,
  [FECHAFACTURACION] date  NULL,
  [FECHALIQUIDACION] date  NULL,
  [USUARIOIDCARGA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTALPAGADO] decimal(15,2)  NULL,
  [TOTALADEUDADO] decimal(15,2)  NULL,
  [GUIDORDENESDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMAGENNOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NOMBREPROVEEDOR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIT] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
-- Table structure for Imputacion
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Imputacion]') AND type IN ('U'))
	DROP TABLE [dbo].[Imputacion]
GO

CREATE TABLE [dbo].[Imputacion] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDPLANCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[Imputacion] SET (LOCK_ESCALATION = TABLE)
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
  [GUIDORIGENFONDOSCHEQUES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
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
  [FECHACOBRO] date  NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDORDENESDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDRECIBO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPAGOSRECIBOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL
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
  [TOTALNETO27] decimal(18,2)  NULL,
  [NOMBREPROVEEDOR] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CUIT] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[Liquidaciones] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for Modalidad_Contratacion
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Modalidad_Contratacion]') AND type IN ('U'))
	DROP TABLE [dbo].[Modalidad_Contratacion]
GO

CREATE TABLE [dbo].[Modalidad_Contratacion] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[Modalidad_Contratacion] SET (LOCK_ESCALATION = TABLE)
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
  [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL DEFAULT '',
  [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL DEFAULT '',
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
  [GUIDREMITOSCOMPRAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDREMITOSDEVOLUCIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
  [GuidBancosCuentas] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SALDO] decimal(13,2)  NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
  [GUIDMOVIMIENTOARTICULOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
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
-- Table structure for Proveedores_unicos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[Proveedores_unicos]') AND type IN ('U'))
	DROP TABLE [dbo].[Proveedores_unicos]
GO

CREATE TABLE [dbo].[Proveedores_unicos] (
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

ALTER TABLE [dbo].[Proveedores_unicos] SET (LOCK_ESCALATION = TABLE)
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
  [GUIDREMITOSCAMBIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PENDIENTEFACTURAR] int  NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[Remitos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for RemitosCambios
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[RemitosCambios]') AND type IN ('U'))
	DROP TABLE [dbo].[RemitosCambios]
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
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PENDIENTEFACTURAR] int  NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[RemitosCambios] SET (LOCK_ESCALATION = TABLE)
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
-- Table structure for RemitosDevoluciones
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[RemitosDevoluciones]') AND type IN ('U'))
	DROP TABLE [dbo].[RemitosDevoluciones]
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
  [GUIDREMITOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [PENDIENTEFACTURAR] int  NULL,
  [ts] float(53)  NOT NULL,
  [sts] float(53)  NOT NULL,
  [dts] float(53)  NULL
)
GO

ALTER TABLE [dbo].[RemitosDevoluciones] SET (LOCK_ESCALATION = TABLE)
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
-- Table structure for SueldosCategorias
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosCategorias]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosCategorias]
GO

CREATE TABLE [dbo].[SueldosCategorias] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONVENIOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosCategorias] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosConceptosFormulas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosConceptosFormulas]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosConceptosFormulas]
GO

CREATE TABLE [dbo].[SueldosConceptosFormulas] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONCEPTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CONDICION] tinyint  NULL,
  [DATOIF] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DATOTHEN] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DATOELSE] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESDE] date  NULL,
  [HASTA] date  NULL,
  [PORCENTAJE] decimal(7,2)  NULL,
  [FIJO] decimal(11,2)  NULL,
  [FORMULA] char(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosConceptosFormulas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosConceptosPorCategorias
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosConceptosPorCategorias]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosConceptosPorCategorias]
GO

CREATE TABLE [dbo].[SueldosConceptosPorCategorias] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONCEPTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCATEGORIAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosConceptosPorCategorias] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosConceptosVarios
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosConceptosVarios]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosConceptosVarios]
GO

CREATE TABLE [dbo].[SueldosConceptosVarios] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCATEGORIAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONVENIO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [CODIGOCONCEPTO] int  NULL,
  [PRIORIDAD] int  NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO] varchar(29) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SOBREAPLICA] tinyint  NULL,
  [QUINCENAMENSUAL] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [UNIDADES] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ABREVIACION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosConceptosVarios] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosCondiciones
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosCondiciones]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosCondiciones]
GO

CREATE TABLE [dbo].[SueldosCondiciones] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosCondiciones] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosConvenios
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosConvenios]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosConvenios]
GO

CREATE TABLE [dbo].[SueldosConvenios] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CONVENIO] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosConvenios] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosDetalleHorasEmpleados
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosDetalleHorasEmpleados]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosDetalleHorasEmpleados]
GO

CREATE TABLE [dbo].[SueldosDetalleHorasEmpleados] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MESANIO] date  NULL,
  [HORAS] tinyint  NULL,
  [HORASEXTRAS] tinyint  NULL,
  [HORASFERIADOS] tinyint  NULL,
  [DIAS] tinyint  NULL,
  [DIASEXTRAS] tinyint  NULL,
  [DIASFERIADOS] tinyint  NULL,
  [INASISTENCIAJUSTIFICADA] tinyint  NULL,
  [INASISTENCIAINJUSTIFICADA] tinyint  NULL,
  [ASISTENCIAPERFECTA] tinyint  NULL,
  [LICENCIAEXAMEN] tinyint  NULL,
  [LICENCIAART] tinyint  NULL,
  [LICENCIASINGOCE] tinyint  NULL,
  [LICENCIAFALLECIMIENTO] tinyint  NULL,
  [LICENCIAMATERNIDAD] tinyint  NULL,
  [LICENCIANACIMIENTO] tinyint  NULL,
  [HORASNOTRABAJADASVACACIONES] tinyint  NULL,
  [DIASNOTRABAJADOSVACACIONES] tinyint  NULL,
  [PLUS] tinyint  NULL,
  [ANTICIPOSUELDO] decimal(13,2)  NULL,
  [QUINCENAMENSUAL] char(20) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [SAC] tinyint  NULL,
  [SACIMPORTE] decimal(13,2)  NULL,
  [LIQUIDACIONFINAL] tinyint  NULL,
  [PRESENTISMO] tinyint  NULL,
  [SUSPENSION] tinyint  NULL,
  [VACACIONES] decimal(13,2)  NULL,
  [VACACIONESDIAS] tinyint  NULL,
  [FCL] tinyint  NULL,
  [TOTALHORASSEMESTRE] decimal(7,2)  NULL,
  [TOTALFCLACUMULADO] decimal(13,2)  NULL,
  [NREMUNERATIVO] decimal(13,2)  NULL,
  [EMBARGOS] decimal(13,2)  NULL,
  [LITIS] decimal(13,2)  NULL,
  [PRODUCTIVIDAD] decimal(13,2)  NULL,
  [SEMESTRAL] decimal(13,2)  NULL,
  [MEDIAJORNADA] tinyint  NULL,
  [SACIMPORTEEXENTO] decimal(13,2)  NULL,
  [TIPOLIQUIDACION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosDetalleHorasEmpleados] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosEmpleadosXTareas
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosEmpleadosXTareas]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosEmpleadosXTareas]
GO

CREATE TABLE [dbo].[SueldosEmpleadosXTareas] (
  [DESCRIPCIONTAREA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDSUELDOSTAREASEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosEmpleadosXTareas] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosEscalasSalariales
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosEscalasSalariales]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosEscalasSalariales]
GO

CREATE TABLE [dbo].[SueldosEscalasSalariales] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCATEGORIAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESDE] date  NULL,
  [HASTA] date  NULL,
  [VALORHORA] decimal(13,2)  NULL,
  [VALORMENSUAL] decimal(13,2)  NULL,
  [VALORHORAEXTRA] decimal(7,2)  NULL
)
GO

ALTER TABLE [dbo].[SueldosEscalasSalariales] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosImputaciones
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosImputaciones]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosImputaciones]
GO

CREATE TABLE [dbo].[SueldosImputaciones] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [DESCRIPCION] varchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDPLANCUENTAS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL
)
GO

ALTER TABLE [dbo].[SueldosImputaciones] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosLiquidaciones
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosLiquidaciones]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosLiquidaciones]
GO

CREATE TABLE [dbo].[SueldosLiquidaciones] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [MESANIO] date  NULL,
  [PERIODOBANCOAPORTE] date  NULL,
  [DEPOSITOBANCOAPORTES] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHADEPOSITOBANCO] date  NULL,
  [LIQUIDACIONCERRADA] tinyint  NULL,
  [FECHACIERRELIQUIDACION] date  NULL,
  [TIPOLIQUIDACION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosLiquidaciones] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosNovedades
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosNovedades]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosNovedades]
GO

CREATE TABLE [dbo].[SueldosNovedades] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [FECHAREGISTRO] date  NULL,
  [FECHADESDE] date  NULL,
  [FECHAHASTA] date  NULL,
  [CANTIDADDIAS] int  NULL,
  [MOTIVO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMAGEN] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMAGENNOMBRE] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosNovedades] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosObrasSociales
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosObrasSociales]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosObrasSociales]
GO

CREATE TABLE [dbo].[SueldosObrasSociales] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGOOBRASOCIAL] decimal(7)  NULL,
  [DESCRIPCION] char(200) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPO] tinyint  NULL
)
GO

ALTER TABLE [dbo].[SueldosObrasSociales] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosRecibos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosRecibos]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosRecibos]
GO

CREATE TABLE [dbo].[SueldosRecibos] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDIMPUTACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDSUELDOSLIQUIDACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTALSUELDOBRUTO] decimal(13,2)  NULL,
  [TOTALSUELDONETO] decimal(13,2)  NULL,
  [TOTALREMUNERATIVO] decimal(13,2)  NULL,
  [TOTALREMUNERATIVOEXENTO] decimal(13,2)  NULL,
  [TOTALDESCUENTOS] decimal(11,2)  NULL,
  [TOTALHORAS] decimal(13,2)  NULL,
  [TOTALHORASEXTRAS] decimal(13,2)  NULL,
  [TOTALHORASFERIADOS] decimal(13,2)  NULL,
  [TOTALDIAS] decimal(13,2)  NULL,
  [TOTALDIASFERIADOS] tinyint  NULL,
  [TOTALSAC] decimal(13,2)  NULL,
  [TOTALVACACIONES] decimal(13,2)  NULL,
  [VALORHORA] decimal(11,2)  NULL,
  [VALORMENSUAL] decimal(13,2)  NULL,
  [MESANIO] date  NULL,
  [QUINCENAMENSUAL] char(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTALREMUNERATIVOANTERIOR] decimal(13,2)  NULL,
  [ANTIGUEDAD] decimal(11,2)  NULL,
  [LIQUIDACIONCERRADA] tinyint  NULL,
  [TOTALTSUELDOBRUTO] decimal(13,2)  NULL,
  [TOTALTREMUNERATIVO] decimal(13,2)  NULL,
  [TOTALTREMUNERATIVOEXENTO] decimal(13,2)  NULL,
  [TOTALTDESCUENTOS] decimal(13,2)  NULL,
  [TOTALTHORAS] decimal(7,2)  NULL,
  [TOTALTHORASEXTRAS] decimal(7,2)  NULL,
  [TOTALTHORASFERIADOS] decimal(7,2)  NULL,
  [TOTALTDIAS] decimal(7,2)  NULL,
  [TOTALTDIASFERIADOS] decimal(7,2)  NULL,
  [PRIORIDAD] int  NULL,
  [UNIDADES] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPOLIQUIDACION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [RECIBOENVIADO] tinyint  NULL,
  [RECIBOGENERADO] tinyint  NULL
)
GO

ALTER TABLE [dbo].[SueldosRecibos] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosRecibosDetalle
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosRecibosDetalle]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosRecibosDetalle]
GO

CREATE TABLE [dbo].[SueldosRecibosDetalle] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDEMPLEADOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDCONCEPTOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [GUIDRECIBOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTALSUELDOBRUTO] decimal(11,2)  NULL,
  [PRESENTISMO] decimal(7,2)  NULL,
  [SAC] decimal(7,2)  NULL,
  [VACACIONES] decimal(7,2)  NULL,
  [TOTALSUELDONETO] decimal(11,2)  NULL,
  [IMPORTE] decimal(11,2)  NULL,
  [DESCRIPCION] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TOTALREMUNERATIVO] decimal(11,2)  NULL,
  [TOTALREMUNERATIVOEXENTO] decimal(11,2)  NULL,
  [TOTALDESCUENTOS] decimal(11,2)  NULL,
  [TOTALHORAS] decimal(11,2)  NULL,
  [TOTALHORASEXTRAS] decimal(11,2)  NULL,
  [TOTALHORASFERIADOS] decimal(11,2)  NULL,
  [TOTALDIAS] decimal(11,2)  NULL,
  [TOTALDIASFERIADOS] tinyint  NULL,
  [TIPO] char(2) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [UNIDADES] text COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [TIPOLIQUIDACION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosRecibosDetalle] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosSiniestrados
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosSiniestrados]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosSiniestrados]
GO

CREATE TABLE [dbo].[SueldosSiniestrados] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [CODIGO] int DEFAULT 0 NULL,
  [DESCRIPCION] char(100) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosSiniestrados] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for SueldosTareasEmpleados
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[SueldosTareasEmpleados]') AND type IN ('U'))
	DROP TABLE [dbo].[SueldosTareasEmpleados]
GO

CREATE TABLE [dbo].[SueldosTareasEmpleados] (
  [ID] int  NOT NULL,
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCONFIGURACIONES] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] char(256) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[SueldosTareasEmpleados] SET (LOCK_ESCALATION = TABLE)
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
-- Table structure for TiposComprobantesDePagos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TiposComprobantesDePagos]') AND type IN ('U'))
	DROP TABLE [dbo].[TiposComprobantesDePagos]
GO

CREATE TABLE [dbo].[TiposComprobantesDePagos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [FORMADEPAGO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [DESCRIPCION] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ACTIVO] tinyint  NULL
)
GO

ALTER TABLE [dbo].[TiposComprobantesDePagos] SET (LOCK_ESCALATION = TABLE)
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
-- Table structure for TransferenciasBancos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TransferenciasBancos]') AND type IN ('U'))
	DROP TABLE [dbo].[TransferenciasBancos]
GO

CREATE TABLE [dbo].[TransferenciasBancos] (
  [GUID] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ID] int  NOT NULL,
  [GUIDBANCOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDRECIBO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDORDENESDEPAGO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDCUENTABANCO] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [GUIDPAGOSRECIBOS] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [NOMBREBANCO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [FECHA] date  NULL,
  [TITULARCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [NUMEROCUENTA] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ESTADO] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [IMPORTE] decimal(13,2)  NULL
)
GO

ALTER TABLE [dbo].[TransferenciasBancos] SET (LOCK_ESCALATION = TABLE)
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
  [dts] float(53)  NULL,
  [CODIGOUSUARIO] smallint  NULL,
  [GUIDCONFIGURACION] char(16) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
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
-- View structure for VistaComprobantes
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[VistaComprobantes]') AND type IN ('V'))
	DROP VIEW [dbo].[VistaComprobantes]
GO

CREATE VIEW [dbo].[VistaComprobantes] AS SELECT
    -- Identifiers and Dates
    CAST(FC.GUID AS NVARCHAR(50)) AS GUID,
    P.NOMBRE AS NOMBREPROVEEDOR,
    CAST(P.CUIT AS NVARCHAR(50)) AS CUIT,
    CAST(FC.ID AS INT) AS ID,
    CAST(FC.FECHACARGA AS DATE) AS FECHACARGA,
    CAST(FC.FECHALIQUIDACION AS DATE) AS PERIODOCARGA,
    CAST(FC.FECHAFACTURACION AS DATE) AS FECHA,
    CAST(FC.NUMERO AS NVARCHAR(50)) AS NUMEROCOMPROBANTE,
    CAST(FC.PUNTOVENTA AS INT) AS PUNTOVENTA,
    -- Translated document type
    CAST(
        CASE 
            WHEN FC.TIPOCOMPROBANTE = 'FAC' THEN 'Factura'
            WHEN FC.TIPOCOMPROBANTE = 'NDC' THEN 'Nota de Crédito'
            WHEN FC.TIPOCOMPROBANTE = 'NDD' THEN 'Nota de Débito'
            ELSE FC.TIPOCOMPROBANTE
        END 
        AS VARCHAR(50)
    ) AS TIPOCOMPROBANTE,

    -- Letter and account assignment
    CAST(FC.LETRA AS CHAR(1)) AS LETRA,
    IPC.DESCRIPCION AS IMPUTACION,

    -- Withholdings
    CAST(FC.MONTOBRUTOS AS DECIMAL(18, 2)) AS TOTALRETENCIONINGRESOSBRUTOS,
    CAST(FC.MONTOGANANCIA AS DECIMAL(18, 2)) AS TOTALRETENCIONGANANCIAS,
    CAST(FC.MONTOIVA AS DECIMAL(18, 2)) AS TOTALRETENCIONIVA,

    -- Detailed VAT
    CAST(FC.IVA105 AS DECIMAL(18, 2)) AS TOTALIVA105,
    CAST(FC.IVA21 AS DECIMAL(18, 2)) AS TOTALIVA21,
    CAST(FC.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA27,
    CAST(FC.IVA105 + FC.IVA21 + FC.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA,

    -- Tax bases per rate (new)
    CAST(FC.IVA21 * 100.0 / 21.0 AS DECIMAL(18, 2)) AS TOTALNETO21,
    CAST(FC.IVA105 * 100.0 / 10.5 AS DECIMAL(18, 2)) AS TOTALNETO105,
    CAST(FC.IVA27 * 100.0 / 27.0 AS DECIMAL(18, 2)) AS TOTALNETO27,

    -- Accounting Groups
    CAST(FC.NETOGRAVADO AS DECIMAL(18, 2)) AS TOTALMONTOGRAVADOBASE,
    CAST(FC.CONCEPTONOGRAVADO AS DECIMAL(18, 2)) AS TOTALMONTONOGRAVADOEXENTO,
    CAST(0 AS DECIMAL(18, 2)) AS TOTALIMPUESTOPERCEPCIONIVA,
    CAST(COALESCE(FC.BONIFICACION, 0) + COALESCE(FC.DESCUENTO, 0) AS DECIMAL(18, 2)) AS TOTALDESCUENTOSBONIFICACIONES,
    CAST(COALESCE(FC.IMPUESTOSINTERNOS, 0) AS DECIMAL(18, 2)) AS TOTALIMPUESTOSINTERNOS,
    CAST(0 AS DECIMAL(18, 2)) AS TOTALDEDUCCIONESVARIAS,

    -- Totals
    CAST(COALESCE(FC.TOTAL,0) AS DECIMAL(18, 2)) AS TOTALCOMPROBANTE
FROM dbo.FacturasCompras AS FC
LEFT JOIN dbo.Proveedores AS P
    ON FC.GUIDPROVEEDORES = P.GUID
LEFT JOIN dbo.ImputacionesPlanCuentas AS IPC
    ON FC.GUIDIMPUTACIONES = IPC.GUID

UNION ALL

SELECT
    -- Identifiers and Dates
    CAST(L.GUID AS NVARCHAR(50)) AS GUID,
    P.NOMBRE AS NOMBREPROVEEDOR,
    CAST(P.CUIT AS NVARCHAR(50)) AS CUIT,
    CAST(L.ID AS INT) AS ID,
    CAST(L.FECHACARGA AS DATE) AS FECHACARGA,
    CAST(L.FECHALIQUIDACION AS DATE) AS PERIODOCARGA,
    CAST(L.FECHAPAGO AS DATE) AS FECHA,
    CAST(L.NROLIQUIDACION AS NVARCHAR(50)) AS NUMEROCOMPROBANTE,
    CAST(0 AS INT) AS PUNTOVENTA,

    -- Fixed document type for liquidations
    CAST('Liquidación' AS VARCHAR(50)) AS TIPOCOMPROBANTE,

    -- Letter and account assignment not applicable
    CAST(NULL AS CHAR(1)) AS LETRA,
    IPC.DESCRIPCION AS IMPUTACION,

    -- Withholdings
    CAST(L.MONTOINGRESOSBRUTOS AS DECIMAL(18, 2)) AS TOTALRETENCIONINGRESOSBRUTOS,
    CAST(L.MONTOGANANCIAS AS DECIMAL(18, 2)) AS TOTALRETENCIONGANANCIAS,
    CAST(L.MONTOIVA AS DECIMAL(18, 2)) AS TOTALRETENCIONIVA,

    -- Detailed VAT (using CROSS APPLY to avoid repeating logic)
    CAST(iv.IVA105 AS DECIMAL(18, 2)) AS TOTALIVA105,
    CAST(iv.IVA21 AS DECIMAL(18, 2)) AS TOTALIVA21,
    CAST(iv.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA27,
    CAST(iv.IVA105 + iv.IVA21 + iv.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA,

    -- Tax bases per rate (new)
    CAST(iv.IVA21 * 100.0 / 21.0 AS DECIMAL(18, 2)) AS TOTALNETO21,
    CAST(iv.IVA105 * 100.0 / 10.5 AS DECIMAL(18, 2)) AS TOTALNETO105,
    CAST(iv.IVA27 * 100.0 / 27.0 AS DECIMAL(18, 2)) AS TOTALNETO27,

    -- Accounting Groups
    CAST( (iv.IVA21 * 100.0 / 21.0)
        + (iv.IVA105 * 100.0 / 10.5)
        + (iv.IVA27 * 100.0 / 27.0) AS DECIMAL(18, 2)) AS TOTALMONTOGRAVADOBASE,
    CAST(L.BASEEXENTA AS DECIMAL(18, 2)) AS TOTALMONTONOGRAVADOEXENTO,
    CAST(COALESCE(L.IMPUESTOPERCEPCIONIVA, 0) AS DECIMAL(18, 2)) AS TOTALIMPUESTOPERCEPCIONIVA,
    CAST(COALESCE(L.OTROSDESCUENTOS, 0) AS DECIMAL(18, 2)) AS TOTALDESCUENTOSBONIFICACIONES,
    CAST(0 AS DECIMAL(18, 2)) AS TOTALIMPUESTOSINTERNOS,
    CAST(COALESCE(L.DEDUCCIONESNETAS, 0) + COALESCE(L.DEDUCCIONESIMPOSITIVAS, 0) AS DECIMAL(18, 2)) AS TOTALDEDUCCIONESVARIAS,

    -- Totals
    CAST(
        COALESCE(iv.IVA105 + iv.IVA21 + iv.IVA27, 0) -- Sum of Total IVA
        + COALESCE(L.BASEEXENTA, 0) -- Total Monto No Gravado Exento
        + COALESCE((iv.IVA21 * 100.0 / 21.0) + (iv.IVA105 * 100.0 / 10.5) + (iv.IVA27 * 100.0 / 27.0), 0) -- Total Monto Gravado
        + COALESCE(0, 0) -- Total Impuestos Internos (from query)
        + COALESCE(L.MONTOINGRESOSBRUTOS, 0) -- Total Retencion IIBB
        + COALESCE(L.MONTOGANANCIAS, 0) -- Total Retencion Ganancias
        + COALESCE(L.MONTOIVA, 0) -- Total Retencion IVA
    AS DECIMAL(18, 2)) AS TOTALCOMPROBANTE
FROM dbo.Liquidaciones AS L
LEFT JOIN dbo.Proveedores AS P
    ON L.GUIDPROVEEDOR = P.GUID
LEFT JOIN dbo.ImputacionesPlanCuentas AS IPC
    ON L.GUIDIMPUTACIONES = IPC.GUID
CROSS APPLY (
    SELECT
        -- VAT 10.5%
        CAST(
            (CASE WHEN COALESCE(L.PORCENTAJEIVAPOSNET, 0) = 10.5 THEN COALESCE(L.MONTOIVAPOSNET, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAARANCEL, 0) = 10.5 THEN COALESCE(L.MONTOIVAARANCEL, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAFIRSTDATA, 0) = 10.5 THEN COALESCE(L.MONTOIVAFIRSTDATA, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVADESCUENTOFINANCIERO, 0) = 10.5 THEN COALESCE(L.MONTOIVADESCUENTOFINANCIERO, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL, 0) = 10.5 THEN COALESCE(L.MONTOIVACARGOSISTEMACUENTAMENSUAL, 0) ELSE 0 END)
        AS DECIMAL(18, 2)) AS IVA105,

        -- VAT 21%
        CAST(
            (CASE WHEN COALESCE(L.PORCENTAJEIVAPOSNET, 0) = 21 THEN COALESCE(L.MONTOIVAPOSNET, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAARANCEL, 0) = 21 THEN COALESCE(L.MONTOIVAARANCEL, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAFIRSTDATA, 0) = 21 THEN COALESCE(L.MONTOIVAFIRSTDATA, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVADESCUENTOFINANCIERO, 0) = 21 THEN COALESCE(L.MONTOIVADESCUENTOFINANCIERO, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL, 0) = 21 THEN COALESCE(L.MONTOIVACARGOSISTEMACUENTAMENSUAL, 0) ELSE 0 END)
        AS DECIMAL(18, 2)) AS IVA21,

        -- VAT 27%
        CAST(
            (CASE WHEN COALESCE(L.PORCENTAJEIVAPOSNET, 0) = 27 THEN COALESCE(L.MONTOIVAPOSNET, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAARANCEL, 0) = 27 THEN COALESCE(L.MONTOIVAARANCEL, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAFIRSTDATA, 0) = 27 THEN COALESCE(L.MONTOIVAFIRSTDATA, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVADESCUENTOFINANCIERO, 0) = 27 THEN COALESCE(L.MONTOIVADESCUENTOFINANCIERO, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL, 0) = 27 THEN COALESCE(L.MONTOIVACARGOSISTEMACUENTAMENSUAL, 0) ELSE 0 END)
        AS DECIMAL(18, 2)) AS IVA27
) AS iv;
GO


-- ----------------------------
-- View structure for VistaComprobantesDashBoard
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[VistaComprobantesDashBoard]') AND type IN ('V'))
	DROP VIEW [dbo].[VistaComprobantesDashBoard]
GO

CREATE VIEW [dbo].[VistaComprobantesDashBoard] AS SELECT
    -- Identifiers and Dates
    CAST(FC.GUID AS NVARCHAR(50)) AS GUID,
    P.NOMBRE AS NOMBREPROVEEDOR,
    CAST(P.CUIT AS NVARCHAR(50)) AS CUIT,
    CAST(FC.ID AS INT) AS ID,
    CAST(FC.FECHACARGA AS DATE) AS FECHACARGA,
    CAST(FC.FECHALIQUIDACION AS DATE) AS PERIODOCARGA,
    CAST(FC.FECHAFACTURACION AS DATE) AS FECHA,
    CAST(MONTH(FC.FECHAFACTURACION) AS INT) AS MES,
    CAST(YEAR(FC.FECHAFACTURACION) AS INT) AS ANIO,
    CAST(FC.NUMERO AS NVARCHAR(50)) AS NUMEROCOMPROBANTE,
    CAST(FC.PUNTOVENTA AS INT) AS PUNTOVENTA,
    -- Translated document type
    CAST(
        CASE 
            WHEN FC.TIPOCOMPROBANTE = 'FAC' THEN 'Factura'
            WHEN FC.TIPOCOMPROBANTE = 'NDC' THEN 'Nota de Crédito'
            WHEN FC.TIPOCOMPROBANTE = 'NDD' THEN 'Nota de Débito'
            ELSE FC.TIPOCOMPROBANTE
        END 
        AS VARCHAR(50)
    ) AS TIPOCOMPROBANTE,

    -- Letter and account assignment
    CAST(FC.LETRA AS CHAR(1)) AS LETRA,
    IPC.DESCRIPCION AS IMPUTACION,

    -- Withholdings
    CAST(FC.MONTOBRUTOS AS DECIMAL(18, 2)) AS TOTALRETENCIONINGRESOSBRUTOS,
    CAST(FC.MONTOGANANCIA AS DECIMAL(18, 2)) AS TOTALRETENCIONGANANCIAS,
    CAST(FC.MONTOIVA AS DECIMAL(18, 2)) AS TOTALRETENCIONIVA,

    -- Detailed VAT
    CAST(FC.IVA105 AS DECIMAL(18, 2)) AS TOTALIVA105,
    CAST(FC.IVA21 AS DECIMAL(18, 2)) AS TOTALIVA21,
    CAST(FC.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA27,
    CAST(FC.IVA105 + FC.IVA21 + FC.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA,

    -- Tax bases per rate (new)
    CAST(FC.IVA21 * 100.0 / 21.0 AS DECIMAL(18, 2)) AS TOTALNETO21,
    CAST(FC.IVA105 * 100.0 / 10.5 AS DECIMAL(18, 2)) AS TOTALNETO105,
    CAST(FC.IVA27 * 100.0 / 27.0 AS DECIMAL(18, 2)) AS TOTALNETO27,

    -- Accounting Groups
    CAST(FC.NETOGRAVADO AS DECIMAL(18, 2)) AS TOTALMONTOGRAVADOBASE,
    CAST(FC.CONCEPTONOGRAVADO AS DECIMAL(18, 2)) AS TOTALMONTONOGRAVADOEXENTO,
    CAST(0 AS DECIMAL(18, 2)) AS TOTALIMPUESTOPERCEPCIONIVA,
    CAST(COALESCE(FC.BONIFICACION, 0) + COALESCE(FC.DESCUENTO, 0) AS DECIMAL(18, 2)) AS TOTALDESCUENTOSBONIFICACIONES,
    CAST(COALESCE(FC.IMPUESTOSINTERNOS, 0) AS DECIMAL(18, 2)) AS TOTALIMPUESTOSINTERNOS,
    CAST(0 AS DECIMAL(18, 2)) AS TOTALDEDUCCIONESVARIAS,

    -- Totals
    CAST(COALESCE(FC.TOTAL,0) AS DECIMAL(18, 2)) AS TOTALCOMPROBANTE
FROM dbo.FacturasCompras AS FC
LEFT JOIN dbo.Proveedores AS P
    ON FC.GUIDPROVEEDORES = P.GUID
LEFT JOIN dbo.ImputacionesPlanCuentas AS IPC
    ON FC.GUIDIMPUTACIONES = IPC.GUID
WHERE FC.GUIDCONFIGURACION = 'YKFBEP865TD198W6'

UNION ALL

SELECT
    -- Identifiers and Dates
    CAST(L.GUID AS NVARCHAR(50)) AS GUID,
    P.NOMBRE AS NOMBREPROVEEDOR,
    CAST(P.CUIT AS NVARCHAR(50)) AS CUIT,
    CAST(L.ID AS INT) AS ID,
    CAST(L.FECHACARGA AS DATE) AS FECHACARGA,
    CAST(L.FECHALIQUIDACION AS DATE) AS PERIODOCARGA,
    CAST(L.FECHAPAGO AS DATE) AS FECHA,
    CAST(MONTH(L.FECHAPAGO) AS INT) AS MES,
    CAST(YEAR(L.FECHAPAGO) AS INT) AS ANIO,
    CAST(L.NROLIQUIDACION AS NVARCHAR(50)) AS NUMEROCOMPROBANTE,
    CAST(0 AS INT) AS PUNTOVENTA,

    -- Fixed document type for liquidations
    CAST('Liquidación' AS VARCHAR(50)) AS TIPOCOMPROBANTE,

    -- Letter and account assignment not applicable
    CAST(NULL AS CHAR(1)) AS LETRA,
    IPC.DESCRIPCION AS IMPUTACION,

    -- Withholdings
    CAST(L.MONTOINGRESOSBRUTOS AS DECIMAL(18, 2)) AS TOTALRETENCIONINGRESOSBRUTOS,
    CAST(L.MONTOGANANCIAS AS DECIMAL(18, 2)) AS TOTALRETENCIONGANANCIAS,
    CAST(L.MONTOIVA AS DECIMAL(18, 2)) AS TOTALRETENCIONIVA,

    -- Detailed VAT (using CROSS APPLY to avoid repeating logic)
    CAST(iv.IVA105 AS DECIMAL(18, 2)) AS TOTALIVA105,
    CAST(iv.IVA21 AS DECIMAL(18, 2)) AS TOTALIVA21,
    CAST(iv.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA27,
    CAST(iv.IVA105 + iv.IVA21 + iv.IVA27 AS DECIMAL(18, 2)) AS TOTALIVA,

    -- Tax bases per rate (new)
    CAST(iv.IVA21 * 100.0 / 21.0 AS DECIMAL(18, 2)) AS TOTALNETO21,
    CAST(iv.IVA105 * 100.0 / 10.5 AS DECIMAL(18, 2)) AS TOTALNETO105,
    CAST(iv.IVA27 * 100.0 / 27.0 AS DECIMAL(18, 2)) AS TOTALNETO27,

    -- Accounting Groups
    CAST( (iv.IVA21 * 100.0 / 21.0)
        + (iv.IVA105 * 100.0 / 10.5)
        + (iv.IVA27 * 100.0 / 27.0) AS DECIMAL(18, 2)) AS TOTALMONTOGRAVADOBASE,
    CAST(L.BASEEXENTA AS DECIMAL(18, 2)) AS TOTALMONTONOGRAVADOEXENTO,
    CAST(COALESCE(L.IMPUESTOPERCEPCIONIVA, 0) AS DECIMAL(18, 2)) AS TOTALIMPUESTOPERCEPCIONIVA,
    CAST(COALESCE(L.OTROSDESCUENTOS, 0) AS DECIMAL(18, 2)) AS TOTALDESCUENTOSBONIFICACIONES,
    CAST(0 AS DECIMAL(18, 2)) AS TOTALIMPUESTOSINTERNOS,
    CAST(COALESCE(L.DEDUCCIONESNETAS, 0) + COALESCE(L.DEDUCCIONESIMPOSITIVAS, 0) AS DECIMAL(18, 2)) AS TOTALDEDUCCIONESVARIAS,

    -- Totals
    CAST(
        COALESCE(iv.IVA105 + iv.IVA21 + iv.IVA27, 0) -- Sum of Total IVA
        + COALESCE(L.BASEEXENTA, 0) -- Total Monto No Gravado Exento
        + COALESCE((iv.IVA21 * 100.0 / 21.0) + (iv.IVA105 * 100.0 / 10.5) + (iv.IVA27 * 100.0 / 27.0), 0) -- Total Monto Gravado
        + COALESCE(0, 0) -- Total Impuestos Internos (from query)
        + COALESCE(L.MONTOINGRESOSBRUTOS, 0) -- Total Retencion IIBB
        + COALESCE(L.MONTOGANANCIAS, 0) -- Total Retencion Ganancias
        + COALESCE(L.MONTOIVA, 0) -- Total Retencion IVA
    AS DECIMAL(18, 2)) AS TOTALCOMPROBANTE
FROM dbo.Liquidaciones AS L
LEFT JOIN dbo.Proveedores AS P
    ON L.GUIDPROVEEDOR = P.GUID
LEFT JOIN dbo.ImputacionesPlanCuentas AS IPC
    ON L.GUIDIMPUTACIONES = IPC.GUID

CROSS APPLY (
    SELECT
        -- VAT 10.5%
        CAST(
            (CASE WHEN COALESCE(L.PORCENTAJEIVAPOSNET, 0) = 10.5 THEN COALESCE(L.MONTOIVAPOSNET, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAARANCEL, 0) = 10.5 THEN COALESCE(L.MONTOIVAARANCEL, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAFIRSTDATA, 0) = 10.5 THEN COALESCE(L.MONTOIVAFIRSTDATA, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVADESCUENTOFINANCIERO, 0) = 10.5 THEN COALESCE(L.MONTOIVADESCUENTOFINANCIERO, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL, 0) = 10.5 THEN COALESCE(L.MONTOIVACARGOSISTEMACUENTAMENSUAL, 0) ELSE 0 END)
        AS DECIMAL(18, 2)) AS IVA105,

        -- VAT 21%
        CAST(
            (CASE WHEN COALESCE(L.PORCENTAJEIVAPOSNET, 0) = 21 THEN COALESCE(L.MONTOIVAPOSNET, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAARANCEL, 0) = 21 THEN COALESCE(L.MONTOIVAARANCEL, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAFIRSTDATA, 0) = 21 THEN COALESCE(L.MONTOIVAFIRSTDATA, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVADESCUENTOFINANCIERO, 0) = 21 THEN COALESCE(L.MONTOIVADESCUENTOFINANCIERO, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL, 0) = 21 THEN COALESCE(L.MONTOIVACARGOSISTEMACUENTAMENSUAL, 0) ELSE 0 END)
        AS DECIMAL(18, 2)) AS IVA21,

        -- VAT 27%
        CAST(
            (CASE WHEN COALESCE(L.PORCENTAJEIVAPOSNET, 0) = 27 THEN COALESCE(L.MONTOIVAPOSNET, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAARANCEL, 0) = 27 THEN COALESCE(L.MONTOIVAARANCEL, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVAFIRSTDATA, 0) = 27 THEN COALESCE(L.MONTOIVAFIRSTDATA, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVADESCUENTOFINANCIERO, 0) = 27 THEN COALESCE(L.MONTOIVADESCUENTOFINANCIERO, 0) ELSE 0 END) +
            (CASE WHEN COALESCE(L.PORCENTAJEIVACARGOSISTEMACUENTAMENSUAL, 0) = 27 THEN COALESCE(L.MONTOIVACARGOSISTEMACUENTAMENSUAL, 0) ELSE 0 END)
        AS DECIMAL(18, 2)) AS IVA27
) AS iv
WHERE L.GUIDCONFIGURACION = 'YKFBEP865TD198W6';
GO


-- ----------------------------
-- View structure for VistaDetallesEmpleados
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[VistaDetallesEmpleados]') AND type IN ('V'))
	DROP VIEW [dbo].[VistaDetallesEmpleados]
GO

CREATE VIEW [dbo].[VistaDetallesEmpleados] AS SELECT
    -- Datos de Configuración (Agregados)
    C.NOMBREEMPRESA,
		C.CUIT,
		C.FECHAINICIO,
		C.DOMICILIO,
		C.FIRMANTE,
		C.RESPONSABLE,
		C.CARGO,
    C.DOCUMENTOFIRMANTE,
		
    -- Datos del Empleado
    E.GUID as GUIDEMPLEADO,
    E.CODIGOLEGAJOS,
    E.NOMBRE AS NOMBREEMPLEADO,
    E.DIRECCION,
    E.EMAIL,
    E.LOCALIDAD,
    E.PROVINCIA,
    E.DOCUMENTO,
    E.CUIL,
    E.TAREA,
    E.FECHAINGRESO,
    E.FECHACOMPUTOANTIGUEDAD,
    E.FECHAEGRESO,
    E.CARGAFAMILIAR,
    E.HIJOS,
    E.FECHANACIMIENTO,
    E.ESTADOCIVIL,
    E.CONDICION,

    -- Descripción de la Categoría
    SC.[DESCRIPCION] AS CATEGORIA_DESCRIPCION,

    -- Datos de Horas Trabajadas
    FORMAT(SDHE.MESANIO, 'MM/yyyy') AS DETALLEMESANIO,
    SDHE.QUINCENAMENSUAL,
    SDHE.HORAS,
    SDHE.HORASEXTRAS,
    SDHE.HORASFERIADOS,
    SDHE.DIAS,
    SDHE.DIASEXTRAS,
    SDHE.DIASFERIADOS,
    SDHE.INASISTENCIAJUSTIFICADA,
    SDHE.INASISTENCIAINJUSTIFICADA,
    SDHE.ASISTENCIAPERFECTA,
    SDHE.LICENCIAEXAMEN,
    SDHE.LICENCIAART,
    SDHE.LICENCIASINGOCE,
    SDHE.LICENCIAFALLECIMIENTO,
    SDHE.LICENCIAMATERNIDAD,
    SDHE.LICENCIANACIMIENTO,
    SDHE.HORASNOTRABAJADASVACACIONES,
    SDHE.DIASNOTRABAJADOSVACACIONES,
    SDHE.PLUS,
    SDHE.ANTICIPOSUELDO,
    SDHE.SAC,
    SDHE.SACIMPORTE,
    SDHE.LIQUIDACIONFINAL,
    SDHE.PRESENTISMO,
    SDHE.SUSPENSION,
    SDHE.VACACIONES,
    SDHE.VACACIONESDIAS,
    SDHE.FCL,
    SDHE.TOTALHORASSEMESTRE,
    SDHE.TOTALFCLACUMULADO,
    SDHE.NREMUNERATIVO,
    SDHE.EMBARGOS,
    SDHE.LITIS,
    SDHE.PRODUCTIVIDAD,
    SDHE.SEMESTRAL,
    SDHE.MEDIAJORNADA,

    -- Datos de Escalas Salariales
    SES.DESDE AS ESCALA_VIGENCIA_DESDE,
    SES.HASTA AS ESCALA_VIGENCIA_HASTA,
    SES.VALORHORA,
    SES.VALORMENSUAL,
    SES.VALORHORAEXTRA,

    -- Datos de Recibos de Sueldo
    SR.GUID AS SRGUIDRECIBOS,
    SR.TOTALSUELDOBRUTO,
    SR.GUIDSUELDOSLIQUIDACIONES,
    SR.TOTALSUELDONETO,
    SR.TOTALREMUNERATIVO,
    SR.TOTALREMUNERATIVOEXENTO,
    SR.TOTALDESCUENTOS,
    SR.TOTALHORAS AS RECIBO_TOTALHORAS,
    SR.TOTALHORASEXTRAS AS RECIBO_TOTALHORASEXTRAS,
    SR.TOTALHORASFERIADOS AS RECIBO_TOTALHORASFERIADOS,
    SR.TOTALDIAS AS RECIBO_TOTALDIAS,
    SR.TOTALDIASFERIADOS AS RECIBO_TOTALDIASFERIADOS,
    SR.TOTALSAC AS RECIBO_TOTALSAC,
    SR.TOTALVACACIONES AS RECIBO_TOTALVACACIONES,
    SR.VALORHORA AS RECIBO_VALORHORA,
    SR.VALORMENSUAL AS RECIBO_VALORMENSUAL,
    FORMAT(SR.MESANIO, 'MM/yyyy') AS RECIBO_MESANIO,
    SR.QUINCENAMENSUAL AS RECIBO_QUINCENAMENSUAL,
    SR.ANTIGUEDAD,
    SR.LIQUIDACIONCERRADA,

    -- Datos de Liquidaciones
    SL.MESANIO AS LIQUIDACIONMESANIO,
    SL.FECHADEPOSITOBANCO,
    SL.DEPOSITOBANCOAPORTES,
		SL.PERIODOBANCOAPORTE

FROM [dbo].[Empleados] E

-- JOIN AGREGADO: Relación Empleado -> Configuracion
LEFT JOIN [dbo].[Configuracion] C 
    ON E.guidConfiguraciones = C.GUID

LEFT JOIN [dbo].[SueldosCategorias] SC 
    ON E.[GUIDCATEGORIAS] = SC.[GUID]

LEFT JOIN [dbo].[SueldosDetalleHorasEmpleados] SDHE 
    ON E.[GUID] = SDHE.[GUIDEMPLEADOS]

OUTER APPLY (
    SELECT TOP 1 * FROM [dbo].[SueldosEscalasSalariales] S2
    WHERE S2.[GUIDCATEGORIAS] = SC.[GUID]
      AND SDHE.MESANIO >= S2.DESDE 
      AND (S2.HASTA IS NULL OR SDHE.MESANIO <= S2.HASTA)
    ORDER BY S2.DESDE DESC
) SES

LEFT JOIN [dbo].[SueldosRecibos] SR 
    ON E.[GUID] = SR.[GUIDEMPLEADOS]
    AND SDHE.MESANIO = SR.MESANIO
    AND SDHE.QUINCENAMENSUAL = SR.QUINCENAMENSUAL

LEFT JOIN [dbo].[SueldosLiquidaciones] SL
    ON SR.[GUIDSUELDOSLIQUIDACIONES] = SL.[GUID]
GO


-- ----------------------------
-- View structure for VistaDetallesLiquidacionesHoras
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[VistaDetallesLiquidacionesHoras]') AND type IN ('V'))
	DROP VIEW [dbo].[VistaDetallesLiquidacionesHoras]
GO

CREATE VIEW [dbo].[VistaDetallesLiquidacionesHoras] AS SELECT
    -- Datos del Empleado
    E.[ID] AS EmpleadoId,
    E.NOMBRE AS EmpleadoNombre,
    E.CUIL AS EmpleadoCuil,
    E.CODIGOLEGAJOS AS EmpleadoCodigoLegajos,

    -- Datos de Detalle de Horas
    SDHE.[ID] AS DetalleHorasId,
		CAST(SDHE.GUID AS NVARCHAR(50)) AS GUID,
    SDHE.GUIDEMPLEADOS AS DetalleHorasGuidEmpleados,
    SDHE.GUIDCONFIGURACIONES AS DetalleHorasGuidConfiguraciones,
    SDHE.MESANIO AS DetalleHorasMesAnio,
    SDHE.QUINCENAMENSUAL AS DetalleHorasQuincenaMensual,
    SDHE.HORAS AS Horas,
    SDHE.HORASEXTRAS AS HorasExtras,
    SDHE.HORASFERIADOS AS HorasFeriados,
    SDHE.DIAS AS Dias,
    SDHE.DIASEXTRAS AS DiasExtras,
    SDHE.DIASFERIADOS AS DiasFeriados,
    SDHE.INASISTENCIAJUSTIFICADA AS InasistenciaJustificada,
    SDHE.INASISTENCIAINJUSTIFICADA AS InasistenciaInjustificada,
    SDHE.ASISTENCIAPERFECTA AS AsistenciaPerfecta,
    SDHE.LICENCIAEXAMEN AS LicenciaExamen,
    SDHE.LICENCIAART AS LicenciaArt,
    SDHE.LICENCIASINGOCE AS LicenciaSinGoce,
    SDHE.LICENCIAFALLECIMIENTO AS LicenciaFallecimiento,
    SDHE.LICENCIAMATERNIDAD AS LicenciaMaternidad,
    SDHE.LICENCIANACIMIENTO AS LicenciaNacimiento,
    SDHE.HORASNOTRABAJADASVACACIONES AS HorasNoTrabajadasVacaciones,
    SDHE.DIASNOTRABAJADOSVACACIONES AS DiasNoTrabajadosVacaciones,
    SDHE.PLUS AS Plus,
    SDHE.ANTICIPOSUELDO AS AnticipoSueldo,
    SDHE.SAC AS Sac,
    SDHE.SACIMPORTE AS SacImporte,
    SDHE.LIQUIDACIONFINAL AS LiquidacionFinal,
    SDHE.PRESENTISMO AS Presentismo,
    SDHE.SUSPENSION AS Suspension,
    SDHE.VACACIONES AS Vacaciones,
    SDHE.VACACIONESDIAS AS VacacionesDias,
    SDHE.FCL AS Fcl,
    SDHE.TOTALHORASSEMESTRE AS TotalHorasSemestre,
    SDHE.TOTALFCLACUMULADO AS TotalFclAcumulado,
    SDHE.NREMUNERATIVO AS NoRemunerativo,
    SDHE.EMBARGOS AS Embargos,
    SDHE.LITIS AS Litis,
    SDHE.PRODUCTIVIDAD AS Productividad,
    SDHE.SEMESTRAL AS Semestral,
    SDHE.MEDIAJORNADA AS MediaJornada,
    SDHE.SACIMPORTEEXENTO AS SacImporteExento,
    SDHE.TIPOLIQUIDACION AS DetalleHorasTipoLiquidacion,

    -- Datos de Recibos
    SR.[ID] AS ReciboId,
    SR.GUID AS ReciboGuid,
    SR.GUIDEMPLEADOS AS ReciboGuidEmpleados,
    SR.GUIDIMPUTACIONES AS ReciboGuidImputaciones,
    SR.GUIDCONFIGURACIONES AS ReciboGuidConfiguraciones,
    SR.GUIDSUELDOSLIQUIDACIONES AS ReciboGuidSueldosLiquidaciones,
    SR.TOTALSUELDOBRUTO AS ReciboTotalSueldoBruto,
    SR.TOTALSUELDONETO AS ReciboTotalSueldoNeto,
    SR.TOTALREMUNERATIVO AS ReciboTotalRemunerativo,
    SR.TOTALREMUNERATIVOEXENTO AS ReciboTotalRemunerativoExento,
    SR.TOTALDESCUENTOS AS ReciboTotalDescuentos,
    SR.TOTALHORAS AS ReciboTotalHoras,
    SR.TOTALHORASEXTRAS AS ReciboTotalHorasExtras,
    SR.TOTALHORASFERIADOS AS ReciboTotalHorasFeriados,
    SR.TOTALDIAS AS ReciboTotalDias,
    SR.TOTALDIASFERIADOS AS ReciboTotalDiasFeriados,
    SR.TOTALSAC AS ReciboTotalSac,
    SR.TOTALVACACIONES AS ReciboTotalVacaciones,
    SR.VALORHORA AS ReciboValorHora,
    SR.VALORMENSUAL AS ReciboValorMensual,
    SR.MESANIO AS ReciboMesAnio,
    SR.QUINCENAMENSUAL AS ReciboQuincenaMensual,
    SR.TOTALREMUNERATIVOANTERIOR AS ReciboTotalRemunerativoAnterior,
    SR.ANTIGUEDAD AS ReciboAntiguedad,
    SR.LIQUIDACIONCERRADA AS ReciboLiquidacionCerrada,
    SR.TOTALTSUELDOBRUTO AS ReciboTotalTSueldoBruto,
    SR.TOTALTREMUNERATIVO AS ReciboTotalTRemunerativo,
    SR.TOTALTREMUNERATIVOEXENTO AS ReciboTotalTRemunerativoExento,
    SR.TOTALTDESCUENTOS AS ReciboTotalTDescuentos,
    SR.TOTALTHORAS AS ReciboTotalTHoras,
    SR.TOTALTHORASEXTRAS AS ReciboTotalTHorasExtras,
    SR.TOTALTHORASFERIADOS AS ReciboTotalTHorasFeriados,
    SR.TOTALTDIAS AS ReciboTotalTDias,
    SR.TOTALTDIASFERIADOS AS ReciboTotalTDiasFeriados,
    SR.PRIORIDAD AS ReciboPrioridad,
    SR.UNIDADES AS ReciboUnidades,
    SR.TIPOLIQUIDACION AS ReciboTipoLiquidacion,
    SR.RECIBOENVIADO AS ReciboEnviado,
    SR.RECIBOGENERADO AS ReciboGenerado,

    -- Datos de Liquidaciones
    SL.[ID] AS LiquidacionId,
    SL.GUID AS LiquidacionGuid,
    SL.GUIDCONFIGURACIONES AS LiquidacionGuidConfiguraciones,
    SL.MESANIO AS LiquidacionMesAnio,
    SL.PERIODOBANCOAPORTE AS LiquidacionPeriodoBancoAporte,
    SL.DEPOSITOBANCOAPORTES AS LiquidacionDepositoBancoAportes,
    SL.FECHADEPOSITOBANCO AS LiquidacionFechaDepositoBanco,
    SL.LIQUIDACIONCERRADA AS LiquidacionCerrada,
    SL.FECHACIERRELIQUIDACION AS LiquidacionFechaCierre,
    SL.TIPOLIQUIDACION AS LiquidacionTipoLiquidacion

FROM
    [dbo].[SueldosDetalleHorasEmpleados] SDHE
    LEFT JOIN [dbo].[Empleados] E
        ON SDHE.GUIDEMPLEADOS = E.GUID
    LEFT JOIN [dbo].[SueldosRecibos] SR
        ON SDHE.GUIDEMPLEADOS = SR.GUIDEMPLEADOS
        AND SDHE.MESANIO = SR.MESANIO
        AND SDHE.GUIDCONFIGURACIONES = SR.GUIDCONFIGURACIONES
        AND (SDHE.QUINCENAMENSUAL = SR.QUINCENAMENSUAL OR SDHE.QUINCENAMENSUAL IS NULL OR SR.QUINCENAMENSUAL IS NULL)
    LEFT JOIN [dbo].[SueldosLiquidaciones] SL
        ON SR.GUIDSUELDOSLIQUIDACIONES = SL.GUID



-- Ejemplos de uso:

-- Ver todos los registros de un periodo específico:
-- SELECT * FROM VW_DetalleHorasRecibosLiquidaciones
-- WHERE DetalleHorasMesAnio = '2024-01-01'

-- Ver solo liquidaciones cerradas:
-- SELECT * FROM VW_DetalleHorasRecibosLiquidaciones
-- WHERE LiquidacionCerrada = 1

-- Ver detalle de un empleado específico:
-- SELECT * FROM VW_DetalleHorasRecibosLiquidaciones
-- WHERE EmpleadoNombre LIKE '%nombre%'

-- Ver liquidaciones por tipo:
-- SELECT * FROM VW_DetalleHorasRecibosLiquidaciones
-- WHERE LiquidacionTipoLiquidacion = 'MENSUAL'

-- Resumen por periodo con totales:
-- SELECT
--     LiquidacionMesAnio,
--     LiquidacionTipoLiquidacion,
--     COUNT(DISTINCT DetalleHorasGuidEmpleados) AS CantidadEmpleados,
--     SUM(ReciboTotalSueldoBruto) AS TotalSueldosBrutos,
--     SUM(ReciboTotalSueldoNeto) AS TotalSueldosNetos
-- FROM VW_DetalleHorasRecibosLiquidaciones
-- WHERE LiquidacionCerrada = 1
-- GROUP BY LiquidacionMesAnio, LiquidacionTipoLiquidacion
-- ORDER BY LiquidacionMesAnio DESC
GO


-- ----------------------------
-- View structure for VistaDetallesRecibos
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[VistaDetallesRecibos]') AND type IN ('V'))
	DROP VIEW [dbo].[VistaDetallesRecibos]
GO

CREATE VIEW [dbo].[VistaDetallesRecibos] AS SELECT
    SRD.GUIDRECIBOS,
    SRD.DESCRIPCION,
    SRD.UNIDADES,
    CASE WHEN SRD.TIPO = 'RE' THEN SRD.IMPORTE ELSE 0 END AS IMPORTEREMUNERATIVO,
    CASE WHEN SRD.TIPO = 'NR' THEN SRD.IMPORTE ELSE 0 END AS IMPORTENOREMUNERATIVO,
    CASE WHEN SRD.TIPO = 'DE' THEN SRD.IMPORTE ELSE 0 END AS IMPORTEDESCUENTO,
    SCV.PRIORIDAD,
    SCV.TIPO
FROM
    [dbo].[SueldosRecibosDetalle] SRD
    LEFT JOIN [dbo].[SueldosConceptosVarios] SCV ON SRD.GUIDCONCEPTOS = SCV.GUID
WHERE 
    SRD.IMPORTE <> 0 -- Si el importe base es 0, los tres derivados serán 0 automáticamente.
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
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [BAN_IDKEY]
ON [dbo].[Bancos] (
  [ID] ASC
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
  [GUIDBANCOS] ASC
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

CREATE NONCLUSTERED INDEX [BCU_NUMEROCUENTAKEY]
ON [dbo].[BancosCuentas] (
  [NUMEROCUENTA] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table BancosCuentas
-- ----------------------------
ALTER TABLE [dbo].[BancosCuentas] ADD CONSTRAINT [PK_BancosCuentas_GUID] PRIMARY KEY CLUSTERED ([GUID])
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
  [GUIDBANCOSCUENTAS] ASC
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
-- Indexes structure for table COMPROBA
-- ----------------------------
CREATE NONCLUSTERED INDEX [CDP_GUIDFACTURASCOMPRASKEY]
ON [dbo].[COMPROBA] (
  [GUIDFACTURASCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CDP_GUIDPROVEEDORESKEY]
ON [dbo].[COMPROBA] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [CDP_IDKEY]
ON [dbo].[COMPROBA] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table COMPROBA
-- ----------------------------
ALTER TABLE [dbo].[COMPROBA] ADD CONSTRAINT [PK__COMPROBA__15B69B8E0BFEEDD0] PRIMARY KEY CLUSTERED ([GUID])
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
  [GUIDBANCOS] ASC
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
CREATE NONCLUSTERED INDEX [CNF_EMPRESAKEY]
ON [dbo].[Configuracion] (
  [NOMBREEMPRESA] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNF_IDKEY]
ON [dbo].[Configuracion] (
  [ID] ASC
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
-- Indexes structure for table CuentaCorrienteProveedor
-- ----------------------------
CREATE NONCLUSTERED INDEX [CCP_GUIDFACTURASCOMPRASKEY]
ON [dbo].[CuentaCorrienteProveedor] (
  [GUIDFACTURASCOMPRAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CCP_GUIDPROVEEDORESKEY]
ON [dbo].[CuentaCorrienteProveedor] (
  [GUIDPROVEEDORES] ASC
)
GO

CREATE NONCLUSTERED INDEX [CCP_IDKEY]
ON [dbo].[CuentaCorrienteProveedor] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table CuentaCorrienteProveedor
-- ----------------------------
ALTER TABLE [dbo].[CuentaCorrienteProveedor] ADD CONSTRAINT [PK__CuentaCo__15B69B8E26B674D1] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
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
-- Indexes structure for table Empleados
-- ----------------------------
CREATE NONCLUSTERED INDEX [EMPL_CUILKEY]
ON [dbo].[Empleados] (
  [CUIL] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_ESTADOKEY]
ON [dbo].[Empleados] (
  [ESTADO] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_FECHANACIMIENTOKEY]
ON [dbo].[Empleados] (
  [FECHANACIMIENTO] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_GUIDCATEGORIASKEY]
ON [dbo].[Empleados] (
  [GUIDCATEGORIAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_GUIDCONFIGURACIONESKEY]
ON [dbo].[Empleados] (
  [GUIDCONFIGURACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_GUIDIMPUTACIONESKEY]
ON [dbo].[Empleados] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_GUIDOBRASSOCIALESKEY]
ON [dbo].[Empleados] (
  [GUIDOBRASSOCIALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_GUIDSINIESTRADOSKEY]
ON [dbo].[Empleados] (
  [GUIDSINIESTRADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_IDKEY]
ON [dbo].[Empleados] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [EMPL_NOMBREKEY]
ON [dbo].[Empleados] (
  [NOMBRE] ASC
)
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
-- Primary Key structure for table FormaPagos
-- ----------------------------
ALTER TABLE [dbo].[FormaPagos] ADD CONSTRAINT [PK__FormaPag__15B69B8ECBF450E2] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Imputacion
-- ----------------------------
ALTER TABLE [dbo].[Imputacion] ADD CONSTRAINT [PK__Imputaci__15B69B8E49061918] PRIMARY KEY CLUSTERED ([GUID])
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

CREATE NONCLUSTERED INDEX [LIC_GUIDORDENDEPAGOKEY]
ON [dbo].[LibroCheques] (
  [GUIDORDENESDEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_GUIDPAGOSRECIBOSKEY]
ON [dbo].[LibroCheques] (
  [GUIDPAGOSRECIBOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [LIC_GUIDRECIBOSKEY]
ON [dbo].[LibroCheques] (
  [GUIDRECIBO] ASC
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
-- Indexes structure for table Modalidad_Contratacion
-- ----------------------------
CREATE NONCLUSTERED INDEX [SMD_IDKEY]
ON [dbo].[Modalidad_Contratacion] (
  [ID] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Modalidad_Contratacion
-- ----------------------------
ALTER TABLE [dbo].[Modalidad_Contratacion] ADD CONSTRAINT [UQ__Modalida__794449EF8E3EB505] UNIQUE NONCLUSTERED ([DESCRIPCION] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Modalidad_Contratacion
-- ----------------------------
ALTER TABLE [dbo].[Modalidad_Contratacion] ADD CONSTRAINT [PK__Modalida__15B69B8E12D47868] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Modulos_Usuarios
-- ----------------------------
ALTER TABLE [dbo].[Modulos_Usuarios] ADD CONSTRAINT [PK__Modulos___15B69B8E9147828A] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table MovimientoArticulos
-- ----------------------------
ALTER TABLE [dbo].[MovimientoArticulos] ADD CONSTRAINT [PK__Movimien__15B69B8E72952B42] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table MovimientoClientes
-- ----------------------------
ALTER TABLE [dbo].[MovimientoClientes] ADD CONSTRAINT [PK__Movimien__15B69B8E23D3E321] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table MovimientoFactuas
-- ----------------------------
ALTER TABLE [dbo].[MovimientoFactuas] ADD CONSTRAINT [PK__Movimien__15B69B8E8EEF6BA3] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
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
  [GUIDBANCOS] ASC
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
-- Indexes structure for table Proveedores_unicos
-- ----------------------------
CREATE NONCLUSTERED INDEX [PRO_GUIDCONFIGURACIONKEY_copy1]
ON [dbo].[Proveedores_unicos] (
  [GUIDCONFIGURACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_GUIDIMPUTACIONESKEY_copy1]
ON [dbo].[Proveedores_unicos] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_IDKEY_copy1]
ON [dbo].[Proveedores_unicos] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_NOMBRE_KEY_copy1]
ON [dbo].[Proveedores_unicos] (
  [NOMBRE] ASC
)
GO

CREATE NONCLUSTERED INDEX [PRO_RUBRO_KEY_copy1]
ON [dbo].[Proveedores_unicos] (
  [RUBRO] ASC
)
GO


-- ----------------------------
-- Uniques structure for table Proveedores_unicos
-- ----------------------------
ALTER TABLE [dbo].[Proveedores_unicos] ADD CONSTRAINT [UQ__Proveedo__9AF05AD606EA22B0] UNIQUE NONCLUSTERED ([GUID] ASC, [CUIT] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table Proveedores_unicos
-- ----------------------------
ALTER TABLE [dbo].[Proveedores_unicos] ADD CONSTRAINT [PK__Proveedo__15B69B8E81FB04F8] PRIMARY KEY CLUSTERED ([GUID])
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
-- Primary Key structure for table Remitos
-- ----------------------------
ALTER TABLE [dbo].[Remitos] ADD CONSTRAINT [PK__Remitos__15B69B8EEBA629FA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table RemitosCambios
-- ----------------------------
ALTER TABLE [dbo].[RemitosCambios] ADD CONSTRAINT [PK__RemitosCambios__15B69B8EEBA627FA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table RemitosCompras
-- ----------------------------
ALTER TABLE [dbo].[RemitosCompras] ADD CONSTRAINT [PK__RemitosC__15B69B8E9BF77C51] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table RemitosDevoluciones
-- ----------------------------
ALTER TABLE [dbo].[RemitosDevoluciones] ADD CONSTRAINT [PK__RemitosDevoluciones__15B69B8EEBA627FA] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
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
-- Indexes structure for table SueldosCategorias
-- ----------------------------
CREATE NONCLUSTERED INDEX [CAT_DESCRIPCIONKEY]
ON [dbo].[SueldosCategorias] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAT_GUIDCONVENIOSKEY]
ON [dbo].[SueldosCategorias] (
  [GUIDCONVENIOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CAT_IDKEY]
ON [dbo].[SueldosCategorias] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosCategorias
-- ----------------------------
ALTER TABLE [dbo].[SueldosCategorias] ADD CONSTRAINT [PK__SueldosC__15B69B8E09B402A4] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosConceptosFormulas
-- ----------------------------
CREATE NONCLUSTERED INDEX [CFOR_DESDEKEY]
ON [dbo].[SueldosConceptosFormulas] (
  [DESDE] ASC
)
GO

CREATE NONCLUSTERED INDEX [CFOR_GUIDCONCEPTOSKEY]
ON [dbo].[SueldosConceptosFormulas] (
  [GUIDCONCEPTOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CFOR_HASTAKEY]
ON [dbo].[SueldosConceptosFormulas] (
  [HASTA] ASC
)
GO

CREATE NONCLUSTERED INDEX [CFOR_IDKEY]
ON [dbo].[SueldosConceptosFormulas] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosConceptosFormulas
-- ----------------------------
ALTER TABLE [dbo].[SueldosConceptosFormulas] ADD CONSTRAINT [PK__SueldosC__15B69B8EBA54F743] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosConceptosPorCategorias
-- ----------------------------
CREATE NONCLUSTERED INDEX [CCAT_CC_KEY]
ON [dbo].[SueldosConceptosPorCategorias] (
  [GUIDCONCEPTOS] ASC,
  [GUIDCATEGORIAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CCAT_GUIDCATEGORIASKEY]
ON [dbo].[SueldosConceptosPorCategorias] (
  [GUIDCATEGORIAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CCAT_GUIDCONCEPTOSKEY]
ON [dbo].[SueldosConceptosPorCategorias] (
  [GUIDCONCEPTOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CCAT_IDKEY]
ON [dbo].[SueldosConceptosPorCategorias] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosConceptosPorCategorias
-- ----------------------------
ALTER TABLE [dbo].[SueldosConceptosPorCategorias] ADD CONSTRAINT [PK__SueldosC__15B69B8E1F22E80C] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosConceptosVarios
-- ----------------------------
CREATE NONCLUSTERED INDEX [CNV_ABREVIACIONKEY]
ON [dbo].[SueldosConceptosVarios] (
  [ABREVIACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNV_DESCRIPCIONKEY]
ON [dbo].[SueldosConceptosVarios] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNV_GUIDCATEGORIASKEY]
ON [dbo].[SueldosConceptosVarios] (
  [GUIDCATEGORIAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNV_GUIDCONVENIOSKEY]
ON [dbo].[SueldosConceptosVarios] (
  [GUIDCONVENIO] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNV_IDKEY]
ON [dbo].[SueldosConceptosVarios] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNV_PRIORIDADKEY]
ON [dbo].[SueldosConceptosVarios] (
  [PRIORIDAD] ASC
)
GO

CREATE NONCLUSTERED INDEX [CNV_TIPOKEY]
ON [dbo].[SueldosConceptosVarios] (
  [TIPO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosConceptosVarios
-- ----------------------------
ALTER TABLE [dbo].[SueldosConceptosVarios] ADD CONSTRAINT [PK__SueldosC__15B69B8E9D60FD0C] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosCondiciones
-- ----------------------------
CREATE NONCLUSTERED INDEX [SCND_DESCRIPCIONKEY]
ON [dbo].[SueldosCondiciones] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [SCND_IDKEY]
ON [dbo].[SueldosCondiciones] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosCondiciones
-- ----------------------------
ALTER TABLE [dbo].[SueldosCondiciones] ADD CONSTRAINT [PK__SueldosC__15B69B8E86B14B66] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosConvenios
-- ----------------------------
CREATE NONCLUSTERED INDEX [SCNV_IDKEY]
ON [dbo].[SueldosConvenios] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [SCNV_NOMBRECONVENIOKEY]
ON [dbo].[SueldosConvenios] (
  [CONVENIO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosConvenios
-- ----------------------------
ALTER TABLE [dbo].[SueldosConvenios] ADD CONSTRAINT [PK__SueldosC__15B69B8E7F1211CD] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosDetalleHorasEmpleados
-- ----------------------------
CREATE NONCLUSTERED INDEX [DHE_GUIDCONFIGURACIONESKEY]
ON [dbo].[SueldosDetalleHorasEmpleados] (
  [GUIDCONFIGURACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [DHE_GUIDEMPLEADOSKEY]
ON [dbo].[SueldosDetalleHorasEmpleados] (
  [GUIDEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [DHE_IDKEY]
ON [dbo].[SueldosDetalleHorasEmpleados] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [DHE_PERIODOKEY]
ON [dbo].[SueldosDetalleHorasEmpleados] (
  [MESANIO] ASC,
  [TIPOLIQUIDACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [DHE_TIPOLIQUIDACIONKEY]
ON [dbo].[SueldosDetalleHorasEmpleados] (
  [TIPOLIQUIDACION] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosDetalleHorasEmpleados
-- ----------------------------
ALTER TABLE [dbo].[SueldosDetalleHorasEmpleados] ADD CONSTRAINT [PK__SueldosD__15B69B8ED3291F59] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosEmpleadosXTareas
-- ----------------------------
CREATE NONCLUSTERED INDEX [EXT_GUIDEMPLEADOSKEY]
ON [dbo].[SueldosEmpleadosXTareas] (
  [GUIDEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [EXT_GUIDSUELDOSTAREASEMPLEADOSKEY]
ON [dbo].[SueldosEmpleadosXTareas] (
  [GUIDSUELDOSTAREASEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [EXT_IDKEY]
ON [dbo].[SueldosEmpleadosXTareas] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosEmpleadosXTareas
-- ----------------------------
ALTER TABLE [dbo].[SueldosEmpleadosXTareas] ADD CONSTRAINT [PK__SueldosE__15B69B8E969C98C2] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosEscalasSalariales
-- ----------------------------
CREATE NONCLUSTERED INDEX [SES_DESDEKEY]
ON [dbo].[SueldosEscalasSalariales] (
  [DESDE] ASC
)
GO

CREATE NONCLUSTERED INDEX [SES_GUIDCATEGORIASKEY]
ON [dbo].[SueldosEscalasSalariales] (
  [GUIDCATEGORIAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SES_IDKEY]
ON [dbo].[SueldosEscalasSalariales] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosEscalasSalariales
-- ----------------------------
ALTER TABLE [dbo].[SueldosEscalasSalariales] ADD CONSTRAINT [PK__ESCALAS __15B69B8EC209B976] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosImputaciones
-- ----------------------------
CREATE NONCLUSTERED INDEX [SIMP_DESCRIPCIONKEY]
ON [dbo].[SueldosImputaciones] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [SIMP_GUIDPLANCUENTASKEY]
ON [dbo].[SueldosImputaciones] (
  [GUIDPLANCUENTAS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SIMP_IDKEY]
ON [dbo].[SueldosImputaciones] (
  [ID] ASC
)
GO


-- ----------------------------
-- Uniques structure for table SueldosImputaciones
-- ----------------------------
ALTER TABLE [dbo].[SueldosImputaciones] ADD CONSTRAINT [UQ__SueldosI__6BF1CF739F22DC3D] UNIQUE NONCLUSTERED ([GUIDCONFIGURACIONES] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table SueldosImputaciones
-- ----------------------------
ALTER TABLE [dbo].[SueldosImputaciones] ADD CONSTRAINT [PK__SueldosI__15B69B8E05FF2544] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosLiquidaciones
-- ----------------------------
CREATE NONCLUSTERED INDEX [SLIQ_GUIDCONFIGURACIONESKEY]
ON [dbo].[SueldosLiquidaciones] (
  [GUIDCONFIGURACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [SLIQ_IDKEY]
ON [dbo].[SueldosLiquidaciones] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosLiquidaciones
-- ----------------------------
ALTER TABLE [dbo].[SueldosLiquidaciones] ADD CONSTRAINT [PK__SueldosL__15B69B8EF26522C6] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosNovedades
-- ----------------------------
CREATE NONCLUSTERED INDEX [NOV_GUIDEMPLEADOSKEY]
ON [dbo].[SueldosNovedades] (
  [GUID] ASC
)
GO

CREATE NONCLUSTERED INDEX [NOV_IDKEY]
ON [dbo].[SueldosNovedades] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosNovedades
-- ----------------------------
ALTER TABLE [dbo].[SueldosNovedades] ADD CONSTRAINT [PK__SueldosN__15B69B8E15A32D8F] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosObrasSociales
-- ----------------------------
CREATE NONCLUSTERED INDEX [OBS_CODIGOKEY]
ON [dbo].[SueldosObrasSociales] (
  [CODIGOOBRASOCIAL] ASC
)
GO

CREATE NONCLUSTERED INDEX [OBS_DESCRIPCIONKEY]
ON [dbo].[SueldosObrasSociales] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [OBS_IDKEY]
ON [dbo].[SueldosObrasSociales] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosObrasSociales
-- ----------------------------
ALTER TABLE [dbo].[SueldosObrasSociales] ADD CONSTRAINT [PK__SueldosO__15B69B8EF5B45C6C] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosRecibos
-- ----------------------------
CREATE NONCLUSTERED INDEX [SREC_GUIDCONFIGURACIONESKEY]
ON [dbo].[SueldosRecibos] (
  [GUIDCONFIGURACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_GUIDEMPLEADOSAKEY]
ON [dbo].[SueldosRecibos] (
  [GUIDEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_GUIDIMPUTACIONESKEY]
ON [dbo].[SueldosRecibos] (
  [GUIDIMPUTACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_GUIDSUELDOSLIQUIDACIONESKEY]
ON [dbo].[SueldosRecibos] (
  [GUIDSUELDOSLIQUIDACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_IDKEY]
ON [dbo].[SueldosRecibos] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_MESANIOKEY]
ON [dbo].[SueldosRecibos] (
  [GUIDCONFIGURACIONES] ASC,
  [MESANIO] ASC,
  [TIPOLIQUIDACION] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_QMKEY]
ON [dbo].[SueldosRecibos] (
  [MESANIO] ASC,
  [QUINCENAMENSUAL] ASC,
  [GUIDEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SREC_TIPOLIQUIDACIONKEY]
ON [dbo].[SueldosRecibos] (
  [TIPOLIQUIDACION] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosRecibos
-- ----------------------------
ALTER TABLE [dbo].[SueldosRecibos] ADD CONSTRAINT [PK__SueldosR__15B69B8EA22D7FE0] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosRecibosDetalle
-- ----------------------------
CREATE NONCLUSTERED INDEX [SRD_GUIDCONCEPTOSKEY]
ON [dbo].[SueldosRecibosDetalle] (
  [GUIDCONCEPTOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SRD_GUIDEMPLEADOSKEY]
ON [dbo].[SueldosRecibosDetalle] (
  [GUIDEMPLEADOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SRD_GUIDRECIBOSKEY]
ON [dbo].[SueldosRecibosDetalle] (
  [GUIDRECIBOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [SRD_IDKEY]
ON [dbo].[SueldosRecibosDetalle] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [SRD_TIPOLIQUIDACIONKEY]
ON [dbo].[SueldosRecibosDetalle] (
  [TIPOLIQUIDACION] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosRecibosDetalle
-- ----------------------------
ALTER TABLE [dbo].[SueldosRecibosDetalle] ADD CONSTRAINT [PK__SueldosR__15B69B8E90E9C9BF] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosSiniestrados
-- ----------------------------
CREATE NONCLUSTERED INDEX [SIN_DESCRIPCIONKEY]
ON [dbo].[SueldosSiniestrados] (
  [DESCRIPCION] ASC
)
GO

CREATE NONCLUSTERED INDEX [SIN_IDKEY]
ON [dbo].[SueldosSiniestrados] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosSiniestrados
-- ----------------------------
ALTER TABLE [dbo].[SueldosSiniestrados] ADD CONSTRAINT [PK__SueldosS__15B69B8E753886F9] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table SueldosTareasEmpleados
-- ----------------------------
CREATE NONCLUSTERED INDEX [TAR_GUIDCONFIGURACIONESKEY]
ON [dbo].[SueldosTareasEmpleados] (
  [GUIDCONFIGURACIONES] ASC
)
GO

CREATE NONCLUSTERED INDEX [TAR_IDKEY]
ON [dbo].[SueldosTareasEmpleados] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table SueldosTareasEmpleados
-- ----------------------------
ALTER TABLE [dbo].[SueldosTareasEmpleados] ADD CONSTRAINT [PK__SueldosT__15B69B8EF701E353] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
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
-- Primary Key structure for table TiposComprobante
-- ----------------------------
ALTER TABLE [dbo].[TiposComprobante] ADD CONSTRAINT [PK__TiposCom__16041FBBDA404997] PRIMARY KEY CLUSTERED ([CODIGOCOMPROBANTEAFIP])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table TiposComprobantesDePagos
-- ----------------------------
CREATE NONCLUSTERED INDEX [TCDP_IDKEY]
ON [dbo].[TiposComprobantesDePagos] (
  [ID] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table TiposComprobantesDePagos
-- ----------------------------
ALTER TABLE [dbo].[TiposComprobantesDePagos] ADD CONSTRAINT [PK__TiposCom__15B69B8EBC6AFD62] PRIMARY KEY CLUSTERED ([GUID])
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
-- Indexes structure for table TransferenciasBancos
-- ----------------------------
CREATE NONCLUSTERED INDEX [TRB_GUIDBANCOKEY]
ON [dbo].[TransferenciasBancos] (
  [GUIDBANCOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [TRB_GUIDCUENTABANCOKEY]
ON [dbo].[TransferenciasBancos] (
  [GUIDCUENTABANCO] ASC
)
GO

CREATE NONCLUSTERED INDEX [TRB_GUIDORDENESDEPAGOKEY]
ON [dbo].[TransferenciasBancos] (
  [GUIDORDENESDEPAGO] ASC
)
GO

CREATE NONCLUSTERED INDEX [TRB_GUIDPAGOSRECIBOSKEY]
ON [dbo].[TransferenciasBancos] (
  [GUIDPAGOSRECIBOS] ASC
)
GO

CREATE NONCLUSTERED INDEX [TRB_GUIDRECIBOKEY]
ON [dbo].[TransferenciasBancos] (
  [GUIDRECIBO] ASC
)
GO

CREATE NONCLUSTERED INDEX [TRB_IDKEY]
ON [dbo].[TransferenciasBancos] (
  [ID] ASC
)
GO

CREATE NONCLUSTERED INDEX [TRB_NOMBREBANCOKEY]
ON [dbo].[TransferenciasBancos] (
  [NOMBREBANCO] ASC
)
GO


-- ----------------------------
-- Primary Key structure for table TransferenciasBancos
-- ----------------------------
ALTER TABLE [dbo].[TransferenciasBancos] ADD CONSTRAINT [PK__Transfer__15B69B8EF6F764DF] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


-- ----------------------------
-- Indexes structure for table Usuarios
-- ----------------------------
CREATE NONCLUSTERED INDEX [USU_GUIDSUCURSALESKEY]
ON [dbo].[Usuarios] (
  [GUIDSUCURSALES] ASC
)
GO

CREATE NONCLUSTERED INDEX [USU_USUARIO_KEY]
ON [dbo].[Usuarios] (
  [CODIGOUSUARIO] ASC
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
-- Primary Key structure for table Vendedores
-- ----------------------------
ALTER TABLE [dbo].[Vendedores] ADD CONSTRAINT [PK__Vendedor__15B69B8EFA8A0751] PRIMARY KEY CLUSTERED ([GUID])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO

