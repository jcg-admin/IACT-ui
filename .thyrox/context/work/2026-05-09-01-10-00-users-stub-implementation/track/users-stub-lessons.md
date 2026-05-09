```yml
created_at: 2026-05-09 00:38:00
project: THYROX
work_package: 2026-05-09-01-10-00-users-stub-implementation
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — users-stub-implementation

## L-01: Implementación desde spec inferida requiere gate de diseño explícito

Los UCs `Reservado` no tienen spec formal — solo un "Resumen propuesto" de 2 líneas.
Sin T-001 (design decisions), las ambigüedades hubieran generado trabajo duplicado:
¿dónde va el botón?, ¿qué confirmación?, ¿quién invalida sesiones?.

Documentar las decisiones ANTES de codificar no toma más tiempo — toma el mismo
tiempo que descubrirlo while coding, pero deja un artefacto verificable.

**Patrón correcto:** Todo WP de implementación desde spec inferida debe tener
un Task de scope/decisiones como primer checkbox del task plan.

## L-02: userAuth.can en componentes requiere mock en tests existentes

Al agregar `userAuth.can('users:block')` en `UserList.jsx`, los tests existentes
comenzaron a fallar con `TypeError: userAuth.can is not a function`. El test
no importaba ni mockeaba `userAuth` porque la versión anterior del componente
no lo usaba.

Fix: agregar `jest.mock('../../../facades/UserIdentity', { default: { can: jest.fn().mockReturnValue(true) } })`
al inicio del test file. Los permisos se prueban con `can` = true por defecto —
si se necesita probar sin permiso, sobrescribir en el test específico.

## L-03: Rutas mock deben registrarse antes del catch-all `/api/users`

`mockInterceptor.js` tiene un catch-all `url.includes('/api/users')` que captura
TODAS las rutas `/api/users*`. Las rutas más específicas (`/api/users/me/`,
`/api/users/{id}/block/`) deben registrarse ANTES de ese catch-all o nunca
se alcanzarán.

Orden correcto: rutas más específicas → catch-all.
Verificar siempre el orden al agregar nuevas rutas de usuario.

## L-04: El backend invalida sesiones — el frontend no debe intentarlo

Para bloqueo de usuario, el frontend simplemente llama la API y actualiza
el estado local. Intentar invalidar sesiones desde el frontend sería:
1. Imposible sin acceso a los tokens del usuario
2. Violación de responsabilidad (backend debe ser la fuente de verdad)
3. Código muerto en el 99% de los casos (sin endpoint de invalidación masiva expuesto)

Esta decisión (DD-03) evitó complejidad innecesaria.

## L-05: Profile scope debe ser explícito en el artefacto de diseño

Listar los campos IN scope no es suficiente — hay que listar explícitamente los
campos OUT de scope (password, username, segment, role). Sin esa lista explícita,
un implementador razonable podría agregar change-password "porque es parte del
perfil". La lista OUT transforma la decisión de scope en una invariante verificable.
