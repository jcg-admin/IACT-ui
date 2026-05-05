```yaml
created_at: 2026-05-05 08:00:00
project: IACT-UI
phase: Phase 5 — STRATEGY
```

# Phase 5 STRATEGY — Reorganización de raíz a docs/

## Regla fundamental

**Ningún archivo se elimina sin haber integrado su contenido primero.**
Los archivos técnicos se mueven íntegros (contenido preservado). Los archivos
históricos se consolidan en nuevos documentos de `docs/` antes de eliminar el original.

---

## Decisión 1 — Documentación técnica activa (mover íntegra)

45 archivos tienen contenido técnico válido que se mueve directamente como
archivo a su destino renombrado en kebab-case. No hay pérdida de contenido.

Destinos:
- `docs/guides/` — 17 guías de desarrollo
- `docs/analysis/` — 15 análisis técnicos (directorio nuevo)
- `docs/project-scope/` — 5 documentos de planificación
- `docs/reference/` — 3 referencias técnicas
- `docs/raid-party-lessons/` — 3 análisis de Raid Party
- `docs/examples/` — 2 archivos JSX de ejemplo (directorio nuevo)
- `scripts/` — 2 scripts shell

## Decisión 2 — Archivos históricos de sesión (consolidar antes de eliminar)

27 archivos son logs de sesiones de trabajo anteriores. Su contenido útil
se extrae y consolida en 5 documentos nuevos de `docs/`:

| Doc consolidado nuevo | Archivos fuente |
|-----------------------|----------------|
| `docs/project-scope/implementation-history.md` | ITER4_*, ITER5_*, ITER6_*, FASE2_*, PHASE_*_COMPLETE.txt, PROYECTO_IACT_COMPLETADO, IMPLEMENTATION_COMPLETE, INTEGRACIÓN_COMPLETADA, COMMIT_MESSAGE, EXECUTIVE_SUMMARY |
| `docs/analysis/testing-sessions.md` | SESSION_SUMMARY, FINAL_SESSION_REPORT, TEST_STATUS_SUMMARY |
| `docs/project-scope/project-structure-legacy.md` | ESTRUCTURA, START_HERE, PROJECT_STRUCTURE_FINAL, TODO |
| `docs/raid-party-lessons/summary.md` | RAID_PARTY_SUMMARY, RAID_PARTY_USEFUL_FUNCTIONALITY, RESUMEN_FINAL_PICKERS |
| `docs/guides/resumen-react-redux.md` | RESUMEN_IMPLEMENTACION_REACT_REDUX |

Tras crear cada doc consolidado y verificar que el contenido útil está
integrado, se elimina el archivo original.

## Decisión 3 — webpack.config.js duplicado

Verificar diferencias entre `webpack.config.js` (del merge de develop) y
`webpack.config.cjs` (nuestro principal). Si son distintos, extraer
diferencias relevantes a `docs/analysis/webpack5-iact-implementacion.md`
antes de eliminar `webpack.config.js`.

## Decisión 4 — Nomenclatura en docs/

Los archivos existentes en `docs/` mantienen sus nombres (UPPERCASE.md).
Los archivos nuevos que migran de raíz usan kebab-case.
No se renombran los existentes para no romper referencias.

## Criterios de aceptación

- [ ] Raíz contiene solo: README.md + 12 archivos de config
- [ ] `docs/analysis/` existe con 15+ archivos
- [ ] `docs/examples/` existe con 2 archivos jsx
- [ ] Los 5 docs consolidados existen en docs/
- [ ] Ningún archivo original eliminado sin contenido integrado
- [ ] `docs/DOCUMENTATION_STRUCTURE.md` actualizado
- [ ] Working tree limpio, todo commiteado y pusheado
