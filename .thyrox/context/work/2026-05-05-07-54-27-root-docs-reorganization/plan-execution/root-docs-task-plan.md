```yaml
created_at: 2026-05-05 08:00:00
project: IACT-UI
phase: Phase 8 — EXECUTE
```

# Task Plan — root-docs-reorganization

## Bloque A — Infraestructura

- [ ] [T-001] Crear `docs/analysis/` y `docs/examples/`

## Bloque B — Mover documentación técnica activa (git mv, contenido íntegro)

### docs/guides/ (17 archivos)
- [ ] [T-002] BREAKPOINTS_IMPLEMENTATION_GUIDE.md → docs/guides/breakpoints-implementation.md
- [ ] [T-003] CLEAN_CODE_REFACTORING_PLAN.md → docs/guides/clean-code-refactoring.md
- [ ] [T-004] COMMENT_CLEANUP_GUIDE.md → docs/guides/comment-cleanup.md
- [ ] [T-005] DECORATOR_APPLIED_EXAMPLES.md → docs/guides/decorator-examples.md
- [ ] [T-006] EXPORT_SERVICE_GUIDE.md → docs/guides/export-service.md
- [ ] [T-007] FACADE_PATTERN_GUIDE.md → docs/guides/facade-pattern.md
- [ ] [T-008] IMPORT_ORGANIZATION_GUIDE.md → docs/guides/import-organization.md
- [ ] [T-009] INSTALACION_COMPONENTES.md → docs/guides/instalacion-componentes.md
- [ ] [T-010] README_EJECUCIÓN.md → docs/guides/ejecucion.md
- [ ] [T-011] README_PERMISOS.md → docs/guides/permisos.md
- [ ] [T-012] README_SCSS_UTILITIES.md → docs/guides/scss-utilities.md
- [ ] [T-013] RESPONSIVE_UTILITIES_BOOTSTRAP.md → docs/guides/responsive-bootstrap.md
- [ ] [T-014] RESPONSIVE_UTILITIES_GUIDE.md → docs/guides/responsive-guide.md
- [ ] [T-015] RESPONSIVE_UTILITIES_USAGE.md → docs/guides/responsive-usage.md
- [ ] [T-016] SERVICES_SETUP.md → docs/guides/services-setup.md
- [ ] [T-017] VARIABLE_NAMING_GUIDE.md → docs/guides/variable-naming.md
- [ ] [T-018] QUICK_START.md (raíz) → docs/guides/quickstart-scss.md

### docs/analysis/ (15 archivos)
- [ ] [T-019] ANALISIS_IMPLEMENTACION_WEBPACK5_EN_IACT.md → docs/analysis/webpack5-iact-implementacion.md
- [ ] [T-020] ANÁLISIS_IMPLEMENTACIÓN_ACTUAL.md → docs/analysis/implementacion-actual.md
- [ ] [T-021] BREAKPOINTS_ANALYSIS.md → docs/analysis/breakpoints.md
- [ ] [T-022] CHANGELOG_TAILWIND_REMOVAL.md → docs/analysis/changelog-tailwind-removal.md
- [ ] [T-023] COMPARATIVE_ANALYSIS_MX_TEMPLATE.md → docs/analysis/comparative-mx-template.md
- [ ] [T-024] HEADER_REQUIREMENTS.md → docs/analysis/header-requirements.md
- [ ] [T-025] MX_TEMPLATE_TO_IACT_PICKERS_ANALYSIS.md → docs/analysis/mx-template-pickers.md
- [ ] [T-026] PATTERNS_IMPLEMENTATION_ANALYSIS.md → docs/analysis/patterns-implementation.md
- [ ] [T-027] PHASE_0_CURRENT_STATE_ANALYSIS.md → docs/analysis/phase-0-current-state.md
- [ ] [T-028] TEST_FIXES_PRIORITY_PLAN.md → docs/analysis/test-fixes-priority.md
- [ ] [T-029] UTILITIES_NOMENCLATURE_ANALYSIS.md → docs/analysis/utilities-nomenclature.md
- [ ] [T-030] WEBPACK5_ANALISIS_EXHAUSTIVO_COMPLETO.md → docs/analysis/webpack5-exhaustivo.md
- [ ] [T-031] WEBPACK5_ANALYSIS_PARTE1.md → docs/analysis/webpack5-parte1.md
- [ ] [T-032] WEBPACK5_ANALYSIS_PARTE2.md → docs/analysis/webpack5-parte2.md
- [ ] [T-033] WEBPACK_OPTIMIZATION_PLAN.md → docs/analysis/webpack-optimization.md

