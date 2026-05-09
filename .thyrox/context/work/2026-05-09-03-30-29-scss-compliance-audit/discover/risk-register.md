```yml
created_at: 2026-05-09 03:30:29
updated_at: 2026-05-09 03:30:29
project: THYROX
work_package: 2026-05-09-03-30-29-scss-compliance-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# Risk Register — scss-compliance-audit

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-01 | `.error-banner` actualizado visualmente diferente al esperado | Media | Alto | Verificar colores en componente visual antes de migrar masivamente |
| R-02 | Test snapshot breakage al cambiar className | Baja | Medio | No hay snapshots en el proyecto — riesgo mínimo |
| R-03 | `status-badge` modifier no existe para algún estado | Baja | Bajo | Verificar en `_pages-shared.scss` antes de usar — ya están `status-active`, `status-inactive`, `status-failure`, `status-pending` |
| R-04 | `search-bar` requiere `.search-input` selector anidado | Baja | Bajo | `.search-bar .search-input` ya está en SCSS — solo añadir className al input |
| R-05 | UserList.jsx test (STATE_BADGE) falla al cambiar clase badge | Media | Medio | Los tests de UserList usan textContent, no clases — cambiar badge class no rompe tests |
