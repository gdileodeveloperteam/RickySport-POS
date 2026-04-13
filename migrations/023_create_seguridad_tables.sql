SET NOCOUNT ON;
GO

-- =============================================================================
-- 23. Seguridad — Estructura (6 tablas + ALTER Usuarios + indices)
--     Fase 1 del sistema de permisos (ver docs/PERMISOS.md)
--
--     Tablas creadas:
--       Modulos                   — catalogo de modulos del sistema
--       Roles                     — roles (Usuario, Supervisor_1..10, Admin)
--       Roles_Modulos             — nivel de acceso por rol x modulo (0..4)
--       Roles_PermisosEspeciales  — permisos especiales por rol
--       AuditoriaSeguridad        — cambios en config de seguridad
--       AuditoriaAcciones         — uso de permisos especiales (OK/DENIED)
--
--     Modificaciones:
--       Usuarios.GUIDROLES        — FK al rol asignado
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Modulos — catalogo (21 codigos internos) - no administrable desde la UI
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Modulos')
BEGIN
    CREATE TABLE Modulos (
        GUID              CHAR(16)      NOT NULL,
        CODIGO            INT IDENTITY(1,1) NOT NULL,
        CODIGO_INTERNO    NVARCHAR(64)  NOT NULL,
        NOMBRE            NVARCHAR(100) NOT NULL,
        ORDEN             SMALLINT      NULL,

        ts                FLOAT         NULL,
        sts               FLOAT         NULL,
        dts               FLOAT         NULL,

        CONSTRAINT PK_Modulos PRIMARY KEY (GUID),
        CONSTRAINT UQ_Modulos_Guid UNIQUE (GUID),
        CONSTRAINT UQ_Modulos_CodigoInterno UNIQUE (CODIGO_INTERNO)
    );
END;
GO

-- -----------------------------------------------------------------------------
-- Roles — 12 roles fijos (Usuario, Supervisor_1..10, Admin)
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        GUID              CHAR(16)      NOT NULL,
        CODIGO            INT IDENTITY(1,1) NOT NULL,
        NOMBRE            NVARCHAR(50)  NOT NULL,
        TIPO              NVARCHAR(20)  NOT NULL,
        ES_SISTEMA        BIT           NOT NULL DEFAULT 0,
        DESCRIPCION       NVARCHAR(200) NULL,

        ts                FLOAT         NULL,
        sts               FLOAT         NULL,
        dts               FLOAT         NULL,

        CONSTRAINT PK_Roles PRIMARY KEY (GUID),
        CONSTRAINT UQ_Roles_Guid UNIQUE (GUID),
        CONSTRAINT UQ_Roles_Nombre UNIQUE (NOMBRE),
        CONSTRAINT CK_Roles_Tipo CHECK (TIPO IN ('USUARIO','SUPERVISOR','ADMIN'))
    );
END;
GO

-- -----------------------------------------------------------------------------
-- Roles_Modulos — nivel por rol x modulo (0=sin, 1=lectura, 2=+crear, 3=+editar, 4=+eliminar)
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Roles_Modulos')
BEGIN
    CREATE TABLE Roles_Modulos (
        GUID              CHAR(16)      NOT NULL,
        GUIDROLES         CHAR(16)      NOT NULL,
        CODIGO_MODULO     INT           NOT NULL,
        NIVEL             TINYINT       NOT NULL DEFAULT 0,

        ts                FLOAT         NULL,
        sts               FLOAT         NULL,
        dts               FLOAT         NULL,

        CONSTRAINT PK_RolesModulos PRIMARY KEY (GUID),
        CONSTRAINT UQ_RolesModulos_Guid UNIQUE (GUID),
        CONSTRAINT UQ_RolesModulos_RolModulo UNIQUE (GUIDROLES, CODIGO_MODULO),
        CONSTRAINT CK_RolesModulos_Nivel CHECK (NIVEL BETWEEN 0 AND 4)
    );
END;
GO

-- -----------------------------------------------------------------------------
-- Roles_PermisosEspeciales — permisos puntuales (solo SUPERVISOR/ADMIN)
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Roles_PermisosEspeciales')
BEGIN
    CREATE TABLE Roles_PermisosEspeciales (
        GUID              CHAR(16)     NOT NULL,
        GUIDROLES         CHAR(16)     NOT NULL,
        CODIGO            NVARCHAR(64) NOT NULL,

        ts                FLOAT        NULL,
        sts               FLOAT        NULL,
        dts               FLOAT        NULL,

        CONSTRAINT PK_RolesPermisosEspeciales PRIMARY KEY (GUID),
        CONSTRAINT UQ_RolesPermisosEspeciales_Guid UNIQUE (GUID),
        CONSTRAINT UQ_RolesPermisosEspeciales_RolCodigo UNIQUE (GUIDROLES, CODIGO)
    );
END;
GO

