```yaml
created_at: 2026-05-05 07:54:27
project: IACT-UI
phase: Phase 1 — DISCOVER
```

# Phase 1 DISCOVER — Archivos sueltos en raíz para reorganización

## 1. Estado actual

75 archivos sueltos en la raíz (verificado con `ls *.md *.txt *.sh *.jsx | wc -l`):

| Extensión | Cantidad |
|-----------|---------|
| `.md` | 51 |
| `.txt` | 20 |
| `.sh` | 2 |
| `.jsx` | 2 |

`docs/` ya existe con estructura parcial:

```
docs/
├── README.md, QUICK_START.md, SETUP.md, ARCHITECTURE.md, CONTRIBUTING.md
├── DEPLOYMENT.md, TROUBLESHOOTING.md, STATE_DESIGN.md, DOCUMENTATION_STRUCTURE.md
├── api/           HOOKS.md
├── components/    Modal.md, Table.md
├── guides/        COMPONENT_GUIDE.md, TESTING.md, THEME.md
├── project-scope/ PHASES_COMPLETED.md
├── raid-party-lessons/ (6 archivos)
└── reference/     DEPENDENCIES.md, RAID_PARTY_STRUCTURE.md
```

---

## 2. Clasificación de los 75 archivos

### Categoría A — Quedan en raíz (config, no mover)

Estos archivos siguen convenciones de ecosistema Node/React y DEBEN permanecer
en la raíz. No forman parte de esta reorganización.

```
README.md           ← índice principal del repo
.env.example
.eslintrc.cjs
.gitignore
babel.config.cjs
jest.config.cjs
jest.setup.js
jsconfig.json
package.json
package-lock.json
postcss.config.js
webpack.config.cjs  ← config principal (CJS)
webpack.config.js   ← DUPLICADO pendiente de eliminar (ver H-010)
```

### Categoría B — Histórico de sesión (eliminar)

Archivos generados por sesiones de desarrollo anteriores. Referencian rutas
como `/tmp/project/IACT` (ya no válidas), o son resúmenes de sesiones de
trabajo sin valor de documentación permanente.

| Archivo | Motivo de eliminación |
|---------|----------------------|
| `COMMIT_MESSAGE.txt` | Mensaje de commit pasado, sin valor de referencia |
| `EXECUTIVE_SUMMARY.txt` | Resumen ejecutivo de sesión antigua |
| `FASE2_IMPLEMENTACION_RESUMEN.txt` | Resumen de iteración, obsoleto |
| `FINAL_SESSION_REPORT.md` | Reporte de sesión 3 de testing, obsoleto |
| `ITER4_COMPLETADO_FINAL.txt` | Log de iteración 4, obsoleto |
| `ITER4_FRONTEND_COMPLETADO.txt` | Log de iteración 4 frontend, obsoleto |
| `ITER5_COMPLETADO_FINAL.txt` | Log de iteración 5, obsoleto |
| `ITER5_PLAN_ALERTS.txt` | Plan de alertas iter 5, obsoleto |
| `ITER6_COMPLETADO_FINAL.txt` | Log de iteración 6, obsoleto |
| `PHASE_0_COMPLETE.txt` | Log de Phase 0 completada, obsoleto |
| `PHASE_2_COMPLETE.txt` | Log de Phase 2 completada, obsoleto |
| `PHASE_3_COMPLETE.txt` | Log de Phase 3 completada, obsoleto |
| `PHASE_4_COMPLETE.txt` | Log de Phase 4 completada, obsoleto |
| `PHASE_5_WCAG_AA_COMPLETE.txt` | Log de Phase 5 WCAG, obsoleto |
| `PROJECT_STRUCTURE_FINAL.txt` | Estructura de `/tmp/project/IACT`, obsoleto |
| `PROYECTO_IACT_COMPLETADO.txt` | Resumen de proyecto en ruta /tmp, obsoleto |
| `RAID_PARTY_SUMMARY.txt` | Resumen de Raid Party en texto plano |
| `RAID_PARTY_USEFUL_FUNCTIONALITY.txt` | Lista de funcionalidades útiles |
| `RESUMEN_FINAL_PICKERS.txt` | Resumen de implementación de pickers |
| `RESUMEN_IMPLEMENTACION_REACT_REDUX.txt` | Resumen de implementación Redux |
| `TEST_STATUS_SUMMARY.txt` | Estado de tests de sesión pasada |
| `SESSION_SUMMARY.md` | Resumen de sesión de testing |
| `IMPLEMENTATION_COMPLETE.md` | "Implementación completa" de sesión pasada |
| `INTEGRACIÓN_COMPLETADA.md` | "Integración completada" de sesión pasada |
| `ESTRUCTURA.md` | Dump de estructura en `/tmp/project/IACT` |
| `START_HERE.md` | Apunta a `/tmp/project/IACT`, obsoleto |
| `TODO.md` | TODO de `/tmp/project/IACT` con fecha 2025-04-23, obsoleto |

