import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSpeedData } from '../use-realtime-speed-data';
import { config } from '@/config/env';

// Mock dependencies
vi.mock('@/config/env', () => ({
  config: {
    isSimulation: false,
    isDevelopment: true,
    isProduction: false,
    requiresAPI: true,
    apiBaseUrl: 'http://localhost:3001',
  },
}));

vi.mock('@/lib/mock-data', () => ({
  mockSpeedData: [
    {
      id: 1,
      sensor_name: 'Test Sensor',
      speed: 200,
      lane: 'left',
      created_at: '2025-12-05T10:00:00Z',
    },
  ],
}));

vi.mock('@/services/speed-api', () => ({
  speedAPI: {
    getSpeeds: vi.fn().mockResolvedValue([]),
    connectToSpeedStream: vi.fn().mockReturnValue({
      onopen: null,
      close: vi.fn(),
    }),
  },
}));

describe('useRealtimeSpeedData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Simulation Mode', () => {
    beforeEach(() => {
      vi.mocked(config).isSimulation = true;
      vi.mocked(config).requiresAPI = false;
    });

    it('returns initial data structure', () => {
      const { result } = renderHook(() => useRealtimeSpeedData());

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('connectionMode');
    });

    it('sets connectionMode to "simulation" in simulation mode', () => {
      const { result } = renderHook(() => useRealtimeSpeedData());

      expect(result.current.connectionMode).toBe('simulation');
    });

    it('sets isConnected to true in simulation mode', () => {
      const { result } = renderHook(() => useRealtimeSpeedData());

      expect(result.current.isConnected).toBe(true);
    });

    it('loads mock data initially', () => {
      const { result } = renderHook(() => useRealtimeSpeedData());

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('respects maxDataPoints parameter', () => {
      const maxPoints = 10;
      const { result } = renderHook(() =>
        useRealtimeSpeedData(1000, maxPoints)
      );

      expect(result.current.data.length).toBeLessThanOrEqual(maxPoints);
    });
  });

  describe('Hook Parameters', () => {
    beforeEach(() => {
      vi.mocked(config).isSimulation = true;
      vi.mocked(config).requiresAPI = false;
    });
    it('accepts custom intervalMs parameter', () => {
      const customInterval = 5000;
      const { result } = renderHook(() =>
        useRealtimeSpeedData(customInterval, 100)
      );

      expect(result.current).toBeDefined();
    });

    it('accepts custom maxDataPoints parameter', () => {
      const customMaxPoints = 50;
      const { result } = renderHook(() =>
        useRealtimeSpeedData(3000, customMaxPoints)
      );

      expect(result.current).toBeDefined();
    });

    it('uses default parameters when not provided', () => {
      const { result } = renderHook(() => useRealtimeSpeedData());

      expect(result.current).toBeDefined();
      expect(result.current.data).toBeDefined();
    });
  });

  describe('Data Updates', () => {
    beforeEach(() => {
      vi.mocked(config).isSimulation = true;
      vi.mocked(config).requiresAPI = false;
    });

    it('generates new data points over time in simulation mode', async () => {
      const { result } = renderHook(() => useRealtimeSpeedData(1000, 120));

      const initialLength = result.current.data.length;

      // Advance timers to trigger interval
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.data.length).toBeGreaterThan(initialLength);
    });
  });

  describe('Cleanup', () => {
    it('cleans up interval on unmount in simulation mode', () => {
      vi.mocked(config).isSimulation = true;
      vi.mocked(config).requiresAPI = false;

      const { unmount } = renderHook(() => useRealtimeSpeedData(1000, 120));

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
