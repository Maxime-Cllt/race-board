import { Lane } from "./speed-data";

export interface AppSettings {
  // Filtres de données
  selectedSensors: string[];
  selectedLanes: Lane[];

  // Intervalle de mise à jour
  updateInterval: number; // en ms
  maxDataPoints: number;

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
  updateInterval: 3000,
  maxDataPoints: 120,
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
