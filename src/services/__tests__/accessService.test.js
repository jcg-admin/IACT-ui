import accessService from '../accessService';

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
    it('calls GET /access/function-groups with auth header', async () => {
        await accessService.getFunctionGroups();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/access/function-groups'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({ Authorization: 'Bearer test-token-123' }),
            })
        );
    });
});

describe('AccessService.assignFunction', () => {
    it('calls POST /access/functions/assign with userId and functionId in body', async () => {
        await accessService.assignFunction(42, 7, null);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/access/functions/assign'),
            expect.objectContaining({ method: 'POST' })
        );
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.userId).toBe(42);
        expect(body.functionId).toBe(7);
    });

    it('includes expiresAt when provided', async () => {
        await accessService.assignFunction(1, 2, '2026-12-31');
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.expiresAt).toBe('2026-12-31');
    });
});

describe('AccessService.revokeFunction', () => {
    it('calls POST /access/functions/revoke with userId and functionId in body', async () => {
        await accessService.revokeFunction(5, 10);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/access/functions/revoke'),
            expect.objectContaining({ method: 'POST' })
        );
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.userId).toBe(5);
        expect(body.functionId).toBe(10);
    });
});

describe('AccessService.assignFunctionGroup', () => {
    it('calls POST /access/function-groups/assign with userId and functionGroupId', async () => {
        await accessService.assignFunctionGroup(3, 99);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/access/function-groups/assign');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body.userId).toBe(3);
        expect(body.functionGroupId).toBe(99);
    });
});

describe('AccessService error handling', () => {
    it('throws when response is not ok', async () => {
        mockFetch.mockResolvedValue({ ok: false, json: async () => ({ message: 'Forbidden' }) });
        await expect(accessService.assignFunction(1, 1)).rejects.toThrow('Forbidden');
    });
});
