```yml
created_at: 2026-05-09 03:54:42
project: THYROX
work_package: 2026-05-09-03-54-42-report-export-complete
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — report-export-complete

## Decisiones de diseño

- **DECISION-01**: Polling implementado en `ReportExport.jsx` con `useEffect` + `setInterval`
  (3s) + cleanup con `clearInterval`. No se usa el caching de `jobGateway.status` —
  llamar a `apiService.get` directamente para evitar respuestas cacheadas durante el poll.
- **DECISION-02**: Mock `_handleJobStatus` devuelve `done` + `file_url` tras 3 polls del
  mismo `job_id`. Usar un contador en memoria (`Map`) por job_id para simular progreso.
  Parámetro `?test_state=done` para forzar estado en tests (patrón de pipeline-scope-audit).
- **DECISION-03**: Routing del mock corregido con `url.match(/\/api\/job\/[^/]+\/status\//)`,
  análogamente para download y cancel.
- **DECISION-04**: Cuando poll detecta `done`, disparar toast informativo con link de
  descarga (notificación local). No implementar backend→mailbox si no existe endpoint mock.
- **DECISION-05**: T-007 excluido — spec no define export por página individual.
  Scope final: `ReportExport.jsx` + mock + tests.

## DAG de dependencias

```
T-001 → T-002 → T-003 → T-004 (B-I: mock fixes)
T-004 → T-005 → T-006      (B-II: UI polling + download)
T-006 → T-007 → T-008      (B-III: cancel + errors + tests + commit)
```

---

## BLOQUE I — Fix mock infrastructure

### T-001 — Corregir routing de `/api/job/{id}/status/`, `/api/job/{id}/download/`, `/api/job/{id}/cancel/`

**Archivo:** `src/mocks/mockInterceptor.js`

Reemplazar (líneas ~138-150):
```js
// ANTES — routing plano (no captura URLs con id)
if (url.includes('/api/job/status/'))    return this._handleJobStatus(url)
if (url.includes('/api/job/download/'))  return this._handleJobDownload(url)
if (url.includes('/api/job/cancel/'))    return this._handleJobCancel(url)

// DESPUÉS — routing con id en path
if (url.match(/\/api\/job\/[^/]+\/status\//))    return this._handleJobStatus(url)
if (url.match(/\/api\/job\/[^/]+\/download\//))  return this._handleJobDownload(url)
if (url.match(/\/api\/job\/[^/]+\/cancel\//))    return this._handleJobCancel(url)
```

- [ ] T-001 — Corregir routing mock `/api/job/{id}/*`

---

### T-002 — Actualizar `_handleJobStatus` para retornar `done` + `file_url` tras 3 polls

**Archivo:** `src/mocks/mockInterceptor.js`

`_handleJobStatus` necesita un contador por job_id para simular progreso:

```js
// En la clase: inicializar Map de contadores
_jobPollCounters = new Map()

_handleJobStatus(url) {
  const jobId = url.split('/').filter(Boolean).slice(-2)[0]
  const testState = url.includes('?test_state=done') ? 'done'
    : url.includes('?test_state=failed') ? 'failed' : null

  if (testState) {
    return {
      status: 200,
      data: {
        job_id: jobId,
        status: testState,
        progress: testState === 'done' ? 100 : 0,
        file_url: testState === 'done'
          ? `https://storage.example.com/exports/${jobId}.csv?ttl=86400` : null,
        error: testState === 'failed' ? 'Export failed' : null,
      }
    }
  }

  const count = (this._jobPollCounters.get(jobId) || 0) + 1
  this._jobPollCounters.set(jobId, count)

  if (count >= 3) {
    return {
      status: 200,
      data: {
        job_id: jobId,
        status: 'done',
        progress: 100,
        file_url: `https://storage.example.com/exports/${jobId}.csv?ttl=86400`,
        error: null,
      }
    }
  }

  return {
    status: 200,
    data: {
      job_id: jobId,
      status: count === 1 ? 'queued' : 'running',
      progress: count * 30,
      file_url: null,
      error: null,
    }
  }
}
```

- [ ] T-002 — Actualizar `_handleJobStatus` con contador + `done`/`file_url`

---

### T-003 — Agregar códigos de error específicos al handler POST `/api/reports/export/`

**Archivo:** `src/mocks/mockInterceptor.js` — handler de POST `/api/reports/export/` (l.239)

Agregar soporte para `?test_error=` en URL o en body:

```js
if (url.includes('/api/reports/export/')) {
  // Errores específicos vía parámetro de test
  const errorCode = options?.params?.test_error || body?.test_error
  if (errorCode === 'ROW_LIMIT_EXCEEDED') {
    return this._error(400, 'El reporte supera el límite de filas exportables', 'ROW_LIMIT_EXCEEDED')
  }
  if (errorCode === 'EXPORT_LIMIT_EXCEEDED') {
    return this._error(429, 'Ya tiene exports activos en cola. Espere a que finalicen.', 'EXPORT_LIMIT_EXCEEDED')
  }
  if (errorCode === 'PERMISSION_REVOKED') {
    return this._error(403, 'Permiso reports:export revocado', 'PERMISSION_REVOKED')
  }
  if (errorCode === 'TOO_LARGE') {
    return this._error(413, 'El dataset supera el límite de tamaño de archivo', 'TOO_LARGE')
  }
  return {
    status: 202,
    data: { job_id: `report-export-${Date.now()}` },
  }
}
```

Verificar que `this._error()` ya acepta un tercer parámetro `code` — si no, extenderlo.

- [ ] T-003 — Agregar error codes al mock POST `/api/reports/export/`

---

### T-004 — Agregar `getExportJobStatus` a `reportsGateway.js`

**Archivo:** `src/services/reportsGateway.js`

Agregar método que llame directamente a la URL del job (sin pasar por `jobGateway` con caching):

```js
async getExportJobStatus(jobId) {
  return apiService.get(`/api/job/${jobId}/status/`)
}

