# Project Rules — [NOMBRE_PROYECTO]

> Este archivo se coloca en la raiz de cada proyecto como `CLAUDE.md`.
> Complementa los estandares globales con reglas especificas del proyecto.

---

## Jerarquia de reglas

1. **Global CLAUDE.md** (`~/.claude/CLAUDE.md`) — Siempre aplica, tiene prioridad en conflictos
2. **Este archivo** — Reglas especificas del proyecto que extienden (no contradicen) las globales

Si hay conflicto entre este archivo y el global, el global GANA.

---

## Cumplimiento de estandares globales

Este proyecto cumple con TODOS los estandares globales:

- SQL Server: campos base, naming PascalCase, constraints, soft delete, idempotencia
- Node.js: route → service → repository, async/await, manejo centralizado de errores
- Paginacion: siempre server-side con formato estandar
- Seguridad: validacion de inputs, sin secrets hardcodeados, prevencion de inyecciones
- Skills: uso obligatorio del skill que aplique al dominio
- Git: branches obligatorios, PRs obligatorios, nunca commit a main

---

## Contexto del proyecto

<!-- PERSONALIZAR: Describir el proposito y contexto del proyecto -->

- **Descripcion**: [Que hace este proyecto]
- **Stack**: Node.js + Express + SQL Server + Bootstrap 5.3
- **Repositorio**: [URL del repo]

---

## Estructura del proyecto

<!-- PERSONALIZAR: Ajustar segun la estructura real del proyecto -->

```
src/
  api/
    routes/          # Un archivo por dominio
    middleware/       # Auth, error handling, validation
  db/
    repositories/    # Un archivo por entidad
    pool.js          # Conexion a SQL Server
  services/          # Logica de negocio
  utils/             # Helpers compartidos (guidHelper, etc.)
public/
  js/
    api.js           # API client (IIFE)
    app.js           # Views y render functions
  css/
  index.html
```

---

## Reglas especificas del proyecto

<!-- PERSONALIZAR: Agregar reglas que solo apliquen a este proyecto -->

### Entidades principales

<!-- Listar las entidades del dominio y sus relaciones -->

### APIs externas

<!-- Documentar integraciones con APIs externas: Microsoft Graph, etc. -->

### Variables de entorno requeridas

<!-- Listar las variables que el proyecto necesita en .env -->

```
DB_SERVER=
DB_NAME=
DB_USER=
DB_PASSWORD=
PORT=
```

---

## Routing de skills

Seleccionar automaticamente el skill correcto segun la tarea:

| Tarea | Skill |
|---|---|
| Crear/modificar tablas o queries SQL | `sql-server-specialist` |
| Implementar endpoints o servicios | `node-backend-architect` |
| Crear/modificar vistas o componentes UI | `frontend-bootstrap-designer` |
| Cambios en auth, inputs, secrets | `security-reviewer` |
| Correr tests, lint o build | `test-runner` |
| Documentar cambios realizados | `change-summary-writer` |
| Revisar calidad y eficiencia | `simplify` |
| Tareas multi-dominio | `project-orchestrator` |
| Integracion con Claude API | `claude-api` |

---

## Versionamiento

- Archivo de version: `src/version.js`
- Endpoint: `GET /api/health` → `{ "version": "x.y.z", "name": "[NOMBRE_PROYECTO]" }`
- Version visible en el frontend (footer/navbar)
- Incrementar en CADA cambio funcional

## Documentacion viviente

Estos documentos DEBEN existir y mantenerse actualizados:

- `docs/ENV_VARIABLES.md` — Todas las variables de entorno
- `docs/EXTERNAL_APIS.md` — Todas las APIs y endpoints externos

Ver formato detallado en el CLAUDE.md global.

---

## Consistencia de datos y API

- Todas las respuestas API siguen el formato de paginacion estandar
- SIEMPRE filtrar `DeletedTimestamp IS NULL` en queries de lectura
- Mantener consistencia con los patrones existentes del proyecto
- No romper funcionalidad existente sin autorizacion explicita
- Backward compatibility por defecto

---

## Flujo de ejecucion

Antes de ejecutar cualquier tarea:

1. Identificar el dominio (SQL, backend, frontend, seguridad)
2. Seleccionar el skill correcto
3. Leer el codigo existente relevante antes de modificar
4. Validar que los cambios cumplen estandares globales + proyecto
5. Entregar codigo completo, con validacion y error handling
6. Crear branch y PR

---

## Checklist de completitud

Una tarea NO esta completa hasta que:

- [ ] Codigo implementado completamente (sin TODOs)
- [ ] Validacion de inputs incluida
- [ ] Manejo de errores incluido
- [ ] Consistente con la arquitectura existente
- [ ] Branch creado y pusheado
- [ ] Pull Request creado con titulo y descripcion

---

## Prohibido en este proyecto

- Saltarse Pull Requests
- Romper funcionalidad existente
- Ignorar estandares globales o del proyecto
- Respuestas API con formato inconsistente
- Codigo parcial o con placeholders
