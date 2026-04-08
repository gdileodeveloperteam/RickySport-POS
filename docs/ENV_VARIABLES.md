# Variables de Entorno — RickySport POS

> Ultima actualizacion: 2026-04-08
> Version: 1.1.0

## Requeridas

| Variable | Descripcion | Ejemplo | Donde se usa |
|---|---|---|---|
| DB_SERVER | SQL Server host | `localhost` | `src/db/pool.js` |
| DB_NAME | Nombre de la base de datos SQL Server | `RickyDepor` | `src/db/pool.js` |
| DB_USER | Usuario de BD SQL Server | `sa` | `src/db/pool.js` |
| DB_PASSWORD | Password de BD SQL Server | `***` | `src/db/pool.js` |
| DB_PORT | Puerto de SQL Server | `1433` | `src/db/pool.js` |
| PORT | Puerto del servidor Express | `4000` | `src/server.js` |

## Opcionales

| Variable | Descripcion | Default | Donde se usa |
|---|---|---|---|
| MYSQL_HOST | Host de MySQL (ARCA facturacion) | `localhost` | `src/db/mysqlPool.js` |
| MYSQL_PORT | Puerto de MySQL | `3306` | `src/db/mysqlPool.js` |
| MYSQL_DB | Base de datos MySQL | `gestionweb_dev` | `src/db/mysqlPool.js` |
| MYSQL_USER | Usuario de MySQL | (vacio) | `src/db/mysqlPool.js` |
| MYSQL_PASSWORD | Password de MySQL | (vacio) | `src/db/mysqlPool.js` |
| MAX_DESCUENTO_PORCENTAJE | Descuento maximo permitido en ventas (%) | `10` | `src/api/routes/configRoutes.js` |
