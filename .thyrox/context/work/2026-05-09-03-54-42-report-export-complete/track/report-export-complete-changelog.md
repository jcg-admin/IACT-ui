```yml
created_at: 2026-05-09 05:20:00
project: THYROX
work_package: 2026-05-09-03-54-42-report-export-complete
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — report-export-complete

## Added

- `src/mocks/mockInterceptor.js`: `_jobPollCounters` Map en constructor para
  contar polls por job_id (T-002).
- `src/mocks/mockInterceptor.js`: `_handleJobStatus` retorna `done` + `file_url`
  tras 3 polls del mismo job_id; soporta `?test_state=done|failed` (T-002).
- `src/mocks/mockInterceptor.js`: 4 error codes en POST `/api/reports/export/`:
  ROW_LIMIT_EXCEEDED (400), EXPORT_LIMIT_EXCEEDED (429), PERMISSION_REVOKED (403),
  TOO_LARGE (413); activados por `test_error` en body/params (T-003).
- `src/services/reportsGateway.js`: `getExportJobStatus(jobId)` — llama
  `apiService.get` directamente sin caching, para uso en polling (T-004).
- `src/services/reportsGateway.js`: `cancelExportJob(jobId)` — POST a
  `/api/job/{id}/cancel/` (T-004).
- `src/pages/reports/ReportExport.jsx`: polling 3s con `useEffect + setInterval +
  clearInterval` + cleanup al desmontar (T-005).
- `src/pages/reports/ReportExport.jsx`: UI de progreso — "En cola…" / "Procesando…" /
  botón "Descargar archivo" cuando `done` / mensaje de fallo (T-006).
- `src/pages/reports/ReportExport.jsx`: botón "Cancelar exportación" cuando
  `status=queued|running` (T-007).
- `src/pages/reports/ReportExport.jsx`: `ERROR_MESSAGES` map para 4 códigos de
  error específicos con mensajes descriptivos (T-007).
- `src/pages/reports/__tests__/ReportExportPage.test.jsx`: 16 tests totales cubriendo
  formulario, submit, polling done/failed, cancel, y error codes (T-008).

## Changed

- `src/mocks/mockInterceptor.js`: routing de job endpoints corregido de
  `url.includes('/api/job/status/')` a `url.match(/\/api\/job\/[^/]+\/status\//)`,
  análogamente para download y cancel (T-001).
- `src/services/reportsGateway.js`: header de endpoints actualizado con las dos
  nuevas URLs de job (T-004).
- `plan-execution/report-export-complete-task-plan.md`: DECISION-06 documentada
  (dos sistemas de exportación son complementarios, no duplicados).

## Métricas de éxito — resultado final

| Métrica | Baseline | Resultado |
|---------|----------|-----------|
| Routing mock `/api/job/{id}/*` | ❌ roto | ✓ funcional |
| `_handleJobStatus` retorna `done` | Nunca | ✓ Tras 3 polls |
| Error codes en mock export | 0 | 4 |
| Polling en UI | No | ✓ Sí (3s interval, cleanup) |
| Botón descarga cuando done | No | ✓ Sí |
| Botón cancelar cuando queued/running | No | ✓ Sí |
| Tests pasando | 1989 | 1993 (+4) |

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Entradas candidatas:
- Fix de routing `/api/job/{id}/*` en mockInterceptor
- Implementación completa del flujo asíncrono UC_RPT_04 (polling/descarga/cancelar)
