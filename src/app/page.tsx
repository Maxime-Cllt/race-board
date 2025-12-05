"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { SpeedChart } from "@/components/dashboard/speed-chart";
import { LaneDistribution } from "@/components/dashboard/lane-distribution";
import { SensorStats } from "@/components/dashboard/sensor-stats";
import { AverageSpeedBySensor } from "@/components/dashboard/average-speed-by-sensor";
import { SpeedDistribution } from "@/components/dashboard/speed-distribution";
import { HourlyTrend } from "@/components/dashboard/hourly-trend";
import { SpeedRecords } from "@/components/dashboard/speed-records";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { LanePerformance } from "@/components/dashboard/lane-performance";
import { SpeedConsistency } from "@/components/dashboard/speed-consistency";
import { TopSensors } from "@/components/dashboard/top-sensors";
import { TimePeriodAnalysis } from "@/components/dashboard/time-period-analysis";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsPanel } from "@/components/settings-panel";
import { Gauge, TrendingUp, Activity, Zap } from "lucide-react";
import { useMemo } from "react";
import { useRealtimeSpeedData } from "@/hooks/use-realtime-speed-data";
import { useSettings } from "@/contexts/settings-context";
import { config } from "@/config/env";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { settings } = useSettings();

  // Use realtime data with settings
  const { data: realtimeData, isConnected, connectionMode } = useRealtimeSpeedData(
    settings.updateInterval,
    settings.maxDataPoints
  );

  // Filter data based on settings
  const filteredData = useMemo(() => {
    return realtimeData.filter((data) => {
      // Filter by sensor
      const sensorMatch =
        settings.selectedSensors.length === 0 ||
        settings.selectedSensors.includes(data.sensor_name || "");

      // Filter by lane
      const laneMatch = settings.selectedLanes.includes(data.lane);

      // Filter by speed thresholds if alerts are enabled
      const speedMatch =
        !settings.enableAlerts ||
        (data.speed >= settings.speedThresholdMin &&
          data.speed <= settings.speedThresholdMax);

      return sensorMatch && laneMatch && speedMatch;
    });
  }, [realtimeData, settings]);

  // Extract unique sensor names from realtime data
  const availableSensors = useMemo(() => {
    const sensorNames = realtimeData
      .map((d) => d.sensor_name)
      .filter((name): name is string => name !== null && name !== undefined);
    return Array.from(new Set(sensorNames)).sort();
  }, [realtimeData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgSpeed: 0,
        maxSpeed: 0,
        minSpeed: 0,
        totalReadings: 0,
      };
    }

    const speeds = filteredData.map((d) => d.speed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);
    const minSpeed = Math.min(...speeds);
    const totalReadings = filteredData.length;

    return {
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      minSpeed: Math.round(minSpeed * 10) / 10,
      totalReadings,
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary" />
                RaceTrack Analytics
              </h1>
              <p className="text-muted-foreground mt-1">Racing Speed Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={config.isSimulation ? "outline" : config.isDevelopment ? "secondary" : "default"}>
                  {config.isSimulation ? "🎮 SIMULATION" : config.isDevelopment ? "🔧 DEV" : "🚀 PROD"}
                </Badge>
                {config.requiresAPI && (
                  <span className="text-xs text-muted-foreground">
                    {config.apiBaseUrl}
                  </span>
                )}
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-muted-foreground">
                  {config.isSimulation
                    ? "Données simulées"
                    : isConnected
                      ? "SSE connecté"
                      : "SSE en connexion..."}
                </span>
              </div>
              <SettingsPanel availableSensors={availableSensors} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Vitesse Moyenne"
            value={`${stats.avgSpeed} km/h`}
            subtitle="Sur les 2 dernières heures"
            icon={Gauge}
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard
            title="Vitesse Maximale"
            value={`${stats.maxSpeed} km/h`}
            subtitle="Record de la session"
            icon={TrendingUp}
          />
          <StatCard
            title="Vitesse Minimale"
            value={`${stats.minSpeed} km/h`}
            subtitle="Plus basse vitesse"
            icon={Activity}
          />
          <StatCard
            title="Total Passages"
            value={stats.totalReadings}
            subtitle="Lectures capteurs"
            icon={Zap}
            trend={{ value: 12.5, isPositive: true }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {settings.showSpeedChart && (
            <div className="lg:col-span-2">
              <SpeedChart
                data={filteredData}
                title="Évolution des vitesses"
                description={
                  connectionMode === 'sse'
                    ? `Vitesses enregistrées (connexion temps réel via SSE ${isConnected ? '✓' : '⚠️'})`
                    : `Vitesses enregistrées (simulation - mise à jour toutes les ${settings.updateInterval / 1000}s)`
                }
              />
            </div>
          )}
          {settings.showLaneDistribution && (
            <LaneDistribution data={filteredData} />
          )}
          {settings.showSensorStats && <SensorStats data={filteredData} />}
        </div>

        {/* Advanced Analytics Section */}
        {(settings.showHourlyTrend ||
          settings.showSpeedRecords ||
          settings.showSpeedDistribution ||
          settings.showAverageSpeedBySensor ||
          settings.showActivityHeatmap ||
          settings.showLanePerformance ||
          settings.showSpeedConsistency ||
          settings.showTopSensors ||
          settings.showTimePeriodAnalysis) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Analyses Avancées
            </h2>

            {/* Row 1: Hourly Trend */}
            {settings.showHourlyTrend && (
              <div className="grid gap-6 mb-6">
                <HourlyTrend data={filteredData} />
              </div>
            )}

            {/* Row 2: Speed Records Table (Full Width) */}
            {settings.showSpeedRecords && (
              <div className="grid gap-6 mb-6">
                <SpeedRecords data={filteredData} />
              </div>
            )}

            {/* Row 3: Distribution and Average by Sensor */}
            {(settings.showSpeedDistribution || settings.showAverageSpeedBySensor) && (
              <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {settings.showSpeedDistribution && <SpeedDistribution data={filteredData} />}
                {settings.showAverageSpeedBySensor && <AverageSpeedBySensor data={filteredData} />}
              </div>
            )}

            {/* Row 4: Activity Heatmap */}
            {settings.showActivityHeatmap && (
              <div className="grid gap-6 mb-6">
                <ActivityHeatmap data={filteredData} />
              </div>
            )}

            {/* Row 5: Lane Performance and Speed Consistency */}
            {(settings.showLanePerformance || settings.showSpeedConsistency) && (
              <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {settings.showLanePerformance && <LanePerformance data={filteredData} />}
                {settings.showSpeedConsistency && <SpeedConsistency data={filteredData} />}
              </div>
            )}

            {/* Row 6: Top Sensors and Time Period Analysis */}
            {(settings.showTopSensors || settings.showTimePeriodAnalysis) && (
              <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {settings.showTopSensors && <TopSensors data={filteredData} />}
                {settings.showTimePeriodAnalysis && <TimePeriodAnalysis data={filteredData} />}
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-card border border-border rounded-lg">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">À propos de Race Board</h3>
              <p className="text-muted-foreground text-sm">
                Système de Business Intelligence pour l&apos;analyse des données de vitesse collectées par capteurs sur circuit.
                {config.isSimulation ? (
                  <span> Mode SIMULATION : Les données affichées sont générées aléatoirement pour la démonstration de l&apos;interface.</span>
                ) : config.isDevelopment ? (
                  <span> Mode DEV : Connecté à l&apos;API de développement à {config.apiBaseUrl}.</span>
                ) : (
                  <span> Mode PROD : Connecté à l&apos;API de production pour des données en temps réel.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
