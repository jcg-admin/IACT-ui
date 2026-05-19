```yml
created_at: 2026-05-06 23:45:00
project: IACT-ui
work_package: 2026-05-06-21-11-12-menu-rbac-user-scope
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Lessons Learned — Menu RBAC User Scope

---

## L-01: Los endpoints API del cliente real deben tener handler mock desde el día 0

**Contexto:** `PermisosClient.getCapacidades(userId)` fue implementado llamando a
`/api/permisos/verificar/{userId}/capacidades/` (siguiendo ADR-BACK-005), pero el
handler en `mockInterceptor.js` nunca fue creado. En modo dev/mock, `usePermisos`
retornaba `capacidades=[]` silenciosamente (error caught, no crash), y el sidebar
mostraba solo "Dashboard" para cualquier usuario.

Este bug existió durante múltiples WPs sin ser detectado porque ningún test verificaba
el comportamiento end-to-end del menú con el interceptor real.

**Lección:** Cuando se crea un nuevo `PermisosClient` o servicio que llama a la API,
crear el handler mock en el mismo PR/commit. El contract de mock es parte de la
implementación del servicio — no es deuda técnica aceptable dejarlo para después.
Checklist: nuevo endpoint → nuevo `if (url.match(...))` en mockInterceptor + test.

---

## L-02: Stopping points canónicos aceleran decisiones de arquitectura

**Contexto:** Los 3 stopping points (SP-01..SP-03) del WP estaban diseñados para obtener
decisiones humanas. Las respuestas llegaron con referencias canónicas directas:
- SP-01: ADR-BACK-005 ("flujo via API endpoint, no archivo local")
- SP-02: `grupos-funciones.rst` AGR-010 con 9 funciones (commit 0db8957b en IACT-docs)
- SP-03: `uc-perm-08/patrones-diseno.rst:45-46` ("menú complementa la UX, NO es la barrera")

Cada decisión vino con la fuente exacta, lo que eliminó ambigüedad y permitió implementar
directamente sin ronda adicional de preguntas.

**Lección:** Los stopping points deben formularse con suficiente contexto técnico para que
la persona que responde pueda citar la fuente canónica. Una respuesta sin fuente es
una opinión; una respuesta con `file.rst:line` es una decisión arquitectónica trazable.

---

## L-03: La visibilidad del menú no es la barrera de seguridad — pero sí es la UX crítica

**Contexto:** `uc-perm-08/patrones-diseno.rst` declara explícitamente que el menú
"complementa la UX pero NO es la barrera". La barrera real es `ProtectedRoute` (frontend)
y `has_perm()` en los endpoints (backend). Esto nos dio claridad para:
- Descartar sub-menús del scope de este WP (no cambian la seguridad)
- Mantener `ALL_NAV_LINKS` plano con filtrado por `capacidades`

Sin embargo, cuando el mock de `usePermisos` retorna vacío, la UX queda rota — el usuario
no puede navegar. Esto demuestra que aunque el menú no sea la barrera de seguridad,
sí es el punto de entrada para el flujo del usuario. Un menú roto es un bug de UX crítico
aunque no sea un bug de seguridad.

**Lección:** Distinguir entre "no es la barrera de seguridad" (correcto) y "no importa"
(incorrecto). Los endpoints protegidos con `ProtectedRoute` garantizan la seguridad;
el menú garantiza la usabilidad. Ambos deben funcionar correctamente y tener tests.
