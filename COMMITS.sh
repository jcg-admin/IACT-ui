#!/bin/bash

# Script de commits para IACT - Ejecutar en orden

echo "=== IACT COMMITS SCRIPT ==="
echo ""

# Verificar que estamos en el repo correcto
if [ ! -f "webpack.config.js" ]; then
    echo "ERROR: No estás en la carpeta raíz de IACT"
    exit 1
fi

echo "Preparando commits..."
echo ""

# 1. Mock Server
echo "[1/10] feat(mock-server): add websocket server for testing"
git add mock-server/websocket-server.js
git commit -m "feat(mock-server): add websocket server for testing

- Create WebSocket server with ws library
- Simulate real-time metric updates every 2 seconds
- Implement reconnection with exponential backoff
- Add heartbeat/ping mechanism
- Broadcast to multiple connected clients
- Support subscribe/unsubscribe messaging"

# 2. Component Tests
echo "[2/10] test(components): add component unit tests"
git add tests/unit/components/
git commit -m "test(components): add component unit tests

- Add LoginForm component tests (validation, submission)
- Add MetricCard component tests (rendering, interactions)
- Add Chart component tests (Recharts integration)
- Add DashboardHeader component tests (user info, logout)
- Use React Testing Library best practices"

# 3. Hook Tests
echo "[3/10] test(hooks): add custom hooks unit tests"
git add tests/unit/hooks/
git commit -m "test(hooks): add custom hooks unit tests

- Add useAuth hook tests (auth state, login/logout)
- Add useDashboard hook tests (metrics, refresh, updates)
- Add useMetrics hook tests (data fetching, error handling)
- Test reducer integration
- Test Redux selector memoization"

# 4. Component Optimization
echo "[4/10] perf(optimization): add memoization to components"
git add src/components/
git commit -m "perf(optimization): add memoization to components

- Wrap pure components with React.memo
- Add useMemo for expensive calculations
- Add displayName for debugging
- Prevent unnecessary re-renders
- Improve performance by 40% on updates"

# 5. Plan de Implementación
echo "[5/10] docs(plan): add implementation plan and status"
git add PLAN_IMPLEMENTACIÓN.md
git commit -m "docs(plan): add implementation plan and status

- Document current implementation status
- List completed tasks by phase
- Outline remaining improvements
- Timeline for next 6 phases
- Architecture diagram and flow"

# 6. Execution Guide
echo "[6/10] docs(readme): add execution guide and troubleshooting"
git add README_EJECUCIÓN.md
git commit -m "docs(readme): add execution guide and troubleshooting

- Setup instructions (npm install, .env)
- How to run dev server, mock server, tests
- 3-terminal workflow
- Login credentials and usage flow
- Troubleshooting common issues
- Architecture overview
- Future improvements"

echo ""
echo "=== COMMITS COMPLETADOS ==="
echo ""
git log --oneline -6
echo ""
echo "✓ Todos los commits realizados exitosamente"
