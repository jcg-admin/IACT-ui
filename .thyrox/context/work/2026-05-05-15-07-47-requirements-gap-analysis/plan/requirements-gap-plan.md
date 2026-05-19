```yml
created_at: 2026-05-05 16:01:47
project: IACT-UI
work_package: 2026-05-05-15-07-47-requirements-gap-analysis
phase: Phase 6 — SCOPE
author: claude
status: Borrador
```

# Scope — Implementación de Requisitos Faltantes

## Decisión de scope

**OUT OF SCOPE — eliminado explícitamente:**
- Tipo D completo: operator (UC-OPR-01..10), supervision (UC-SUP-01..03),
  pipeline (UC-PIP-01..04), caller (UC-CLI-01..05)
- Razón: requieren infraestructura CTI/WebRTC/ACD externa no disponible.
  JobMonitoring y supervision de llamadas en vivo quedan fuera.

**IN SCOPE — todo lo demás:**
- Tipo A: wiring de rutas (auth, users, reports)
- Tipo B: reemplazar mock data con servicios reales (users, reports)
- Tipo C: páginas nuevas en dominios existentes (auth, permissions, admin, logs, reports IVR)

---

## Dominios in-scope

| Dominio | UCs cubiertos | Tipo | Sprints |
|---------|---------------|------|---------|
| auth | 5/5 | A + C | 1, 2 |
| users | 4/4 | A + B | 1, 2 |
| access | 7/7 (ya funcional) | — | — |
| alerts | 5/5 (ya funcional) | — | — |
| audit | 4/4 (ya funcional) | — | — |
| reports | 10/16 | A + B + C | 1, 2, 3, 4 |
| permissions | 10/10 | C | 3 |
| admin | 3/3 | C | 3 |
| logs | 7/7 | C | 4 |

**Total UCs a cubrir:** 49 UCs adicionales (de 16 funcionales → 65 funcionales)
**UCs permanentemente out-of-scope:** 18 (pipeline, operator, supervision, caller)

---

## Roadmap de sprints

### Sprint 1 — Quick wins (semana 1)
Wiring de rutas + catálogo de permisos.
Desbloquea acceso inmediato a componentes ya construidos.

### Sprint 2 — Datos reales (semanas 2–4)
Servicios reales para users y reports. Eliminar mock data.

### Sprint 3 — Permissions + Admin (semanas 5–8)
Gestión de grupos/AGRs, CRUD de catálogos, menú dinámico.

### Sprint 4 — Logs + Reports IVR (semanas 9–14)
Visor de logs completo y reportes específicos de IVR.

---

## Convención de código

- **Código** (clases, funciones, atributos, variables, rutas, constantes): **inglés**
- **Comentarios, JSDoc, mensajes UI, textos de alerta**: **español**
- Patrón de archivos: `PascalCase` para componentes, `camelCase` para servicios y slices
