```yaml
created_at: 2026-05-05 08:15:00
project: IACT-UI
phase: Phase 11 — TRACK
```

# Lessons Learned — iact-ui-context-cleanup-and-setup

## L-IACT-UI-001 — Contexto foráneo en merge de ramas

**Categoría:** Git / Integración  
**Severidad:** Media

**Qué pasó:** Al hacer merge con la rama `develop`, el directorio
`.thyrox/context/` con 238+ archivos de proyectos ajenos (IACT-docs, THYROX)
fue incluido automáticamente sin revisión.

**Causa raíz:** La rama `develop` contenía el framework THYROX completo con
contexto de sesiones anteriores. El merge automático de git no discrimina
entre código del proyecto e infraestructura de gestión.

**Aprendizaje:** Antes de hacer merge desde una rama base nueva, revisar
explícitamente los directorios de configuración y framework (`.thyrox/`,
`.claude/`) para verificar que el contenido corresponde al proyecto actual.

**Acción preventiva:** Añadir al proceso de review de PRs una verificación
de que `.thyrox/context/project-state.md` tiene `project: IACT-UI`.

---

## L-IACT-UI-002 — Bugs de Rules of Hooks en componentes TypeScript

**Categoría:** React / TypeScript  
**Severidad:** Alta

**Qué pasó:** `PermissionGate.tsx` y `ProtectedRoute.tsx` tenían `useEffect`
llamado después de un `return` condicional (`if (loading) return ...`),
violando las Rules of Hooks de React.

**Causa raíz:** El código fue escrito poniendo el early return primero por
legibilidad, sin tener en cuenta que los hooks deben llamarse incondicionalmente.

**Aprendizaje:** Los hooks de React (useEffect, useState, useCallback, etc.)
deben declararse ANTES de cualquier `return` condicional. ESLint con la regla
`react-hooks/rules-of-hooks` detecta esto automáticamente.

**Acción preventiva:** ESLint ya está configurado con `eslint-plugin-react-hooks`.
El error hubiera sido detectado antes si ESLint hubiera estado configurado
desde el inicio del proyecto.

---

## L-IACT-UI-003 — Mock sin schema completo genera fallos silenciosos

**Categoría:** Testing / Mock system  
**Severidad:** Alta

**Qué pasó:** `permissions.json` no tenía el campo `icono` en
`funciones_accesibles`, causando que 2 test suites fallaran completamente
al cargar el mock.

**Causa raíz:** El schema en `schemas.js` fue actualizado para requerir
`icono` pero el mock JSON no fue actualizado en paralelo.

**Aprendizaje:** Cuando se añade un campo obligatorio a un schema, hay que
actualizar todos los mocks correspondientes en el mismo commit. El sistema
de validación de schemas es correcto — debe mantenerse actualizado.

**Acción preventiva:** Al modificar `schemas.js`, buscar todos los archivos
JSON en `src/mocks/` que valida ese schema y actualizarlos.
