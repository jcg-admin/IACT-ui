```yaml
type: Dashboard de Proyecto
version: 0.1.0
project: IACT-UI
updated_at: 2026-05-05 07:32:33
branch_activo: feature/project-structure-analysis
```

# Project State — IACT-UI

## Descripción del proyecto

**IACT-UI** es el frontend del sistema IVR Analytics & Customer Tracking.
Dashboard React para analítica de llamadas, gestión de usuarios y reportes
en un entorno de call center.

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| UI Framework | React | 19.0 |
| Estado global | Redux Toolkit | 2.x |
| Routing | React Router DOM | 6.x |
| Bundler | Webpack | 5.x |
| Charts | Recharts | 2.x |
| Animaciones | Framer Motion | 12.x |
| Exports | ExcelJS + jsPDF | latest |
| Query | TanStack React Query | 5.x |
| Lenguaje | JavaScript (JSX) + TypeScript selectivo | - |
| Tests | Jest + React Testing Library | 29.x / 16.x |
| Linting | ESLint 8 + TypeScript ESLint | - |

## Estado actual (2026-05-05)

### Tests
- **20 suites originales:** todas pasan ✅
- **37 suites heredadas de develop:** fallan ❌ (paths incorrectos)
- **Cobertura:** Statements 89%, Branches 80%, Functions 88%, Lines 89% ✅

### Seguridad
- Vulnerabilidades: **4 moderadas** (antes: 23 — 9 altas)

### Calidad de código
- ESLint: **0 errores, 9 warnings** (console.log en hooks TS)
- TypeScript: soporte via `@babel/preset-typescript`

## WPs activos

| WP | Estado | Descripción |
|----|--------|-------------|
| `2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup` | `in_progress` | Limpieza de contexto foráneo y setup THYROX para IACT-UI |

## Deuda técnica conocida

Ver `technical-debt.md` para el backlog completo.

## Agentes disponibles

Los 29 agentes nativos de THYROX aplican a este proyecto.
Agentes más relevantes para IACT-UI:

- `react-expert` — Implementación de componentes React
- `webpack-expert` — Configuración de build y bundles
- `task-planner` — Planificación de WPs
- `task-executor` — Ejecución de fases EXECUTE
- `deep-dive` — Análisis adversarial de arquitectura
- `deep-review` — Revisión de calidad de código