async cancelExportJob(jobId) {
  return apiService.post(`/api/job/${jobId}/cancel/`, {})
}
```

Actualizar el header de endpoints del archivo.

- [ ] T-004 — Agregar `getExportJobStatus` + `cancelExportJob` a reportsGateway

---

## BLOQUE II — Polling + descarga en ReportExport.jsx

### T-005 — Implementar polling en `ReportExport.jsx`

**Archivo:** `src/pages/reports/ReportExport.jsx`

```jsx
const [jobStatus, setJobStatus] = useState(null)   // null | 'queued' | 'running' | 'done' | 'failed'
const [fileUrl, setFileUrl] = useState(null)
const pollingRef = useRef(null)

// Limpieza al desmontar
useEffect(() => {
  return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
}, [])

// Iniciar polling cuando hay jobId y el job no está terminado
useEffect(() => {
  if (!jobId || jobStatus === 'done' || jobStatus === 'failed') return
  pollingRef.current = setInterval(async () => {
    try {
      const res = await reportsService.getExportJobStatus(jobId)
      setJobStatus(res.status)
      if (res.status === 'done') {
        setFileUrl(res.file_url)
        clearInterval(pollingRef.current)
      } else if (res.status === 'failed') {
        setError(res.error ?? 'La exportación falló')
        clearInterval(pollingRef.current)
      }
    } catch (err) {
      setError(err.message)
      clearInterval(pollingRef.current)
    }
  }, 3000)
  return () => clearInterval(pollingRef.current)
}, [jobId])
```

Agregar `useRef` al import de React.

- [ ] T-005 — Implementar polling 3s en ReportExport.jsx

---

### T-006 — Mostrar estado de progreso + botón de descarga cuando `done`

**Archivo:** `src/pages/reports/ReportExport.jsx`

Reemplazar el bloque `{jobId && (...)}` por:

```jsx
{jobId && (
  <div style={{ padding: '12px 16px', backgroundColor: '#1e3a5f', border: '1px solid #2563eb',
    borderRadius: '6px', fontSize: '14px', color: '#bfdbfe' }}>

    {jobStatus === 'done' ? (
      <>
        <strong style={{ color: '#a7f3d0' }}>✓ Exportación lista.</strong>
        {' '}Job ID: <code>{jobId}</code>
        <div style={{ marginTop: '12px' }}>
          <a href={fileUrl} download className="btn btn-primary" style={{ fontSize: '13px' }}>
            Descargar archivo
          </a>
        </div>
      </>
    ) : jobStatus === 'failed' ? (
      <span style={{ color: '#fca5a5' }}>✗ La exportación falló. Intente nuevamente.</span>
    ) : (
      <>
        <strong>Exportación en progreso…</strong>
        {' '}Job ID: <code>{jobId}</code>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#93c5fd' }}>
          {jobStatus === 'queued' ? 'En cola…' : 'Procesando…'}
        </p>
      </>
    )}
  </div>
)}
```

- [ ] T-006 — Mostrar progreso/descarga/fallo en UI

---

## BLOQUE III — Cancelar + errores específicos + tests + commit

### T-007 — Botón cancelar + errores específicos

**Cancelar** (dentro del bloque `{jobId && (...)}` cuando `jobStatus` no es `done`/`failed`):

```jsx
{(jobStatus === 'queued' || jobStatus === 'running') && (
  <button
    className="btn btn-secondary"
    style={{ marginTop: '8px', fontSize: '12px' }}
    onClick={async () => {
      await reportsService.cancelExportJob(jobId)
      setJobId(null)
      setJobStatus(null)
      setFileUrl(null)
      if (pollingRef.current) clearInterval(pollingRef.current)
    }}
  >
    Cancelar exportación
  </button>
)}
```

**Errores específicos** — mapa de código a mensaje descriptivo:

```js
const ERROR_MESSAGES = {
  ROW_LIMIT_EXCEEDED: 'El reporte supera el límite de filas exportables. Aplique filtros de fecha para reducir el rango.',
  EXPORT_LIMIT_EXCEEDED: 'Ya tiene exports activos en cola. Espere a que finalicen antes de solicitar uno nuevo.',
  PERMISSION_REVOKED: 'Su permiso de exportación fue revocado. Contacte al administrador.',
  TOO_LARGE: 'El dataset supera el límite de tamaño. Use filtros adicionales o solicite un formato más compacto.',
}

