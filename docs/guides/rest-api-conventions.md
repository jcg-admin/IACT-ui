# REST API Conventions — IACT

Convenciones de diseño de URLs para los endpoints del backend IACT,
basadas en OpenAPI 3.0 / OAS3 y RFC 3986.

## Regla principal: URLs son recursos, no acciones

```
✅  POST   /api/access/function-assignments        ← sustantivo
✅  DELETE /api/access/function-assignments/{id}   ← sustantivo + HTTP method
✅  POST   /api/access/separation-rules/validate   ← recurso + sub-acción

❌  POST   /api/access/functions/assign            ← verbo como path segment
❌  POST   /api/access/validate-sod                ← verbo + acrónimo
❌  GET    /api/access/revoke-permissions           ← verbo como path segment
```

## Estructura de URL base (OAS3)

```
https://api.example.com/v1/users?role=admin
\______________________/\__/\___/\________/
       server URL       ver recurso  query params
```

El servidor base se declara en `REACT_APP_API_URL`. Todos los paths
son relativos a esa base.

## Convenciones de naming para paths

### Sustantivos en plural para colecciones

```
GET  /access/functions              ← lista de funciones
GET  /access/functions/{id}         ← función individual
POST /access/functions              ← crear función
```

### Kebab-case para recursos multi-palabra

```
✅  /access/separation-rules
✅  /access/function-assignments
✅  /access/function-groups
❌  /access/separationRules         ← camelCase no aplica a URLs
❌  /access/separation_rules        ← snake_case no es estándar web
```

### Sin acrónimos de dominio en paths

Las mismas reglas de naming que para identificadores de código aplican
a los paths de URL:

```
✅  /access/separation-rules/validate
❌  /access/validate-sod
❌  /access/sod-rules
```

### Acciones no-CRUD: sub-recursos o verbo calificador

Para operaciones que no son CRUD puro, usar un sub-recurso o un
verbo calificador como último segmento:

```
✅  POST /access/separation-rules/validate    ← validar reglas
✅  POST /access/audit-exports                ← crear una exportación
✅  POST /access/sessions/revoke              ← revocar sesiones activas
```

### HTTP method expresa la acción

| Acción | HTTP Method | Ejemplo |
|--------|-------------|---------|
| Crear | `POST` | `POST /access/function-assignments` |
| Leer lista | `GET` | `GET /access/functions` |
| Leer uno | `GET` | `GET /access/functions/{id}` |
| Actualizar completo | `PUT` | `PUT /access/functions/{id}` |
| Actualizar parcial | `PATCH` | `PATCH /access/functions/{id}` |
| Eliminar | `DELETE` | `DELETE /access/function-assignments/{id}` |

## Mapa de URLs correctas — módulo Access

| Operación | URL actual | URL correcta | Estado |
|-----------|-----------|-------------|--------|
| Validar separación de funciones | `POST /access/validate-sod` | `POST /access/separation-rules/validate` | ✅ Corregido |
| Asignar función a usuario | `POST /access/functions/assign` | `POST /access/function-assignments` | ⏳ TD-ACC-01 |
| Revocar función | `POST /access/functions/revoke` | `DELETE /access/function-assignments/{id}` | ⏳ TD-ACC-02 |
| Exportar auditoría | `POST /access/audit/export` | `POST /access/audit-exports` | ⏳ TD-ACC-03 |
| Asignar grupo de funciones | `POST /access/function-groups/assign` | `POST /access/function-group-assignments` | ⏳ TD-ACC-04 |
| Asignar segmento | `POST /access/segments/assign` | `POST /access/segment-assignments` | ⏳ TD-ACC-05 |

Los ítems `⏳ TD-ACC-*` son deuda técnica — requieren cambio coordinado
con el backend. No modificar en el frontend sin alinear con el equipo backend.

## Query parameters

Los filtros y la paginación van como query params, nunca en el path:

```
✅  GET /access/functions?category=audit&state=active
✅  GET /users?state=ACTIVE&page=2&limit=25
❌  GET /access/functions/active            ← estado como path segment
❌  GET /users/state/ACTIVE                 ← filtro como path segment
```

## Versionado

El prefijo de versión va en el servidor base (`/api/v1/`), no en cada path:

```
✅  server: https://api.example.com/v1
    path:   /access/functions

❌  path:   /v1/access/functions    ← versión repetida en cada path
```

## Referencias

- OpenAPI 3.0 Server Object: https://spec.openapis.org/oas/v3.0.3#server-object
- RFC 3986 — Uniform Resource Identifier (URI): Generic Syntax
- REST API Design Best Practices (Roy Fielding, 2000)
- `src/services/accessService.js` — implementación actual (ver TD-ACC-01..05)
