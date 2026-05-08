```yml
created_at: 2026-05-08 15:45:58
updated_at: 2026-05-08 15:45:58
project: IACT-UI
work_package: 2026-05-08-15-44-55-auth-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Risk Register — auth-uc-audit

| ID | Riesgo | Prob | Impacto | Mitigación |
|----|--------|------|---------|------------|
| R-01 | ChangePassword.jsx y RecoverPassword.jsx usan thunks locales inline en vez del authSlice — migración puede romper tests existentes | ALTA | MEDIO | Leer tests actuales antes de migrar; asegurar mismo comportamiento |
| R-02 | Login.jsx no maneja `next_step: "change_password"` — agregar redirect condicional puede afectar flujo de login existente | MEDIA | ALTO | TDD: escribir test del flujo FA-01 antes de modificar Login.jsx |
| R-03 | `logoutAllSessions` tiene thunk en session.js pero sin UI — agregar botón en ActiveSessions puede colisionar con diseño existente | BAJA | BAJO | Verificar diseño en ActiveSessions.jsx antes de agregar |
| R-04 | LoginHistory.jsx usa datos mock hardcodeados sin endpoint real — puede no haber endpoint en mockInterceptor | ALTA | MEDIO | Verificar si existe handler en mockInterceptor antes de conectar |
| R-05 | Profile.jsx es un stub vacío — si se necesita como contenedor de sesiones, requiere diseño | MEDIA | BAJO | UC-AUTH-05 ya tiene ruta directa `/profile/sessions` → no bloquea |