**Total a eliminar: 27 archivos**

### Categoría C — Scripts (mover a `scripts/`)

| Archivo | Destino | Contenido |
|---------|---------|----------|
| `COMMITS.sh` | `scripts/commits.sh` | Secuencia de commits predefinidos |
| `GIT_COMMANDS.sh` | `scripts/git-commands.sh` | Comandos git utilitarios |

### Categoría D — Ejemplos JSX (mover a `docs/examples/`)

| Archivo | Destino |
|---------|---------|
| `EJEMPLO_AUDITPAGE.jsx` | `docs/examples/ejemplo-auditpage.jsx` |
| `EJEMPLO_BREAKPOINTS_RESPONSIVO.jsx` | `docs/examples/ejemplo-breakpoints-responsivo.jsx` |

### Categoría E — Documentación activa (mover a `docs/`)

#### Subcat E1 — Guías de desarrollo → `docs/guides/`

| Archivo raíz | Destino en docs/ |
|-------------|-----------------|
| `BREAKPOINTS_IMPLEMENTATION_GUIDE.md` | `docs/guides/breakpoints-implementation.md` |
| `CLEAN_CODE_REFACTORING_PLAN.md` | `docs/guides/clean-code-refactoring.md` |
| `COMMENT_CLEANUP_GUIDE.md` | `docs/guides/comment-cleanup.md` |
| `DECORATOR_APPLIED_EXAMPLES.md` | `docs/guides/decorator-examples.md` |
| `EXPORT_SERVICE_GUIDE.md` | `docs/guides/export-service.md` |
| `FACADE_PATTERN_GUIDE.md` | `docs/guides/facade-pattern.md` |
| `IMPORT_ORGANIZATION_GUIDE.md` | `docs/guides/import-organization.md` |
| `INSTALACION_COMPONENTES.md` | `docs/guides/instalacion-componentes.md` |
| `README_EJECUCIÓN.md` | `docs/guides/ejecucion.md` |
| `README_PERMISOS.md` | `docs/guides/permisos.md` |
| `README_SCSS_UTILITIES.md` | `docs/guides/scss-utilities.md` |
| `RESPONSIVE_UTILITIES_BOOTSTRAP.md` | `docs/guides/responsive-bootstrap.md` |
| `RESPONSIVE_UTILITIES_GUIDE.md` | `docs/guides/responsive-guide.md` |
| `RESPONSIVE_UTILITIES_USAGE.md` | `docs/guides/responsive-usage.md` |
| `SERVICES_SETUP.md` | `docs/guides/services-setup.md` |
| `VARIABLE_NAMING_GUIDE.md` | `docs/guides/variable-naming.md` |

#### Subcat E2 — Análisis técnicos → `docs/analysis/`

| Archivo raíz | Destino en docs/ |
|-------------|-----------------|
| `ANALISIS_IMPLEMENTACION_WEBPACK5_EN_IACT.md` | `docs/analysis/webpack5-iact-implementacion.md` |
| `ANÁLISIS_IMPLEMENTACIÓN_ACTUAL.md` | `docs/analysis/implementacion-actual.md` |
| `BREAKPOINTS_ANALYSIS.md` | `docs/analysis/breakpoints.md` |
| `CHANGELOG_TAILWIND_REMOVAL.md` | `docs/analysis/changelog-tailwind-removal.md` |
| `COMPARATIVE_ANALYSIS_MX_TEMPLATE.md` | `docs/analysis/comparative-mx-template.md` |
| `HEADER_REQUIREMENTS.md` | `docs/analysis/header-requirements.md` |
| `MX_TEMPLATE_TO_IACT_PICKERS_ANALYSIS.md` | `docs/analysis/mx-template-pickers.md` |
| `PATTERNS_IMPLEMENTATION_ANALYSIS.md` | `docs/analysis/patterns-implementation.md` |
| `PHASE_0_CURRENT_STATE_ANALYSIS.md` | `docs/analysis/phase-0-current-state.md` |
| `TEST_FIXES_PRIORITY_PLAN.md` | `docs/analysis/test-fixes-priority.md` |
| `UTILITIES_NOMENCLATURE_ANALYSIS.md` | `docs/analysis/utilities-nomenclature.md` |
| `WEBPACK5_ANALISIS_EXHAUSTIVO_COMPLETO.md` | `docs/analysis/webpack5-exhaustivo.md` |
| `WEBPACK5_ANALYSIS_PARTE1.md` | `docs/analysis/webpack5-parte1.md` |
| `WEBPACK5_ANALYSIS_PARTE2.md` | `docs/analysis/webpack5-parte2.md` |
| `WEBPACK_OPTIMIZATION_PLAN.md` | `docs/analysis/webpack-optimization.md` |

