```yml
created_at: 2026-05-09 05:20:00
project: THYROX
work_package: 2026-05-09-03-54-42-report-export-complete
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — report-export-complete

## L-01: Mock routing con IDs en path — usar regex, no includes

`url.includes('/api/job/status/')` nunca coincide con `/api/job/{id}/status/`.
Patrón correcto: `url.match(/\/api\/job\/[^/]+\/status\//)`.
Aplicable a cualquier endpoint REST con ID en segmento intermedio de la URL.

**Impacto:** Los tres handlers de job (status, download, cancel) estaban
inaccesibles via el gateway — bug silencioso desde el origen del código.

## L-02: Caching de gateway puede romper polling

`jobGateway.status()` usa `withCaching(TTL.SHORT)` — correcto para uso general,
pero durante polling retornaría respuestas cacheadas impidiendo detectar el
cambio de estado. Solución: método dedicado en `reportsGateway` que llama
`apiService.get` directamente, sin caching.

**Patrón generalizable:** Cuando se implementa polling, verificar si el
método de servicio tiene caching. Si lo tiene, crear un método alternativo
sin caché para el polling.

## L-03: Dos sistemas de exportación son complementarios, no duplicados

El proyecto tiene tres sistemas de exportación: (A) cliente síncrono
(ExportButtons + useExport + exportGateway/ExcelJS), (B) servidor asíncrono
(ReportExport + reportsGateway), (C) módulo audit. La presencia de múltiples
sistemas no implica duplicación — cada uno sirve un caso de uso distinto
(datos pequeños en memoria vs. datasets grandes con worker backend).

**Anti-patrón:** asumir que dos sistemas similares son duplicados sin
verificar sus consumidores y casos de uso.

## L-04: Faker timers en tests de polling requieren `act()` + `advanceTimersByTime`

Tests de `setInterval` con `jest.useFakeTimers()` necesitan `act(async () => { jest.advanceTimersByTime(3100) })` para que las promesas dentro del interval se resuelvan correctamente antes del `waitFor`. Sin `act()` las actualizaciones de estado quedan pendientes.
