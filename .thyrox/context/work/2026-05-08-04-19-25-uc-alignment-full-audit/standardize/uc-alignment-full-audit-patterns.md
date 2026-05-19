```yml
created_at: 2026-05-08 15:28:51
project: IACT-UI
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 12 — STANDARDIZE
author: NestorMonroy
status: Aprobado
```

# Patterns — uc-alignment-full-audit

## Patrones adoptados

### PAT-UC-AUDIT-001: Auditoría de UCs requiere verificar AppRouter, no solo src/pages/

**Origen:** L-001 — 3 páginas implementadas (AssignFunctions, Permissions, AccessAudit)
no fueron detectadas como completas porque no tenían rutas en AppRouter.

**Patrón:**
Al auditar alineación UC→implementación, verificar SIEMPRE dos fuentes:
1. `src/pages/` — archivo existe
2. `src/routes/AppRouter.jsx` (o equivalente) — ruta existe

Una página sin ruta en el router es inaccesible para el usuario y no cuenta
como UC implementado, aunque el archivo JSX exista con lógica completa.

**Comando de verificación:**
```bash
# Listar páginas en src/pages/
find src/pages -name "*.jsx" | sort

# Verificar que tienen ruta registrada
grep -n "import\|lazy\|path=" src/routes/AppRouter.jsx | grep -i "<NombrePagina>"
```

**Alcance:** Aplica en Phase 1 DISCOVER cuando se inventaría el estado de UCs.
Documentar en la sección "Estado de implementación" del discover analysis.

---

### PAT-UC-AUDIT-002: Clasificar UC como "gap" requiere leer el archivo fuente

**Origen:** L-003 — UC-PIP-04, UC-RPT-08, UC-RPT-09, UC-RPT-11 clasificados como
"parciales" en DISCOVER basándose en `grep` de keywords. En IMPLEMENT se verificó
que todos estaban completamente implementados con thunks, handlers mock y tests.

**Patrón:**
`grep` de keywords sobre nombres de archivo NO es suficiente para determinar si un
UC está implementado. El feature puede usar nombres distintos al codename del UC
(e.g., `retryPipeline` en logs slice, no en pipeline slice).

**Protocolo antes de clasificar un UC como gap:**
1. Identificar el componente o página destino del UC
2. Leer el archivo fuente completo (no solo grep)
3. Verificar que el slice/thunk correspondiente tiene la acción
4. Verificar que existe un mock handler para el endpoint
5. Verificar que hay tests del flujo
Solo si faltan 3 o más de estos → clasificar como gap.

**Regla de clasificación:**
- `grep` vacío → `INFERRED: posible gap` (no `PROVEN: gap`)
- Archivo fuente leído + thunk ausente + sin test → `PROVEN: gap`
- Archivo fuente leído + thunk existe con nombre distinto → `PROVEN: implementado`

---

### PAT-GIT-001: git mv + Edit produce modificaciones no staged

**Origen:** L-004 — Al mover UserManagement con `git mv` y editar con herramienta Edit,
las ediciones quedaron como unstaged modifications sobre el nuevo path.

**Patrón:**
`git mv` genera dos operaciones en el index: delete del original + add del nuevo.
Las ediciones posteriores al nuevo path aparecen como "modified" no staged porque el
`git add` implícito del mv no capturó los cambios posteriores.

**Regla:**
```bash
# Después de: git mv src/pages/UserManagement.jsx src/pages/users/UserManagement.jsx
# Y: Edit del archivo renombrado

# SIEMPRE ejecutar antes del commit:
git status
# Si aparece "modified" en el nuevo path → hacer git add explícito:
git add src/pages/users/UserManagement.jsx
git commit -m "..."
```

**Alcance:** Aplica en Phase 10 EXECUTE cada vez que se combina `git mv` con edición
del archivo renombrado en la misma secuencia.

---

### PAT-WORKFLOW-001: PAT-004 drift es exponencial con task-plans largos

**Origen:** L-005 — 46 checkboxes sin marcar al llegar a Phase 11. La sesión de Phase 10
fue interrumpida (context limit) y la continuación no tenía visibilidad del estado.