// En el catch:
const code = err.code ?? err.data?.code
setError(ERROR_MESSAGES[code] ?? err.message)
```

- [ ] T-007 — Botón cancelar + errores específicos con mensajes descriptivos

---

### T-008 — Tests de `ReportExport` + verificación + commit B

**Archivo:** `src/pages/reports/__tests__/ReportExportPage.test.jsx` (crear si no existe)

Tests requeridos:
1. `renderiza formulario con selects de tipo y formato`
2. `submit POST → muestra job_id y estado "En cola"`
3. `poll detecta done → muestra botón Descargar archivo`
4. `poll detecta failed → muestra mensaje de fallo`
5. `botón cancelar visible cuando status=queued; click llama cancelExportJob`
6. `ROW_LIMIT_EXCEEDED → mensaje descriptivo`
7. `EXPORT_LIMIT_EXCEEDED → mensaje descriptivo`

Ejecutar suite completa: `npx jest --no-coverage` → 1989+ tests.
Commit B: "Implement UC_RPT_04 full async export flow"

- [ ] T-008 — Tests ReportExport + suite verde + commit

---

## Métricas de éxito

| Métrica | Baseline | Target |
|---------|----------|--------|
| Routing mock `/api/job/{id}/*` | ❌ roto | ✓ funcional |
| `_handleJobStatus` retorna `done` | Nunca | Tras 3 polls |
| Error codes en mock export | 0 | 4 |
| Polling en UI | No | Sí (3s interval, cleanup) |
| Botón descarga cuando done | No | Sí |
| Botón cancelar cuando queued/running | No | Sí |
| Tests pasando | 1989 | ≥ 1989 |
