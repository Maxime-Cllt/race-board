import { describe, it, expect } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../settings-context';
import { Lane } from '@/types/speed-data';
import React from 'react';

describe('SettingsContext', () => {
  describe('SettingsProvider', () => {
    it('provides settings context to children', () => {
      const TestComponent = () => {
        const { settings } = useSettings();
        return <div>{settings.updateInterval}</div>;
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      expect(screen.getByText('3000')).toBeInTheDocument();
    });

    it('loads settings from localStorage if available', () => {
      const savedSettings = {
        updateInterval: 5000,
        maxDataPoints: 200,
        selectedSensors: ['Sensor 1'],
        selectedLanes: [Lane.Left],
        showSpeedChart: false,
        showLaneDistribution: false,
        showSensorStats: false,
        showHourlyTrend: false,
        showSpeedRecords: false,
        showSpeedDistribution: false,
        showAverageSpeedBySensor: false,
        showActivityHeatmap: false,
        showLanePerformance: false,
        showSpeedConsistency: false,
        showTopSensors: false,
        showTimePeriodAnalysis: false,
        enableAlerts: false,
        speedThresholdMin: 50,
        speedThresholdMax: 400,
      };

      localStorage.setItem('race-board-settings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      expect(result.current.settings.updateInterval).toBe(5000);
      expect(result.current.settings.maxDataPoints).toBe(200);

      localStorage.removeItem('race-board-settings');
    });
  });

  describe('useSettings hook', () => {
    it('returns settings and update functions', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      expect(result.current.settings).toBeDefined();
      expect(result.current.updateSettings).toBeDefined();
      expect(result.current.resetSettings).toBeDefined();
    });

    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useSettings());
      }).toThrow('useSettings doit être utilisé dans un SettingsProvider');

      console.error = originalError;
    });
  });

  describe('updateSettings', () => {
    it('updates a single setting', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({ updateInterval: 10000 });
      });

      expect(result.current.settings.updateInterval).toBe(10000);
    });

    it('updates multiple settings at once', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({
          updateInterval: 10000,
          maxDataPoints: 50,
          showSpeedChart: false,
        });
      });

      expect(result.current.settings.updateInterval).toBe(10000);
      expect(result.current.settings.maxDataPoints).toBe(50);
      expect(result.current.settings.showSpeedChart).toBe(false);
    });

    it('persists settings to localStorage', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({ updateInterval: 7000 });
      });

      const savedSettings = JSON.parse(
        localStorage.getItem('race-board-settings') || '{}'
      );

      expect(savedSettings.updateInterval).toBe(7000);

      localStorage.removeItem('race-board-settings');
    });

    it('updates selected sensors array', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({
          selectedSensors: ['Sensor 1', 'Sensor 2'],
        });
      });

      expect(result.current.settings.selectedSensors).toEqual([
        'Sensor 1',
        'Sensor 2',
      ]);
    });

    it('updates selected lanes array', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({ selectedLanes: [Lane.Left] });
      });

      expect(result.current.settings.selectedLanes).toEqual([Lane.Left]);
    });

    it('updates chart visibility settings', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({
          showSpeedChart: false,
          showLaneDistribution: false,
        });
      });

      expect(result.current.settings.showSpeedChart).toBe(false);
      expect(result.current.settings.showLaneDistribution).toBe(false);
    });

    it('updates alert settings', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({
          enableAlerts: true,
          speedThresholdMin: 100,
          speedThresholdMax: 300,
        });
      });

      expect(result.current.settings.enableAlerts).toBe(true);
      expect(result.current.settings.speedThresholdMin).toBe(100);
      expect(result.current.settings.speedThresholdMax).toBe(300);
    });
  });

  describe('resetSettings', () => {
    it('resets all settings to defaults', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      // Modify settings
      act(() => {
        result.current.updateSettings({
          updateInterval: 10000,
          maxDataPoints: 50,
          showSpeedChart: false,
        });
      });

      // Reset
      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings.updateInterval).toBe(3000);
      expect(result.current.settings.maxDataPoints).toBe(120);
      expect(result.current.settings.showSpeedChart).toBe(true);
    });

    it('clears localStorage when resetting', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      // Set some settings
      act(() => {
        result.current.updateSettings({ updateInterval: 10000 });
      });

      // Reset
      act(() => {
        result.current.resetSettings();
      });

      const savedSettings = localStorage.getItem('race-board-settings');
      expect(savedSettings).toBeNull();
    });

    it('resets selected sensors to empty array', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({
          selectedSensors: ['Sensor 1', 'Sensor 2'],
        });
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings.selectedSensors).toEqual([]);
    });

    it('resets selected lanes to both lanes', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      act(() => {
        result.current.updateSettings({ selectedLanes: [Lane.Left] });
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings.selectedLanes).toEqual([
        Lane.Left,
        Lane.Right,
      ]);
    });
  });

  describe('Default Settings', () => {
    it('has correct default values', () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: SettingsProvider,
      });

      const { settings } = result.current;

      expect(settings.updateInterval).toBe(3000);
      expect(settings.maxDataPoints).toBe(120);
      expect(settings.selectedSensors).toEqual([]);
      expect(settings.selectedLanes).toEqual([Lane.Left, Lane.Right]);
      expect(settings.showSpeedChart).toBe(true);
      expect(settings.showLaneDistribution).toBe(true);
      expect(settings.showSensorStats).toBe(true);
      expect(settings.enableAlerts).toBe(false);
      expect(settings.speedThresholdMin).toBe(80);
      expect(settings.speedThresholdMax).toBe(350);
    });
  });
});