### docs/project-scope/ (5 archivos)
- [ ] [T-034] FEATURE_IMPLEMENTATION_PLAN.md → docs/project-scope/feature-implementation-plan.md
- [ ] [T-035] IMPLEMENTATION_PLAN.md → docs/project-scope/implementation-plan.md
- [ ] [T-036] PLAN_IMPLEMENTACIÓN.md → docs/project-scope/plan-implementacion.md
- [ ] [T-037] ROADMAP_FINAL_OPTIMIZADO.md → docs/project-scope/roadmap-final.md
- [ ] [T-038] WEBPACK_IMPROVEMENTS_ROADMAP.md → docs/project-scope/webpack-improvements-roadmap.md

### docs/reference/ (3 archivos)
- [ ] [T-039] DESIGN_PATTERNS_REFERENCE.md → docs/reference/design-patterns.md
- [ ] [T-040] PATTERNS_IMPLEMENTABLES.md → docs/reference/patterns-implementables.md
- [ ] [T-041] WEBPACK_COMPLETE_SUMMARY.md → docs/reference/webpack-summary.md

### docs/raid-party-lessons/ (3 archivos)
- [ ] [T-042] RAID_PARTY_ADAPTATION_ANALYSIS.md → docs/raid-party-lessons/adaptation-analysis.md
- [ ] [T-043] RAID_PARTY_DEEP_ANALYSIS.md → docs/raid-party-lessons/deep-analysis.md
- [ ] [T-044] RAID_PARTY_FUNCTIONALITY_ANALYSIS.md → docs/raid-party-lessons/functionality-analysis.md

### docs/examples/ (2 archivos)
- [ ] [T-045] EJEMPLO_AUDITPAGE.jsx → docs/examples/ejemplo-auditpage.jsx
- [ ] [T-046] EJEMPLO_BREAKPOINTS_RESPONSIVO.jsx → docs/examples/ejemplo-breakpoints-responsivo.jsx

### scripts/ (2 archivos)
- [ ] [T-047] COMMITS.sh → scripts/commits.sh
- [ ] [T-048] GIT_COMMANDS.sh → scripts/git-commands.sh

## Bloque C — Consolidar archivos históricos en docs/

- [ ] [T-049] Crear docs/project-scope/implementation-history.md (ITER4/5/6, FASE2, PHASE_COMPLETE, PROYECTO_IACT, IMPLEMENTATION_COMPLETE, INTEGRACIÓN_COMPLETADA, COMMIT_MESSAGE, EXECUTIVE_SUMMARY)
- [ ] [T-050] Crear docs/analysis/testing-sessions.md (SESSION_SUMMARY, FINAL_SESSION_REPORT, TEST_STATUS_SUMMARY)
- [ ] [T-051] Crear docs/project-scope/project-structure-legacy.md (ESTRUCTURA, START_HERE, PROJECT_STRUCTURE_FINAL, TODO)
- [ ] [T-052] Crear docs/raid-party-lessons/summary.md (RAID_PARTY_SUMMARY, RAID_PARTY_USEFUL_FUNCTIONALITY, RESUMEN_FINAL_PICKERS)
- [ ] [T-053] Crear docs/guides/resumen-react-redux.md (RESUMEN_IMPLEMENTACION_REACT_REDUX)

## Bloque D — Eliminar originales históricos (tras verificar integración)

- [ ] [T-054] git rm de los 27 archivos históricos originales

## Bloque E — webpack.config.js duplicado

- [ ] [T-055] Verificar diferencias webpack.config.js vs webpack.config.cjs, integrar si las hay, eliminar

## Bloque F — Actualizar docs/DOCUMENTATION_STRUCTURE.md

- [ ] [T-056] Actualizar DOCUMENTATION_STRUCTURE.md con la nueva estructura completa

## Bloque G — Cierre

- [ ] [T-057] Actualizar wp-state.md → Phase 11 TRACK
- [ ] [T-058] Crear track/root-docs-changelog.md
- [ ] [T-059] Commit y push final
