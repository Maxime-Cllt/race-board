"use client";

import dynamic from "next/dynamic";

// Loading fallback component for charts
const ChartLoadingFallback = ({ height = "300px" }: { height?: string }) => (
  <div className="flex items-center justify-center" style={{ height }}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy-loaded chart components with loading states
// Each component is loaded on-demand only when needed

export const LazySpeedChart = dynamic(
  () => import("./speed-chart").then((mod) => ({ default: mod.SpeedChart })),
  { loading: () => <ChartLoadingFallback height="300px" />, ssr: false }
);

export const LazySensorStats = dynamic(
  () => import("./sensor-stats").then((mod) => ({ default: mod.SensorStats })),
  { loading: () => <ChartLoadingFallback height="300px" />, ssr: false }
);

export const LazyActivityHeatmap = dynamic(
  () => import("./activity-heatmap").then((mod) => ({ default: mod.ActivityHeatmap })),
  { loading: () => <ChartLoadingFallback height="400px" />, ssr: false }
);

export const LazyHourlyTrend = dynamic(
  () => import("./hourly-trend").then((mod) => ({ default: mod.HourlyTrend })),
  { loading: () => <ChartLoadingFallback height="350px" />, ssr: false }
);

export const LazySpeedRecords = dynamic(
  () => import("./speed-records").then((mod) => ({ default: mod.SpeedRecords })),
  { loading: () => <ChartLoadingFallback height="400px" />, ssr: false }
);

export const LazySpeedDistribution = dynamic(
  () => import("./speed-distribution").then((mod) => ({ default: mod.SpeedDistribution })),
  { loading: () => <ChartLoadingFallback height="300px" />, ssr: false }
);

export const LazyAverageSpeedBySensor = dynamic(
  () => import("./average-speed-by-sensor").then((mod) => ({ default: mod.AverageSpeedBySensor })),
  { loading: () => <ChartLoadingFallback height="300px" />, ssr: false }
);

export const LazyLanePerformance = dynamic(
  () => import("./lane-performance").then((mod) => ({ default: mod.LanePerformance })),
  { loading: () => <ChartLoadingFallback height="350px" />, ssr: false }
);

export const LazySpeedConsistency = dynamic(
  () => import("./speed-consistency").then((mod) => ({ default: mod.SpeedConsistency })),
  { loading: () => <ChartLoadingFallback height="350px" />, ssr: false }
);

export const LazyTopSensors = dynamic(
  () => import("./top-sensors").then((mod) => ({ default: mod.TopSensors })),
  { loading: () => <ChartLoadingFallback height="300px" />, ssr: false }
);

export const LazyTimePeriodAnalysis = dynamic(
  () => import("./time-period-analysis").then((mod) => ({ default: mod.TimePeriodAnalysis })),
  { loading: () => <ChartLoadingFallback height="350px" />, ssr: false }
);

export const LazyLaneDistribution = dynamic(
  () => import("./lane-distribution").then((mod) => ({ default: mod.LaneDistribution })),
  { loading: () => <ChartLoadingFallback height="300px" />, ssr: false }
);
