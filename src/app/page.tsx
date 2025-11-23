"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { SpeedChart } from "@/components/dashboard/speed-chart";
import { LaneDistribution } from "@/components/dashboard/lane-distribution";
import { SensorStats } from "@/components/dashboard/sensor-stats";
import { ThemeToggle } from "@/components/theme-toggle";
import { Gauge, TrendingUp, Activity, Zap } from "lucide-react";
import { useMemo } from "react";
import { useRealtimeSpeedData } from "@/hooks/use-realtime-speed-data";

export default function Home() {
  // Use realtime data that updates every 3 seconds
  const realtimeData = useRealtimeSpeedData(3000, 120);

  const stats = useMemo(() => {
    const speeds = realtimeData.map((d) => d.speed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);
    const minSpeed = Math.min(...speeds);
    const totalReadings = realtimeData.length;

    return {
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      minSpeed: Math.round(minSpeed * 10) / 10,
      totalReadings,
    };
  }, [realtimeData]);

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
                <div className="h-2 w-2 rounded-full bg-chart-4 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Données en temps réel</span>
              </div>
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
          <div className="lg:col-span-2">
            <SpeedChart
              data={realtimeData}
              title="Évolution des vitesses"
              description="Vitesses enregistrées sur les 2 dernières heures (mise à jour toutes les 3s)"
            />
          </div>
          <LaneDistribution data={realtimeData} />
          <SensorStats data={realtimeData} />
        </div>

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
                Les données affichées sont des données de test générées aléatoirement pour la démonstration de l&apos;interface.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
