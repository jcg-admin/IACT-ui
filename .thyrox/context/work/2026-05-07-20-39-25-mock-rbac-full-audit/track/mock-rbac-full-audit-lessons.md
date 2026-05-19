```yml
created_at: 2026-05-07 00:00:00
project: THYROX
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — mock-rbac-full-audit

## L-001: `role` field violates RBAC contract

**Observado:** `_handleLogin` devolvía `role: 'admin'` en el objeto usuario.
Esto contradice el modelo RBAC donde el acceso se determina exclusivamente
por funciones asignadas, no por un campo de rol en la sesión.

**Acción:** Eliminar `role` de los objetos de sesión (login + getUser).
Mantener `role` solo en el módulo de gestión de usuarios (es un campo de
presentación en la tabla de usuarios, no se usa para autorización).

**Patrón generalizable:** En RBAC puro, el objeto de sesión no debe tener
campos que impliquen rol heredado. El frontend siempre consulta capacidades.

---

## L-002: Naming SOD → SeparationRule requiere actualizar mocks también

**Observado:** El renaming de `SOD_RULES` → `SEPARATION_RULES` en source
dejó los mocks de `mockInterceptor.js` con `SOD-001`/`SOD-002`/`SOD-003`
sin actualizar hasta T-011. Esto crea inconsistencia entre el código client
(que ya usa `SR-001`) y los datos del mock server.

**Acción:** Incluir siempre los mocks del servidor en el scope de renames.
Al renombrar un identificador en el frontend, buscar en `src/mocks/` también.

---

## L-003: FunctionCatalog count assumption broke TDD test

**Observado:** T-002 test inicialmente asumió 35 constantes baseline (35+26=61).
El count real era 40 baseline → `expect().toBe(61)` falló con recibido 66.
Error descubierto en la fase RED→GREEN.

**Acción:** Siempre verificar el count real con `Object.keys(FunctionCatalog).length`
antes de escribir el test de count. No asumir — verificar.

---

## L-004: userId mismatch silencia errores de permisos

**Observado:** `_handleLogin` devolvía `id: 1` pero `PERMISOS_BY_USER_ID`
solo tenía claves `10` y `99`. El endpoint de capacidades retornaba 404
silencioso para userId=1.

**Acción:** Los IDs de usuario en el mock de login DEBEN coincidir exactamente
con las claves del mapa `PERMISOS_BY_USER_ID`. Agregar un test que verifique
que `_handleLogin` retorna un ID que existe en el mapa.

---

## L-005: TDD con datos locales en test no es RED verdadero

**Observado:** Los tests de accordion (T-015, T-018) usaban `ALL_NAV_LINKS_INTEGRATION`
local al test file. Al agregar `children` a esa estructura local, los tests
pasaban inmediatamente incluso sin modificar AppRouter.jsx.

**Decisión:** Para routes-existence (¿existe la ruta?), usar renders con
MemoryRouter. Para nav-filtering (¿filtra correctamente?), el patrón local
es aceptable ya que la lógica de filtrado está correctamente aislada.

---

## L-006: Accordion nav amplifica el valor del filtrado por capacidad

**Observado:** Al convertir Alertas y Auditoría de leaf a accordion, el
`useFilteredNavLinks` automáticamente filtra los hijos individualmente sin
cambios de código. La infraestructura de filtrado ya soportaba children.

**Patrón:** El patrón `children: link.children?.filter(c => hasPermission(c.permission)) ?? []`
en `useFilteredNavLinks` es extensible a cualquier módulo que se convierta
en accordion. No requiere cambios en el hook.
