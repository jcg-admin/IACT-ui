import accessService from '../accessGateway';

const mockJson = jest.fn();
const mockFetch = jest.fn();

beforeEach(() => {
    global.fetch = mockFetch;
    mockJson.mockResolvedValue({ ok: true });
    mockFetch.mockResolvedValue({ ok: true, json: mockJson, blob: mockJson });
    localStorage.setItem('accessToken', 'test-token-123');
});

afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

describe('AccessService.getAuthHeaders', () => {
    it('returns Authorization header with Bearer token from localStorage', () => {
        const headers = accessService.getAuthHeaders();
        expect(headers['Authorization']).toBe('Bearer test-token-123');
        expect(headers['Content-Type']).toBe('application/json');
    });

    it('reads token dynamically on each call', () => {
        localStorage.setItem('accessToken', 'new-token');
        const headers = accessService.getAuthHeaders();
        expect(headers['Authorization']).toBe('Bearer new-token');
    });
});

describe('AccessService.getFunctionGroups', () => {
    it('calls GET /access/groups/ with auth header', async () => {
        await accessService.getFunctionGroups();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/access/groups/'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({ Authorization: 'Bearer test-token-123' }),
            })
        );
    });
});

// T-025: UC-ACC-01 — asignar funciones (bulk)
describe('AccessService.assignFunctions', () => {
    it('calls POST /users/{userId}/functions/ with function_ids array', async () => {
        await accessService.assignFunctions(42, [7, 8], null);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/users/42/functions/');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body.function_ids).toEqual([7, 8]);
    });

    it('includes expires_at when provided', async () => {
        await accessService.assignFunctions(1, [2], '2026-12-31');
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.expires_at).toBe('2026-12-31');
    });

    it('sends null expires_at when not provided', async () => {
        await accessService.assignFunctions(1, [3]);
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.expires_at).toBeNull();
    });

    it('throws on error response', async () => {
        mockFetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'Forbidden' }) });
        await expect(accessService.assignFunctions(1, [1])).rejects.toThrow('Forbidden');
    });
});

// T-026: UC-ACC-02 — revocar funciones (bulk)
describe('AccessService.revokeFunctions', () => {
    it('calls DELETE /users/{userId}/functions/ with function_ids array', async () => {
        await accessService.revokeFunctions(5, [10, 11], 'Baja de usuario');
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/users/5/functions/');
        expect(options.method).toBe('DELETE');
        const body = JSON.parse(options.body);
        expect(body.function_ids).toEqual([10, 11]);
    });

    it('includes revoke_reason in body', async () => {
        await accessService.revokeFunctions(5, [10], 'Cambio de rol');
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.revoke_reason).toBe('Cambio de rol');
    });

    it('throws on error response', async () => {
        mockFetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'Not found' }) });
        await expect(accessService.revokeFunctions(1, [1], 'reason')).rejects.toThrow('Not found');
    });
});

// T-027: UC-AUD-03 — exportar auditoría (async → job_id)
describe('AccessService.exportAuditLog', () => {
    it('calls POST /audit/export/ (not /access/audit/export)', async () => {
        mockFetch.mockResolvedValue({ ok: true, status: 202, json: async () => ({ job_id: 'j-1' }) });
        await accessService.exportAuditLog({}, 'monthly', 'csv', false);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/audit/export/');
        expect(url).not.toContain('/access/audit/export');
        expect(options.method).toBe('POST');
    });

    it('sends filters, period, format, include_archive in body', async () => {
        mockFetch.mockResolvedValue({ ok: true, status: 202, json: async () => ({ job_id: 'j-2' }) });
        const filters = { user_id: 42 };
        await accessService.exportAuditLog(filters, 'weekly', 'json', true);
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.filters).toEqual(filters);
        expect(body.period).toBe('weekly');
        expect(body.format).toBe('json');
        expect(body.include_archive).toBe(true);
    });

    it('returns job_id from 202 response (NOT blob)', async () => {
        mockFetch.mockResolvedValue({ ok: true, status: 202, json: async () => ({ job_id: 'job-xyz' }) });
        const result = await accessService.exportAuditLog({}, 'monthly', 'csv', false);
        expect(result.job_id).toBe('job-xyz');
    });

    it('throws on error response', async () => {
        mockFetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'Server error' }) });
        await expect(accessService.exportAuditLog({}, 'monthly', 'csv', false)).rejects.toThrow('Server error');
    });
});

// T-028: UC-ACC-04 — asignar grupo de acceso (AGR)
describe('AccessService.assignAccessGroup', () => {
    it('calls POST /users/{userId}/access-groups/ with agr_id', async () => {
        await accessService.assignAccessGroup(3, 99, null);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/users/3/access-groups/');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body.agr_id).toBe(99);
    });

    it('includes expires_at when provided', async () => {
        await accessService.assignAccessGroup(3, 99, '2027-01-01');
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.expires_at).toBe('2027-01-01');
    });

    it('sends null expires_at when not provided', async () => {
        await accessService.assignAccessGroup(3, 99);
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.expires_at).toBeNull();
    });

    it('throws on error response', async () => {
        mockFetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'Forbidden' }) });
        await expect(accessService.assignAccessGroup(1, 1)).rejects.toThrow('Forbidden');
    });
});

describe('AccessService error handling', () => {
    it('throws generic message when response body has no message field', async () => {
        mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });
        await expect(accessService.assignFunctions(1, [1])).rejects.toThrow();
    });
});
