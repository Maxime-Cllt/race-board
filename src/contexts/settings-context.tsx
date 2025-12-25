"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { AppSettings, defaultSettings, DateRangeMode } from "@/types/settings";
import { Lane } from "@/types/speed-data";
import { logger } from "@/lib/logger";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DisplaySettings {
  showLaneDistribution: boolean;
  showSensorStats: boolean;
  showSpeedChart: boolean;
  showHourlyTrend: boolean;
  showSpeedRecords: boolean;
  showSpeedDistribution: boolean;
  showAverageSpeedBySensor: boolean;
  showActivityHeatmap: boolean;
  showLanePerformance: boolean;
  showSpeedConsistency: boolean;
  showTopSensors: boolean;
  showTimePeriodAnalysis: boolean;
}

interface FilterSettings {
  selectedSensors: string[];
  selectedLanes: Lane[];
  dateRangeMode: DateRangeMode;
  customStartDate: string | null;
  customEndDate: string | null;
  speedThresholdMin: number;
  speedThresholdMax: number;
  enableAlerts: boolean;
}

interface SystemSettings {
  updateInterval: number;
  maxDataPoints: number;
}

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  updateSettings: (newSettings: Partial<DisplaySettings>) => void;
}

interface FilterSettingsContextType {
  settings: FilterSettings;
  updateSettings: (newSettings: Partial<FilterSettings>) => void;
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
}

// Legacy context type for backward compatibility
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

// ============================================================================
// CONTEXTS
// ============================================================================

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);
const FilterSettingsContext = createContext<FilterSettingsContextType | undefined>(undefined);
const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "race-board-settings";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function extractDisplaySettings(settings: AppSettings): DisplaySettings {
  return {
    showLaneDistribution: settings.showLaneDistribution,
    showSensorStats: settings.showSensorStats,
    showSpeedChart: settings.showSpeedChart,
    showHourlyTrend: settings.showHourlyTrend,
    showSpeedRecords: settings.showSpeedRecords,
    showSpeedDistribution: settings.showSpeedDistribution,
    showAverageSpeedBySensor: settings.showAverageSpeedBySensor,
    showActivityHeatmap: settings.showActivityHeatmap,
    showLanePerformance: settings.showLanePerformance,
    showSpeedConsistency: settings.showSpeedConsistency,
    showTopSensors: settings.showTopSensors,
    showTimePeriodAnalysis: settings.showTimePeriodAnalysis,
  };
}

function extractFilterSettings(settings: AppSettings): FilterSettings {
  return {
    selectedSensors: settings.selectedSensors,
    selectedLanes: settings.selectedLanes,
    dateRangeMode: settings.dateRangeMode,
    customStartDate: settings.customStartDate,
    customEndDate: settings.customEndDate,
    speedThresholdMin: settings.speedThresholdMin,
    speedThresholdMax: settings.speedThresholdMax,
    enableAlerts: settings.enableAlerts,
  };
}

