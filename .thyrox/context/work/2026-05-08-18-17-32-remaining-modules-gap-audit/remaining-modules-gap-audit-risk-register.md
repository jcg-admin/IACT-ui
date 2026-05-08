```yml
created_at: 2026-05-08 19:30:00
updated_at: 2026-05-08 19:30:00
project: IACT-UI
work_package: 2026-05-08-18-17-32-remaining-modules-gap-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# Risk Register — remaining-modules-gap-audit

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-01 | El botón "Reconocer" en Alerts.jsx rompe la disposición existente de la tabla de alertas | Media | Medio | Implementar como botón inline en cada fila de alerta (misma patrón que ETLLogs retryButton) |
| R-02 | El campo `note` (opcional ≤500 chars) necesita validación especial vs motivo del pipeline | Baja | Bajo | `note` es opcional — no requiere validación mínima; solo maxLength=500 |
| R-03 | La respuesta 409 "ya reconocida" requiere manejo idempotente (CA-04) | Baja | Bajo | Mostrar mensaje informativo sin error; el estado ya es correcto |
| R-04 | El slice `alerts.js` puede necesitar actualizar el estado local de la alerta tras ack exitoso | Media | Medio | Usar `extraReducers` para el case fulfilled del thunk, actualizar `alert.state = 'acknowledged'` en el store local |
