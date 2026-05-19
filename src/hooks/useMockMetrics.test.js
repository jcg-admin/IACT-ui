import { renderHook, act } from '@testing-library/react';
import { useMockMetrics } from './useMockMetrics';
import { recordMockUsage, resetMockUsageMetrics } from '@api/utils/mockUsageTracker';

describe('useMockMetrics', () => {
  beforeEach(() => {
    resetMockUsageMetrics();
  });

  it('returns live mock dependency summary', () => {
    const { result } = renderHook(() => useMockMetrics());

    expect(result.current.summary.totalDomains).toBe(0);

    act(() => {
      recordMockUsage('calls', 'mock');
      recordMockUsage('config', 'api');
    });

    expect(result.current.summary.totalDomains).toBe(2);
    expect(result.current.summary.domainsUsingMock).toBe(1);
    expect(result.current.metrics.calls).toEqual({ api: 0, mock: 1 });
  });

  it('handles empty metrics without crashing', () => {
    const { result } = renderHook(() => useMockMetrics());

    expect(result.current.summary.totalDomains).toBe(0);
    expect(result.current.summary.domainsUsingMock).toBe(0);
  });
});