function extractSystemSettings(settings: AppSettings): SystemSettings {
  return {
    updateInterval: settings.updateInterval,
    maxDataPoints: settings.maxDataPoints,
  };
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Charger les réglages depuis localStorage au démarrage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        return { ...defaultSettings, ...parsedSettings };
      } catch (error) {
        logger.error("Erreur lors du chargement des réglages:", error);
      }
    }
    return defaultSettings;
  });
  const [isInitialized] = useState(true);

  // Sauvegarder les réglages dans localStorage à chaque modification
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    logger.log("⚙️ Updating settings:", newSettings);
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logger.log("📝 New settings state:", updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Create specialized update functions for each context
  const updateDisplaySettings = useCallback((newSettings: Partial<DisplaySettings>) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  const updateFilterSettings = useCallback((newSettings: Partial<FilterSettings>) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  const updateSystemSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  // Extract specialized settings
  const displaySettings = extractDisplaySettings(settings);
  const filterSettings = extractFilterSettings(settings);
  const systemSettings = extractSystemSettings(settings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      <DisplaySettingsContext.Provider value={{ settings: displaySettings, updateSettings: updateDisplaySettings }}>
        <FilterSettingsContext.Provider value={{ settings: filterSettings, updateSettings: updateFilterSettings }}>
          <SystemSettingsContext.Provider value={{ settings: systemSettings, updateSettings: updateSystemSettings }}>
            {children}
          </SystemSettingsContext.Provider>
        </FilterSettingsContext.Provider>
      </DisplaySettingsContext.Provider>
    </SettingsContext.Provider>
  );
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

export function useDisplaySettings(): DisplaySettingsContextType {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    throw new Error("useDisplaySettings must be used within a SettingsProvider");
  }
  return context;
}

export function useFilterSettings(): FilterSettingsContextType {
  const context = useContext(FilterSettingsContext);
  if (!context) {
    throw new Error("useFilterSettings must be used within a SettingsProvider");
  }
  return context;
}

export function useSystemSettings(): SystemSettingsContextType {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error("useSystemSettings must be used within a SettingsProvider");
  }
  return context;
}

/**
 * @deprecated Use useDisplaySettings, useFilterSettings, or useSystemSettings instead
 * This hook is kept for backward compatibility but may cause unnecessary re-renders
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings doit être utilisé dans un SettingsProvider");
  }
  return context;
}

// ============================================================================
// GRANULAR SELECTOR HOOKS
// ============================================================================

/**
 * Hook to get visibility for a specific chart
 * Only re-renders when that specific chart's visibility changes
 */
export function useChartVisibility(chartName: keyof DisplaySettings): boolean {
  const { settings } = useDisplaySettings();
  return settings[chartName];
}

/**
 * Hook to get date range settings
 * Only re-renders when date range settings change
 */
export function useDateRangeSettings() {
  const { settings, updateSettings } = useFilterSettings();
  return {
    dateRangeMode: settings.dateRangeMode,
    customStartDate: settings.customStartDate,
    customEndDate: settings.customEndDate,
    updateDateRange: useCallback(
      (newSettings: Partial<Pick<FilterSettings, 'dateRangeMode' | 'customStartDate' | 'customEndDate'>>) => {
        updateSettings(newSettings);
      },
      [updateSettings]
    ),
  };
}

/**
 * Hook to get lane filter settings
 * Only re-renders when lane selection changes
 */
export function useLaneFilter() {
  const { settings, updateSettings } = useFilterSettings();
  return {
    selectedLanes: settings.selectedLanes,
    updateLanes: useCallback(
      (lanes: Lane[]) => {
        updateSettings({ selectedLanes: lanes });
      },
      [updateSettings]
    ),
  };
}

/**
 * Hook to get sensor filter settings
 * Only re-renders when sensor selection changes
 */
export function useSensorFilter() {
  const { settings, updateSettings } = useFilterSettings();
  return {
    selectedSensors: settings.selectedSensors,
    updateSensors: useCallback(
      (sensors: string[]) => {
        updateSettings({ selectedSensors: sensors });
      },
      [updateSettings]
    ),
  };
}

/**
 * Hook to get speed threshold settings
 * Only re-renders when thresholds change
 */
export function useSpeedThresholds() {
  const { settings, updateSettings } = useFilterSettings();
  return {
    speedThresholdMin: settings.speedThresholdMin,
    speedThresholdMax: settings.speedThresholdMax,
    enableAlerts: settings.enableAlerts,
    updateThresholds: useCallback(
      (newSettings: Partial<Pick<FilterSettings, 'speedThresholdMin' | 'speedThresholdMax' | 'enableAlerts'>>) => {
        updateSettings(newSettings);
      },
      [updateSettings]
    ),
  };
}

/**
 * Hook to get update interval
 * Only re-renders when interval changes
 */
export function useUpdateInterval() {
  const { settings, updateSettings } = useSystemSettings();
  return {
    updateInterval: settings.updateInterval,
    setUpdateInterval: useCallback(
      (interval: number) => {
        updateSettings({ updateInterval: interval });
      },
      [updateSettings]
    ),
  };
}

/**
 * Hook to get max data points
 * Only re-renders when max data points changes
 */
export function useMaxDataPoints() {
  const { settings, updateSettings } = useSystemSettings();
  return {
    maxDataPoints: settings.maxDataPoints,
    setMaxDataPoints: useCallback(
      (max: number) => {
        updateSettings({ maxDataPoints: max });
      },
      [updateSettings]
    ),
  };
}