-- -----------------------------------------------------------------------------
-- AuditoriaSeguridad — cambios sobre roles, permisos y asignaciones
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AuditoriaSeguridad')
BEGIN
    CREATE TABLE AuditoriaSeguridad (
        GUID              CHAR(16)       NOT NULL,
        GUIDUSUARIOS      CHAR(16)       NOT NULL,
        ENTIDAD           NVARCHAR(30)   NOT NULL,
        GUIDENTIDAD       CHAR(16)       NULL,
        ACCION            NVARCHAR(20)   NOT NULL,
        ANTES_JSON        NVARCHAR(MAX)  NULL,
        DESPUES_JSON      NVARCHAR(MAX)  NULL,
        FECHA             DATETIME       NOT NULL DEFAULT GETDATE(),
        IP                NVARCHAR(64)   NULL,

        ts                FLOAT          NULL,
        sts               FLOAT          NULL,
        dts               FLOAT          NULL,

        CONSTRAINT PK_AuditoriaSeguridad PRIMARY KEY (GUID),
        CONSTRAINT UQ_AuditoriaSeguridad_Guid UNIQUE (GUID),
        CONSTRAINT CK_AuditoriaSeguridad_Entidad CHECK (ENTIDAD IN ('ROL','ROL_MODULO','ROL_PERMISO','USUARIO_ROL')),
        CONSTRAINT CK_AuditoriaSeguridad_Accion  CHECK (ACCION IN ('CREAR','EDITAR','ELIMINAR','ASIGNAR','COPIAR'))
    );
END;
GO

-- -----------------------------------------------------------------------------
-- AuditoriaAcciones — intervenciones que usan permisos especiales
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AuditoriaAcciones')
BEGIN
    CREATE TABLE AuditoriaAcciones (
        GUID              CHAR(16)       NOT NULL,
        GUIDUSUARIOS      CHAR(16)       NOT NULL,
        CODIGOPERMISO     NVARCHAR(64)   NOT NULL,
        ENTIDAD           NVARCHAR(30)   NULL,
        GUIDENTIDAD       CHAR(16)       NULL,
        RESULTADO         NVARCHAR(20)   NOT NULL DEFAULT 'OK',
        DETALLE_JSON      NVARCHAR(MAX)  NULL,
        FECHA             DATETIME       NOT NULL DEFAULT GETDATE(),
        IP                NVARCHAR(64)   NULL,

        ts                FLOAT          NULL,
        sts               FLOAT          NULL,
        dts               FLOAT          NULL,

        CONSTRAINT PK_AuditoriaAcciones PRIMARY KEY (GUID),
        CONSTRAINT UQ_AuditoriaAcciones_Guid UNIQUE (GUID),
        CONSTRAINT CK_AuditoriaAcciones_Resultado CHECK (RESULTADO IN ('OK','DENIED'))
    );
END;
GO

-- -----------------------------------------------------------------------------
-- Usuarios — ALTER para agregar GUIDROLES
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'GUIDROLES' AND Object_ID = Object_ID(N'Usuarios'))
BEGIN
    ALTER TABLE Usuarios ADD GUIDROLES CHAR(16) NULL;
END;
GO

-- -----------------------------------------------------------------------------
-- Indices
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Usuarios_GuidRoles' AND object_id = OBJECT_ID('Usuarios'))
    CREATE INDEX IX_Usuarios_GuidRoles ON Usuarios (GUIDROLES);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RolesModulos_GuidRoles' AND object_id = OBJECT_ID('Roles_Modulos'))
    CREATE INDEX IX_RolesModulos_GuidRoles ON Roles_Modulos (GUIDROLES);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RolesPermisosEspeciales_GuidRoles' AND object_id = OBJECT_ID('Roles_PermisosEspeciales'))
    CREATE INDEX IX_RolesPermisosEspeciales_GuidRoles ON Roles_PermisosEspeciales (GUIDROLES);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaSeguridad_Fecha' AND object_id = OBJECT_ID('AuditoriaSeguridad'))
    CREATE INDEX IX_AuditoriaSeguridad_Fecha ON AuditoriaSeguridad (FECHA DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaSeguridad_GuidUsuarios' AND object_id = OBJECT_ID('AuditoriaSeguridad'))
    CREATE INDEX IX_AuditoriaSeguridad_GuidUsuarios ON AuditoriaSeguridad (GUIDUSUARIOS);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaAcciones_Fecha' AND object_id = OBJECT_ID('AuditoriaAcciones'))
    CREATE INDEX IX_AuditoriaAcciones_Fecha ON AuditoriaAcciones (FECHA DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaAcciones_GuidUsuarios' AND object_id = OBJECT_ID('AuditoriaAcciones'))
    CREATE INDEX IX_AuditoriaAcciones_GuidUsuarios ON AuditoriaAcciones (GUIDUSUARIOS);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditoriaAcciones_Codigo' AND object_id = OBJECT_ID('AuditoriaAcciones'))
    CREATE INDEX IX_AuditoriaAcciones_Codigo ON AuditoriaAcciones (CODIGOPERMISO);
GO

PRINT 'Migracion 023 completada: 6 tablas de seguridad creadas + Usuarios.GUIDROLES + 8 indices';
GO
