```yml
created_at: 2026-05-09 03:54:42
project: THYROX
work_package: 2026-05-09-03-54-42-report-export-complete
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — report-export-complete

## Problema

`ReportExport.jsx` implementa solo el paso 1 de UC_RPT_04: solicitar la exportación
(POST → job_id). Los pasos 2-5 del flujo asíncrono están sin implementar:
el usuario no puede ver cuándo el archivo está listo, descargarlo, cancelar, ni recibe
notificación de mailbox al completar.

Adicionalmente, la infraestructura de mock para el job genérico (`/api/job/{id}/status/`)
tiene routing roto: el mock verifica `url.includes('/api/job/status/')` pero la URL real
que genera `jobGateway` es `/api/job/{id}/status/`, que no contiene ese substring.

---

## Fuente de verdad

- **Componente:** `src/pages/reports/ReportExport.jsx`
- **Gateway reports:** `src/services/reportsGateway.js`
- **Gateway jobs:** `src/services/jobGateway.js` (start, status, download, cancel)
- **Mock handler:** `src/mocks/mockInterceptor.js` líneas 138-150, 927-956, 239-244
- **Notificaciones:** `src/services/notificationGateway.js` (mailbox interno)

---

## Gap 1 — No polling de estado del job (PROVEN)

**Evidencia:**
```jsx
// ReportExport.jsx:26-40 — estado post-submit
const res = await reportsService.exportReport(type, format, {})
setJobId(res?.job_id ?? null)
// → Muestra job_id como texto. Fin. No hay setInterval ni useEffect de polling.
```

**Mock también roto (PROVEN):** `_handleJobStatus` (l.927) siempre devuelve
`status: 'processing'` con progreso aleatorio — nunca `done` ni `file_url`:
```js
_handleJobStatus(url) {
  return {
    status: 200,
    data: {
      jobId: _jobId,
      status: 'processing',         // ← nunca 'done'
      progress: Math.floor(Math.random() * 100),
      eta: Math.floor(Math.random() * 60)
      // ← sin file_url
    }
  }
}
```

**Routing roto (PROVEN):** Mock enruta `url.includes('/api/job/status/')` (l.142)
pero `jobGateway.statusBase` llama `GET /api/job/${jobId}/status/` → la URL
`/api/job/report-export-1234/status/` NO contiene `/api/job/status/` como
substring → handler nunca se dispara con `jobGateway`.

**Impacto:** El usuario no sabe cuándo el archivo está listo. La UI muestra un
mensaje estático "estará disponible en los próximos minutos" sin actualizarse.

---

## Gap 2 — Sin URL firmada de descarga (PROVEN)

**Evidencia:** `ReportExport.jsx` renderiza solo `<code>{jobId}</code>` cuando
el job se encola — sin botón de descarga, sin link a `file_url`.

`_handleJobDownload` (l.941) devuelve CSV content pero no `file_url`. El spec
define que cuando el worker termina genera `file_url` con TTL de 24h.

Para que el flujo funcione, `_handleJobStatus` debe devolver `file_url` cuando
`status: 'done'`, y la UI debe mostrar ese link.

---

## Gap 3 — Sin botón cancelar job queued (PROVEN)

`ReportExport.jsx` no tiene botón de cancelar. `jobGateway.cancel` existe y
funciona (`src/services/jobGateway.js:171`), mock handler `_handleJobCancel`
devuelve `{ status: 'cancelled' }`.

**Routing del cancel también roto (PROVEN):** Mock usa
`url.includes('/api/job/cancel/')` pero `cancelBase` llama
`POST /api/job/${jobId}/cancel/` → URL `/api/job/abc-123/cancel/` NO contiene
`/api/job/cancel/` → mock nunca responde correctamente.

---

## Gap 4 — Mailbox notification (INFERRED)

`jobGateway.js` llama `notify.success()` via `notificationGateway` tras download
exitoso (toast local), pero el spec define una notificación de mailbox backend
cuando el job completa (backend → frontend).

**Estado actual:** `notificationGateway.js` existe con sistema de mailbox.
La conexión entre "export job completado en backend" → "notificación en mailbox"
no está verificada. `_handleJobStatus` no genera notificaciones en el mock.

**Decisión de scope:** INFERRED — verificar durante T-001 si el mock del job
status puede enviar una notificación de mailbox al transicionar a `done`.
Si no existe hook de backend→mailbox, implementar en el frontend: cuando el
poll detecta `status: done`, disparar `notify.info('Exportación lista: [descarga]')`.

---

## Gap 5 — Errores específicos no manejados (PROVEN)

`ReportExport.jsx:36` muestra solo `err.message` genérico. El spec define
5 códigos de error que deben tener mensajes descriptivos:

| Código | Significado | Mock actual |
|--------|-------------|-------------|
| `ROW_LIMIT_EXCEEDED` | El reporte supera el límite de filas exportables | ❌ no existe |
| `EXPORT_LIMIT_EXCEEDED` | El usuario ya tiene exports activos en cola | ❌ no existe |
| `PERMISSION_REVOKED` | Permiso `reports:export` revocado mientras esperaba | ❌ no existe |
| `TOO_LARGE` | El dataset supera el límite de tamaño de archivo | ❌ no existe |

**Evidencia:** `grep "ROW_LIMIT\|EXPORT_LIMIT\|PERMISSION_REVOKED\|TOO_LARGE"
src/mocks/mockInterceptor.js` → 0 resultados.

---

## Gap 6 — Routing mock `/api/job/*` roto para todos los verbos (PROVEN)

Resumen del problema de routing que afecta Gaps 1, 2 y 3:

| Mock check | URL que genera gateway | Match |
|------------|------------------------|-------|
| `includes('/api/job/status/')` | `/api/job/{id}/status/` | ❌ NO |
| `includes('/api/job/download/')` | `/api/job/{id}/download/` | ❌ NO |
| `includes('/api/job/cancel/')` | `/api/job/{id}/cancel/` | ❌ NO |

Los 3 handlers job existen y tienen implementación correcta — el problema es
solo el patrón de routing. Fix: cambiar a `url.match(/\/api\/job\/[^/]+\/(status|download|cancel)\//)`
o split + check por segmentos.

---

## Gap 7 — T-007: ¿páginas individuales necesitan botón export? (INFERRED)

`ExportHub/` existe (`src/components/pages/ExportHub/`) con
`ExportTypeSelector`, `ExportHistory`, `ExportOptions`, `ExportPreview`.
`ExportButtons.jsx` existe como shared component.

El spec define `ReportExport` como página centralizada. El spec **no** define
botones de export en páginas individuales de reporte (RealTimeMetrics, Agents,
etc.). `ExportButtons.jsx` es un shared component genérico — no está integrado
en páginas de reporte individuales.

**Decisión de scope:** Verificar spec explícito durante T-001. Si no hay
definición explícita de export-by-page, el scope queda en `ReportExport.jsx`
(página centralizada). No implementar exports en páginas individuales sin
evidencia spec.

---

## Scope aprobado

| Bloque | Alcance | Riesgo |
|--------|---------|--------|
| B-I | Fix mock routing + actualizar `_handleJobStatus` para retornar `done`+`file_url` tras N polls + agregar error codes | Bajo |
| B-II | Implementar polling en `ReportExport.jsx` usando `jobGateway.status` + mostrar `file_url` + botón descarga | Bajo |
| B-III | Botón cancelar cuando `status=queued/running` + errores específicos | Bajo |
| B-IV | Mailbox notification al detectar `done` | Bajo |

T-007 (export en páginas individuales): EXCLUIDO — sin evidencia spec que lo requiera.

## Exit criteria

- Mock `/api/job/{id}/status/`, `/api/job/{id}/download/`, `/api/job/{id}/cancel/` rutean correctamente
- `_handleJobStatus` devuelve `done` + `file_url` tras 3 polls con el mismo job_id
- `ReportExport.jsx` hace polling cada 3s hasta `done` o `failed`
- UI muestra botón de descarga cuando `done`, botón cancelar cuando `queued/running`
- 5 códigos de error específicos con mensajes descriptivos
- Notificación al usuario cuando el poll detecta `done`
- 1989+ tests pasando
