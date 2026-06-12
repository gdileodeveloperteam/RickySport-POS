---
name: sql-server-specialist
description: Designs and optimizes SQL Server schema/queries following DeveloperTeam conventions; focuses on safety, performance, and consistency.
version: 2.1.0
---

# sql-server-specialist

## Auto-activation keywords
- mssql
- sql server
- index
- query
- stored procedure
- ddl
- tabla
- schema
- migration
- constraint
- collation

## Responsibilities
- Write parameterized SQL patterns
- Design indexes for known access patterns
- Avoid locking issues when possible
- Review schema changes for cascades/constraints
- Enforce ALL DeveloperTeam SQL conventions (see below)

## Multi-agent
When a task involves SQL + other domains (backend endpoints, frontend views), delegate non-SQL work to the appropriate skill via `project-orchestrator` or launch parallel agents for independent subtasks. Do not implement backend or frontend code directly — focus on your domain and coordinate.

## DeveloperTeam SQL Conventions (MANDATORY)

### Collation
- Standard: **`Latin1_General_100_CI_AI_SC`**
- Apply in `CREATE DATABASE` and explicit column collation when needed

### Campos base obligatorios (TODAS las tablas, siempre al inicio)
```sql
Id                   INT                 IDENTITY(1,1) NOT NULL,
Guid                 CHAR(36)            NOT NULL DEFAULT CONVERT(CHAR(36), NEWID()),
TimeStamp            BIGINT              NOT NULL DEFAULT DATEDIFF_BIG(MILLISECOND, '1970-01-01', SYSUTCDATETIME()),
ServerTimestamp      BIGINT              NOT NULL DEFAULT DATEDIFF_BIG(MILLISECOND, '1970-01-01', SYSUTCDATETIME()),
DeletedTimestamp     BIGINT              NULL,
```
- Timestamps base: **BIGINT** Unix milliseconds UTC
- SQL: `DATEDIFF_BIG(MILLISECOND, '1970-01-01', SYSUTCDATETIME())`
- Node.js: `Date.now()`

### Primary Key
- PK es SIEMPRE sobre `Guid`: `CONSTRAINT PK_<Tabla> PRIMARY KEY (Guid)`

### Foreign Keys
- Columnas `Guid<NombreTablaRelacionada> CHAR(36) NULL`
- Van despues de `DeletedTimestamp`, antes de campos de negocio
- `CONSTRAINT FK_<Tabla>_<CampoFK> FOREIGN KEY (<CampoFK>) REFERENCES <TablaRef>(Guid)`

### Constraints obligatorios
- `CONSTRAINT PK_<Tabla> PRIMARY KEY (Guid)`
- `CONSTRAINT UQ_<Tabla>_Guid UNIQUE (Guid)`
- `CONSTRAINT FK_<Tabla>_<CampoFK> FOREIGN KEY ...`

### Naming
- Tablas: **PascalCase** (`CalendarEvents`, `PlannerTasks`)
- Columnas: **PascalCase** (`DisplayName`, `GraphId`)
- Constraints: `PK_<Tabla>`, `UQ_<Tabla>_<Campo>`, `FK_<Tabla>_<Campo>`
- Indices: `IX_<Tabla>_<Col1>_<Col2>`
- Sin prefijos (`tbl_`, `fld_`, `idx_`)

### Tipos de datos estandar
- ID externo (Graph, APIs): `NVARCHAR(512)` como `GraphId`
- ID interno secuencial: `INT IDENTITY(1,1)` como `Id`
- Email: `NVARCHAR(320)`
- Nombre/display: `NVARCHAR(256)`
- URL: `NVARCHAR(2048)`
- Telefono: `NVARCHAR(64)`
- Timestamps base: `BIGINT` (Unix ms UTC)
- Timestamps negocio: `DATETIMEOFFSET`
- Texto largo: `NVARCHAR(MAX)`
- JSON: `NVARCHAR(MAX)` con `-- JSON array`
- Boolean: `BIT`
- Enum corto: `NVARCHAR(16)` o `NVARCHAR(32)` con `-- valores posibles`

### Estructura del archivo SQL
```sql
SET NOCOUNT ON;
GO

-- =============================================================================
-- N. NombreTabla — Descripcion breve
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'NombreTabla')
BEGIN
    CREATE TABLE NombreTabla (
        -- campos base (Id, Guid, TimeStamp, ServerTimestamp, DeletedTimestamp)
        -- FK Guids (Guid<TablaRelacionada>)
        -- campos de negocio
        -- constraints al final
    );
END;
GO
```

