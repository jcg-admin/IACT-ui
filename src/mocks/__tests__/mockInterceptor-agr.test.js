/**
 * Tests for mockInterceptor AGR data model (G-F2, G-F3)
 *
 * Verifies that:
 * - GET /api/admin/agr/ returns objects with snake_case `codename`
 * - GET returns `active: true` (boolean), not `state: 'ACTIVE'` (string)
 * - POST creates AGR with `active: true` (boolean)
 */
import { MockInterceptor } from '../mockInterceptor'

const interceptor = new MockInterceptor()
interceptor.enabled = true
interceptor.mockDelay = 0

async function callGet(url) {
  return interceptor.intercept(url, { method: 'GET', body: null })
}

async function callPost(url, body) {
  return interceptor.intercept(url, { method: 'POST', body: JSON.stringify(body) })
}

describe('mockInterceptor — AGR data model (G-F2, G-F3)', () => {
  describe('GET /api/admin/agr/', () => {
    let agrs

    beforeAll(async () => {
      const response = await callGet('/api/admin/agr/')
      agrs = response.data.results
    })

    it('returns at least 10 AGR objects', () => {
      expect(agrs.length).toBeGreaterThanOrEqual(10)
    })

    it('each AGR has codename in snake_case format (not ID format)', () => {
      agrs.forEach((agr) => {
        expect(agr.codename).toMatch(/^[a-z][a-z0-9_]*$/)
        expect(agr.codename).not.toMatch(/^AGR-\d+$/)
      })
    })

    it('first AGR codename is basic_operator_group', () => {
      expect(agrs[0].codename).toBe('basic_operator_group')
    })

    it('each AGR has active as boolean true, not state string', () => {
      agrs.forEach((agr) => {
        expect(typeof agr.active).toBe('boolean')
        expect(agr.active).toBe(true)
        expect(agr.state).toBeUndefined()
      })
    })
  })

  describe('POST /api/admin/agr/', () => {
    it('creates AGR with active: true (boolean)', async () => {
      const response = await callPost('/api/admin/agr/', {
        codename: 'new_test_group',
        name: 'Nuevo Grupo Test',
        description: 'Test',
      })
      expect(response.status).toBe(201)
      expect(typeof response.data.active).toBe('boolean')
      expect(response.data.active).toBe(true)
      expect(response.data.state).toBeUndefined()
    })

    it('created AGR codename matches posted codename', async () => {
      const response = await callPost('/api/admin/agr/', {
        codename: 'custom_group',
        name: 'Grupo Personalizado',
      })
      expect(response.data.codename).toBe('custom_group')
    })
  })
})