#### Subcat E3 — Referencia técnica → `docs/reference/`

| Archivo raíz | Destino en docs/ |
|-------------|-----------------|
| `DESIGN_PATTERNS_REFERENCE.md` | `docs/reference/design-patterns.md` |
| `PATTERNS_IMPLEMENTABLES.md` | `docs/reference/patterns-implementables.md` |
| `WEBPACK_COMPLETE_SUMMARY.md` | `docs/reference/webpack-summary.md` |

#### Subcat E4 — Planificación del proyecto → `docs/project-scope/`

| Archivo raíz | Destino en docs/ |
|-------------|-----------------|
| `FEATURE_IMPLEMENTATION_PLAN.md` | `docs/project-scope/feature-implementation-plan.md` |
| `IMPLEMENTATION_PLAN.md` | `docs/project-scope/implementation-plan.md` |
| `PLAN_IMPLEMENTACIÓN.md` | `docs/project-scope/plan-implementacion.md` |
| `ROADMAP_FINAL_OPTIMIZADO.md` | `docs/project-scope/roadmap-final.md` |
| `WEBPACK_IMPROVEMENTS_ROADMAP.md` | `docs/project-scope/webpack-improvements-roadmap.md` |

#### Subcat E5 — Raid Party → `docs/raid-party-lessons/`

| Archivo raíz | Destino en docs/ |
|-------------|-----------------|
| `RAID_PARTY_ADAPTATION_ANALYSIS.md` | `docs/raid-party-lessons/adaptation-analysis.md` |
| `RAID_PARTY_DEEP_ANALYSIS.md` | `docs/raid-party-lessons/deep-analysis.md` |
| `RAID_PARTY_FUNCTIONALITY_ANALYSIS.md` | `docs/raid-party-lessons/functionality-analysis.md` |

#### Subcat E6 — Conflicto con docs/ existente (requiere decisión)

| Archivo raíz | docs/ existente | Decisión |
|-------------|-----------------|---------|
| `QUICK_START.md` | `docs/QUICK_START.md` | Root tiene guía SCSS post-Tailwind (específica). docs/ tiene guía de 5 min setup (genérica). **Renombrar root a `docs/guides/quickstart-scss.md`** |

---

## 3. Hallazgos

| ID | Hallazgo | Impacto |
|----|---------|---------|
| H-001 | 27 archivos son logs históricos obsoletos de sesiones → candidatos a eliminación | Contaminación raíz |
| H-002 | 16 guías técnicas activas sin hogar en docs/ | No encontrables |
| H-003 | 15 análisis técnicos sin hogar en docs/ | No encontrables |
| H-004 | 5 documentos de planificación sin hogar en docs/ | No encontrables |
| H-005 | 3 análisis de Raid Party fuera de `docs/raid-party-lessons/` | Inconsistencia |
| H-006 | 3 archivos de referencia técnica sin hogar | No encontrables |
| H-007 | 2 scripts `.sh` con nombres en MAYÚSCULAS en raíz | Convención incorrecta |
| H-008 | 2 archivos `.jsx` de ejemplo en raíz | Fuera de lugar |
| H-009 | `QUICK_START.md` duplicado — versiones distintas en raíz y en docs/ | Confusión |
| H-010 | `webpack.config.js` duplicado en raíz (debe eliminarse, ya existe `.cjs`) | Config duplicada |

---

## 4. Estructura target de `docs/`