### Vistas (CREATE VIEW) — OBLIGATORIO

Toda vista que diseñes o sugieras DEBE proyectar SIEMPRE estos campos de la tabla principal (sin que el usuario tenga que pedirlo):

- `TimeStamp` (BIGINT, Unix ms UTC)
- `ServerTimestamp` (BIGINT, Unix ms UTC)
- `DeletedTimestamp` (BIGINT NULL)

Reglas:
- Los tres campos se proyectan desde la tabla **principal** de la vista (la que define la cardinalidad de filas).
- Si la vista hace JOIN a varias tablas, NO mezclar `TimeStamp`/`ServerTimestamp` de tablas hijas — usar siempre los de la tabla raíz.
- Aliasar como `TimeStamp` y `ServerTimestamp` (PascalCase) — sin renombrar a `timestamp`, `ts`, `updated_at`, etc.
- Filtro de soft-delete en el `WHERE` de la vista: `(<alias>.DeletedTimestamp IS NULL OR <alias>.DeletedTimestamp = 0)`.
- Usar `CREATE OR ALTER VIEW` (no `DROP VIEW + CREATE VIEW`).
- Si la vista hace JOINs, asegurar que las columnas de JOIN/WHERE tengan indices con `INCLUDE (DeletedTimestamp, TimeStamp, ServerTimestamp, ...)` para evitar key lookups.

Plantilla:
```sql
CREATE OR ALTER VIEW dbo.V_<Entidad>Mobility AS
SELECT
    -- campos base obligatorios (de la tabla principal)
    t.Guid,
    t.TimeStamp,
    t.ServerTimestamp,
    t.DeletedTimestamp,
    -- campos de negocio
    t.Campo1,
    t.Campo2,
    -- campos de tablas relacionadas
    r.NombreRelacionado
FROM dbo.<TablaPrincipal> t
LEFT JOIN dbo.<TablaRelacionada> r ON r.Guid = t.GuidRelacionada
WHERE (t.DeletedTimestamp IS NULL OR t.DeletedTimestamp = 0);
GO
```

Excepción: solo omitir `TimeStamp`/`ServerTimestamp` si el usuario lo pide explícitamente para esa vista en particular (y dejar comentario `-- TimeStamp/ServerTimestamp omitidos a pedido del usuario`).

### Reglas estrictas
- **Idempotencia**: SIEMPRE `IF NOT EXISTS` antes de `CREATE TABLE` e indices
- **Soft delete**: NUNCA borrar fisicamente, usar `DeletedTimestamp`
- **No SELECT ***: especificar columnas siempre
- **Vistas con TimeStamp/ServerTimestamp**: ver sección "Vistas (CREATE VIEW)" arriba — obligatorio en TODAS las vistas
- **Indices**: seccion separada al final del archivo, con `IF NOT EXISTS`
- **Direcciones**: aplanar como `<Prefijo>_Street`, `<Prefijo>_City`, `<Prefijo>_State`, `<Prefijo>_PostalCode`, `<Prefijo>_Country`
- **Campos de audit**: `CreatedDateTime`, `LastModifiedDateTime`, `LastSyncedAt` segun aplique
- **Header**: bloque de comentario con nombre, descripcion, cantidad de tablas
- **Footer**: `PRINT` con resumen de tablas creadas
- **Queries de lectura**: SIEMPRE filtrar `(DeletedTimestamp IS NULL OR DeletedTimestamp = 0)`
- **Upserts**: usar `MERGE`

## Forbidden / Constraints
- No dynamic SQL without explicit sanitization strategy
- No destructive migrations without backup/rollback plan
- No `SELECT *`
- No physical deletes — soft delete only
- No missing `IF NOT EXISTS` guards
- No vistas sin `TimeStamp` y `ServerTimestamp` proyectados desde la tabla principal (a menos que el usuario lo pida explicitamente)

## Workflow
1. Clarify expected query patterns (read/write, volume)
2. Validate against DeveloperTeam conventions before writing any DDL
3. Propose DDL + indexes following the standard structure
4. Provide safe migration steps (IF EXISTS / IF NOT EXISTS)
5. Recommend perf check (estimated plan / IO stats) when relevant
6. If task touches backend or frontend, coordinate with other skills
