```yml
created_at: 2026-05-09 03:51:19
project: THYROX
work_package: 2026-05-09-03-30-29-scss-compliance-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
total_lessons: 4
```

# Lessons Learned: scss-compliance-audit

## Lecciones

### L-001: El color `#7f1d1d` no siempre es un error-banner — discernir antes de migrar masivamente

**Qué pasó**

El plan inicial asumía que todas las instancias de `backgroundColor: '#7f1d1d'` en el
codebase eran error banners candidatas a `className="error-banner"`. Al ejecutar la
migración, se encontraron 11 usos legítimos que no eran error banners: mapas de colores
de estado (`STATUS_BADGE`, `FRESCURA_BADGE`), fondos condicionales para filas expiradas
(`isExpired(perm) ? '#7f1d1d' : '#1f2937'`), etiquetas UI bivalentes
(`dryRunResult.ok ? '#064e3b' : '#7f1d1d'`), y un container de conflictos con dos estados
visuales distintos (`SeparationRulesValidator`).

**Raíz**

El DISCOVER identificó el patrón completo (padding+border+color) como criterio de
error-banner, pero el conteo de grep (`#7f1d1d`) incluía usos de color en otros contextos.
El número 41 de DISCOVER era de "instancias del color en archivos" no de "error banners".

**Fix aplicado**

Se revisó el contexto de cada instancia antes de migrar. Los 11 usos intencionales se
preservaron con comentario implícito (estructura condicional los distingue). 30 error
banners reales fueron migrados.

**Regla**

Cuando el criterio de identificación es un valor de color (no una clase CSS), auditar el
contexto de cada instancia antes de migrar — el color puede ser intencional en UI no-error.
Usar como criterio secundario: ¿el div tiene `role="alert"` o está condicionado a `{error &&`?

---

### L-002: `.error-banner` necesitaba variables SCSS, no hex hardcodeados

**Qué pasó**

El task plan original (T-001) especificaba actualizar `.error-banner` con colores hex
hardcodeados (`background: #7f1d1d`). El ejecutor aprobó con corrección: usar
`darken($error-color, 45%)` en lugar de `#7f1d1d` hardcodeado.

**Raíz**

El plan de T-001 fue escrito mirando el patrón de los bloques inline (que usaban hex),
sin contrastar con el patrón SCSS existente en `_toast.scss` que ya usaba variables.

**Fix aplicado**

T-001 se implementó con `darken($error-color, 45%)`, `darken($error-color, 20%)`,
`lighten($error-color, 30%)` — consistente con `_toast.scss` y con la variable canónica
`$error-color: #ef4444`.

**Regla**

Cuando se actualiza un archivo SCSS, buscar primero cómo otros componentes similares
usan los colores en el mismo codebase — copiar el patrón de variables existente, no
retroceder a hex hardcodeado.

---

### L-003: Los tests de badge class deben actualizarse al migrar la clase CSS

**Qué pasó**

Al migrar `STATE_BADGE` en `UserList.jsx` de `badge-primary/secondary/warning/danger` a
`status-badge status-active/inactive/blocked/eliminated`, 4 tests en
`UserList.test.js` fallaron porque verificaban la clase antigua
(`container.querySelector('.badge-primary')`).

**Raíz**

El task plan mencionaba "verificar tests de UserList" pero no incluía explícitamente la
actualización de los assertions de clase en el test. Los tests de clase CSS son frágiles
a rename de clase intencionado.

**Fix aplicado**

Se actualizaron los 4 assertions para usar `.status-badge.status-active` etc. Las
descripciones de los tests también se actualizaron para describir el nuevo patrón.

**Regla**

Cuando una migración de clase CSS es intencional (no un bug), los tests que verifican esa
clase son los que deben cambiar, no la migración. Incluir explícitamente "actualizar tests"
en el task item que cambia la clase.

---

### L-004: Los usos no-banner de un color UI son deuda de diseño, no bugs

**Qué pasó**

`SeparationRulesValidator.jsx`, `Permissions.jsx`, `PermissionsTable.jsx`,
`TransactionList.jsx` y `JobList.jsx` usan `#7f1d1d` como color de UI en contextos
semánticos propios (estado de job "Fallido", permiso expirado, incompatibilidad RBAC).
Estos no pueden migrarse a `.error-banner` sin perder semántica.

**Raíz**

El design system tiene `.error-banner` para mensajes de error de formulario/API, pero no
tiene tokens para "fila con permiso expirado" o "job fallido". La ausencia fuerza el uso
de hex directo.

**Fix aplicado**

Se preservaron como-están. Se documenta como deuda técnica: crear tokens de color
semánticos (`$color-expired`, `$color-failed`) en `_variables.scss`.

**Regla**

Un color hardcodeado en contexto semántico específico (expirado, fallido, incompatible)
indica ausencia de token en el design system — documentar como TD-color-tokens, no migrar
a una clase de error genérica.

---

## Patrones identificados

| Patrón | Lecciones relacionadas | Acción sistémica |
|--------|----------------------|------------------|
| Migración de clase CSS requiere auditoría de contexto | L-001 | Agregar paso "revisar contexto de cada instancia" al plan de migración masiva |
| SCSS debe usar variables, no hex | L-002 | Checklist pre-commit para `_pages-shared.scss`: sin hex hardcodeado |
| Tests de clase CSS son frágiles a renaming intencional | L-003 | Task de migración siempre incluye "actualizar tests" explícitamente |

---

## Qué replicar

- **Categorización DISCOVER con conteos verificados**: El WP usó `grep` verificado para
  cada número de DISCOVER. Las decisiones de scope se basaron en evidencia observable,
  no en estimaciones. Ninguna sorpresa en ejecución.
- **Preservar usos intencionales**: Identificar y documentar los usos no-migrables antes
  de empezar la migración masiva evita regressions y fallos de tests inesperados.
- **3 commits por bloque**: B-I / B-II / B-III con tests verdes en cada uno — nunca
  acumular cambios y commitear al final.

---

## Deuda pendiente

| ID | Descripción | Prioridad | Work package sugerido |
|----|-------------|-----------|----------------------|
| TD-CSS-001 | Crear tokens semánticos `$color-expired`, `$color-failed`, `$color-incompatible` en `_variables.scss` para eliminar los 11 hex hardcodeados no-migrables | media | scss-semantic-tokens |
| TD-CSS-002 | Migrar P-02 (80 instancias flex+gap inline) — excluido de este WP por heterogeneidad | baja | scss-flex-utilities |

---

## Deuda epistémica

| Claim heredado | Origen | Estado | Acción |
|----------------|--------|--------|--------|
| "41 instancias de `#7f1d1d`" | Phase 1 DISCOVER | confirmado-en-Phase-10: 30 error banners + 11 usos intencionales = 41 total | cerrado |
| "0 snapshots en el proyecto" (R-02) | Phase 1 risk register | confirmado-en-Phase-10: ningún test de snapshot falló | cerrado |
| "status-active/inactive/blocked/eliminated existen en SCSS" | Phase 1 risk register (R-03) | confirmado-en-Phase-8: leído en _pages-shared.scss líneas 75, 81-82, 87-89 | cerrado |

---

## Checklist de cierre

- [x] Cada lección tiene raíz identificada (no solo síntoma)
- [x] Cada lección tiene regla generalizable
- [x] Patrones sistémicos documentados si aplica
- [x] Deuda técnica registrada con prioridad
- [x] Documento commiteado en `work/.../track/`