**Patrón:**
PAT-004 (checkbox-at-commit) no es solo una convención visual — es el mecanismo de
sincronización entre git history y el estado del task-plan. Sin él, la única fuente
de verdad es leer todos los commits del WP manualmente.

**Regla de corrección:**
Si se detecta PAT-004 drift al llegar a Phase 11:
```bash
# Corrección válida cuando la evidencia existe en git
sed -i 's/^- \[ \] \[T-/- [x] [T-/g' plan-execution/*-task-plan.md
# Nota: usar con precaución — solo cuando todos los T-NNN están commiteados
```

**Señal temprana:** Si al inicio de una sesión continuada hay >5 `[ ]` sin commits
asociados, aplicar PAT-004 inmediatamente antes de continuar.

---

### PAT-RISK-001: Blast radius real de mv estructural = número de importadores

**Origen:** L-006 — R-01 (mover UserManagement) estimado como ALTA probabilidad + ALTO
impacto. En la práctica: 1 importador en AppRouter, 1 en tests. Resuelto en ~10 min.

**Patrón:**
Antes de estimar riesgo de un movimiento estructural (`git mv`):
```bash
# Verificar importadores reales
grep -rn "@ui/pages/NombreModulo\|from.*pages/NombreModulo" src/
```

**Regla de clasificación de riesgo:**
| Importadores | Riesgo estimado |
|--------------|-----------------|
| 0–3          | BAJO — resolver en 1 commit |
| 4–10         | MEDIO — planificar migration en 1 sesión |
| >10          | ALTO — evaluar barrel export o deprecation path |

Módulos bien encapsulados (punto de entrada único vía AppRouter) tienen blast
radius bajo aunque el módulo parezca crítico por su nombre.

---

## Updates a guidelines

**No se requieren actualizaciones a `.thyrox/guidelines/`.**

Los patrones de este WP son metodológicos (cómo auditar UCs, cómo usar git mv)
y no corresponden a convenciones de stack tecnológico. Las guidelines de
`frontend-react.instructions.md` cubren patrones de componentes React; no es
el lugar correcto para reglas de auditoría de UCs.

---

## Updates a skills

### workflow-discover/SKILL.md — nota sobre auditoría UC completa

Agregar en la sección de instrucciones de Phase 1 una nota específica para WPs
de tipo "UC audit": verificar AppRouter además de `src/pages/` (PAT-UC-AUDIT-001)
y no clasificar UCs como gap sin leer el archivo fuente (PAT-UC-AUDIT-002).

**Archivo:** `.claude/skills/workflow-discover/SKILL.md`
**Sección:** Después del bloque de 8 aspectos de DISCOVER
**Cambio:** Agregar subsección "UC audit checklist" con los dos patrones

### workflow-implement/SKILL.md — nota sobre git mv + Edit

Agregar nota operacional en la sección de ejecución de tareas: después de
`git mv` + edición con herramienta Edit, ejecutar `git status` antes del commit.

**Archivo:** `.claude/skills/workflow-implement/SKILL.md`
**Sección:** Después del paso 6 (commit) en la lista de pasos por tarea
**Cambio:** Agregar nota específica para `git mv`

---

## ADRs creados

**No se crean nuevos ADRs.**

Los patrones de este WP son operacionales (cómo hacer la auditoría, cómo usar git)
y no constituyen decisiones arquitectónicas del proyecto IACT-UI. Los ADRs del
proyecto registran decisiones de diseño de software (stack, patrones de Redux,
estructura de módulos). La distinción aplica per regla SKILL vs ADR en CLAUDE.md.

---

## Próximos WPs sugeridos

| Prioridad | WP sugerido | Motivación |
|-----------|-------------|------------|
| Alta | `fase-2-uc-validation` o similar | 66 UCs de Fase 1 alineados. Fase 2 del producto (si existe) requiere el mismo proceso. |
| Media | `e2e-test-coverage-audit` | Las páginas ACC (AssignFunctions, Permissions, AccessAudit) tienen tests unitarios pero no e2e. L-001 reveló que existían sin ruta — probable que otros componentes similares estén incompletos. |
| Baja | `router-guard-audit` | Verificar que todas las rutas en AppRouter tienen guards RBAC correctos. No fue scope de este WP pero es riesgo conocido (L-001 + mock-rbac-full-audit). |
