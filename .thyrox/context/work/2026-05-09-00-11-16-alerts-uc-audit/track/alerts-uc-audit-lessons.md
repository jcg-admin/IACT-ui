```yml
created_at: 2026-05-09 00:11:16
project: THYROX
work_package: 2026-05-09-00-11-16-alerts-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — alerts-uc-audit

## L-01: CNST-001 violations survive module-level audits

El WP `remaining-modules-gap-audit` auditó el módulo Alertas a alto nivel y encontró
1 gap (acknowledgeAlert). Las violaciones de CNST-001 (EMAIL/SMS en UI) y los schemas
incorrectos (category/channels/frequency) pasaron sin detectarse porque el audit revisó
comportamiento observable (acciones Redux, flujos principales) pero no los campos del
formulario contra la spec.

**Patrón correcto:** PAT-UC-AUDIT-001 debe incluir revisión del schema del formulario
campo por campo contra la spec, no solo el flujo de acción.

## L-02: El gateway es prerequisito antes de cualquier schema fix

Migrar alertsGateway de `fetch()` raw a `apiService` antes de corregir los schemas
asegura que los nuevos endpoints (rules/, subscriptions/) ya tienen manejo de errores
consistente con el resto del proyecto. El orden inverso habría requerido doble revisión
del gateway.

## L-03: `subscribeToAlert` cambio de firma es breaking change

La firma original `subscribeToAlert(alertId, channels, frequency)` era incorrecta según
spec. Cambiarla a `subscribeToAlert(subscriptionData)` rompe cualquier caller que use
la firma vieja. Verificar que el slice (thunk) usa el nuevo schema.

## L-04: `selectActiveAlerts` filtrando por `is_active` era silent bug

El selector `selectActiveAlerts` retornaba `[]` en producción porque los fixtures mock
usan `state: 'firing'` pero el selector esperaba `is_active: true`. Este tipo de
mismatch es invisible en tests de render (solo verifican título) pero falla en
integración con backend real.

## L-05: Anotaciones de UC incorrectas indican mislabeling sistémico

Los 5 archivos del módulo tenían UC labels incorrectos en su cabecera, con desfase de
exactamente +1 (ej: UC_ALR_02 implementa lo que debería ser UC_ALR_01). Esto sugiere
que el módulo fue creado con un schema de numeración diferente al de la spec y nunca se
reconcilió. En auditorías futuras, verificar que el UC en el comentario de cabecera
coincida con el comportamiento implementado.
