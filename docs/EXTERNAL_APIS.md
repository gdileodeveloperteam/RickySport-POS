# APIs y Endpoints Externos — RickySport POS

> Ultima actualizacion: 2026-04-08
> Version: 1.1.0

## Integraciones activas

### ARCA (Facturacion electronica AFIP)
- **Base URL**: Base de datos MySQL local (`gestionweb_dev`)
- **Autenticacion**: Conexion directa MySQL (credenciales en `.env`)
- **Variables de entorno**: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DB`, `MYSQL_USER`, `MYSQL_PASSWORD`
- **Operaciones**:
  | Metodo | Operacion | Descripcion | Archivo |
  |---|---|---|---|
  | POST | Autorizar factura | Busca/crea cliente en MySQL y carga factura + movimientos | `src/db/repositories/arcaRepo.js` |
- **Tablas MySQL utilizadas**: `clientes`, `comprobantes`, `comprobantes_movimientos`, `configuraciones`
- **Flujo**: La app genera la factura en SQL Server, luego sincroniza datos al sistema ARCA via MySQL para facturacion electronica ante AFIP
- **Docs**: Sistema propietario (GestionWeb)

## Integraciones internas

### SQL Server (Base de datos principal)
- **Host**: Configurado via `DB_SERVER`
- **Base de datos**: `RickyDepor`
- **Driver**: `mssql` (Node.js)
- **Archivo de conexion**: `src/db/pool.js`

### MySQL (ARCA / GestionWeb)
- **Host**: Configurado via `MYSQL_HOST`
- **Base de datos**: `gestionweb_dev`
- **Driver**: `mysql2`
- **Archivo de conexion**: `src/db/mysqlPool.js`
