/**
 * Tests for mockInterceptor permisos handler (G-M1)
 *
 * Verifies that GET /api/permisos/verificar/{userId}/capacidades/
 * returns the correct capacidades array from mock data.
 * SP-01 decision: explicit handler required (ADR-BACK-005).
 */
import { MockInterceptor } from '../mockInterceptor'

const interceptor = new MockInterceptor()
interceptor.enabled = true
interceptor.mockDelay = 0

async function callGet(url) {
  return interceptor.intercept(url, { method: 'GET', body: null })
}

describe('mockInterceptor — /api/permisos/verificar/ handler (G-M1)', () => {
  describe('GET /api/permisos/verificar/{userId}/capacidades/', () => {
    it('returns 200 for user 10 (maria.garcia — permissions.json)', async () => {
      const response = await callGet('/api/permisos/verificar/10/capacidades/')
      expect(response.status).toBe(200)
    })

    it('response for user 10 includes capacidades array', async () => {
      const response = await callGet('/api/permisos/verificar/10/capacidades/')
      expect(Array.isArray(response.data.capacidades)).toBe(true)
      expect(response.data.capacidades.length).toBeGreaterThan(0)
    })

    it('response for user 10 includes user_id', async () => {
      const response = await callGet('/api/permisos/verificar/10/capacidades/')
      expect(response.data.user_id).toBe(10)
    })

    it('response for user 10 capacidades includes AUTH-001 (auth:view_own_sessions)', async () => {
      const response = await callGet('/api/permisos/verificar/10/capacidades/')
      expect(response.data.capacidades).toContain('AUTH-001') // auth:view_own_sessions (RBAC v5.4.0)
    })

    it('response for user 10 includes access_groups array', async () => {
      const response = await callGet('/api/permisos/verificar/10/capacidades/')
      expect(Array.isArray(response.data.access_groups)).toBe(true)
    })

    it('returns 200 for user 99 (sistema.admin — permissions-admin.json)', async () => {
      const response = await callGet('/api/permisos/verificar/99/capacidades/')
      expect(response.status).toBe(200)
    })

    it('response for user 99 includes ADM-001 (adm:manage_catalog) (SP-02 — AGR-010)', async () => {
      const response = await callGet('/api/permisos/verificar/99/capacidades/')
      expect(response.data.capacidades).toContain('ADM-001') // adm:manage_catalog (RBAC v5.4.0)
    })

    it('returns 404 for unknown userId', async () => {
      const response = await callGet('/api/permisos/verificar/999/capacidades/')
      expect(response.status).toBe(404)
    })
  })
})
