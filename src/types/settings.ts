import { Lane } from "./speed-data";

export type DateRangeMode = "realtime" | "today" | "custom";

export interface AppSettings {
  // Filtres de données
  selectedSensors: string[];
  selectedLanes: Lane[];

  // Filtre de plage de dates
  dateRangeMode: DateRangeMode;
  customStartDate: string | null; // ISO string
  customEndDate: string | null; // ISO string

  // Intervalle de mise à jour
  updateInterval: number; // en ms
  maxDataPoints: number;

  // Configuration API
  apiUrl: string;

  // Affichage - Graphiques de base
  showLaneDistribution: boolean;
  showSensorStats: boolean;
  showSpeedChart: boolean;

  // Affichage - Analyses avancées
  showHourlyTrend: boolean;
  showSpeedRecords: boolean;
  showSpeedDistribution: boolean;
  showAverageSpeedBySensor: boolean;
  showActivityHeatmap: boolean;
  showLanePerformance: boolean;
  showSpeedConsistency: boolean;
  showTopSensors: boolean;
  showTimePeriodAnalysis: boolean;

  // Seuils d'alerte
  speedThresholdMin: number;
  speedThresholdMax: number;
  enableAlerts: boolean;
}

export const defaultSettings: AppSettings = {
  selectedSensors: [],
  selectedLanes: [Lane.Left, Lane.Right],
  dateRangeMode: "realtime",
  customStartDate: null,
  customEndDate: null,
  updateInterval: 3000,
  maxDataPoints: 120,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.100:8080",
  showLaneDistribution: true,
  showSensorStats: true,
  showSpeedChart: true,
  showHourlyTrend: true,
  showSpeedRecords: true,
  showSpeedDistribution: true,
  showAverageSpeedBySensor: true,
  showActivityHeatmap: true,
  showLanePerformance: true,
  showSpeedConsistency: true,
  showTopSensors: true,
  showTimePeriodAnalysis: true,
  speedThresholdMin: 80,
  speedThresholdMax: 350,
  enableAlerts: false,
};