```
docs/
├── README.md                          ← (existe)
├── QUICK_START.md                     ← (existe) — guía 5 min general
├── SETUP.md                           ← (existe)
├── ARCHITECTURE.md                    ← (existe)
├── CONTRIBUTING.md                    ← (existe)
├── DEPLOYMENT.md                      ← (existe)
├── TROUBLESHOOTING.md                 ← (existe)
├── STATE_DESIGN.md                    ← (existe)
├── DOCUMENTATION_STRUCTURE.md        ← (existe, actualizar)
│
├── api/                               ← (existe)
│   └── HOOKS.md
│
├── components/                        ← (existe)
│   ├── Modal.md
│   └── Table.md
│
├── examples/                          ← NUEVO
│   ├── ejemplo-auditpage.jsx
│   └── ejemplo-breakpoints-responsivo.jsx
│
├── guides/                            ← (existe, expandir con 16 nuevos)
│   ├── COMPONENT_GUIDE.md
│   ├── TESTING.md
│   ├── THEME.md
│   ├── breakpoints-implementation.md  ← nuevo
│   ├── clean-code-refactoring.md      ← nuevo
│   ├── comment-cleanup.md             ← nuevo
│   ├── decorator-examples.md          ← nuevo
│   ├── ejecucion.md                   ← nuevo
│   ├── export-service.md              ← nuevo
│   ├── facade-pattern.md              ← nuevo
│   ├── import-organization.md         ← nuevo
│   ├── instalacion-componentes.md     ← nuevo
│   ├── permisos.md                    ← nuevo
│   ├── quickstart-scss.md             ← nuevo (QUICK_START raíz renombrado)
│   ├── responsive-bootstrap.md        ← nuevo
│   ├── responsive-guide.md            ← nuevo
│   ├── responsive-usage.md            ← nuevo
│   ├── scss-utilities.md              ← nuevo
│   ├── services-setup.md              ← nuevo
│   └── variable-naming.md             ← nuevo
│
├── analysis/                          ← NUEVO (15 archivos)
│   ├── breakpoints.md
│   ├── changelog-tailwind-removal.md
│   ├── comparative-mx-template.md
│   ├── header-requirements.md
│   ├── implementacion-actual.md
│   ├── mx-template-pickers.md
│   ├── patterns-implementation.md
│   ├── phase-0-current-state.md
│   ├── test-fixes-priority.md
│   ├── utilities-nomenclature.md
│   ├── webpack-optimization.md
│   ├── webpack5-exhaustivo.md
│   ├── webpack5-iact-implementacion.md
│   ├── webpack5-parte1.md
│   └── webpack5-parte2.md
│
├── project-scope/                     ← (existe, expandir)
│   ├── PHASES_COMPLETED.md
│   ├── feature-implementation-plan.md ← nuevo
│   ├── implementation-plan.md         ← nuevo
│   ├── plan-implementacion.md         ← nuevo
│   ├── roadmap-final.md               ← nuevo
│   └── webpack-improvements-roadmap.md ← nuevo
│
├── raid-party-lessons/                ← (existe, expandir)
│   ├── (6 archivos existentes)
│   ├── adaptation-analysis.md         ← nuevo
│   ├── deep-analysis.md               ← nuevo
│   └── functionality-analysis.md      ← nuevo
│
└── reference/                         ← (existe, expandir)
    ├── DEPENDENCIES.md
    ├── RAID_PARTY_STRUCTURE.md
    ├── design-patterns.md             ← nuevo
    ├── patterns-implementables.md     ← nuevo
    └── webpack-summary.md             ← nuevo
```

---

## 5. Resumen de acciones

| Acción | Cantidad |
|--------|---------|
| Eliminar (históricos de sesión) | 27 archivos |
| Eliminar (webpack.config.js duplicado) | 1 archivo |
| Mover a `docs/guides/` | 17 archivos (16 + QUICK_START renombrado) |
| Mover a `docs/analysis/` (directorio nuevo) | 15 archivos |
| Mover a `docs/reference/` | 3 archivos |
| Mover a `docs/project-scope/` | 5 archivos |
| Mover a `docs/raid-party-lessons/` | 3 archivos |
| Mover a `docs/examples/` (directorio nuevo) | 2 archivos |
| Mover a `scripts/` | 2 archivos |
| **Total archivos procesados** | **75** |
| Quedan en raíz (config) | README.md + 12 config files |
