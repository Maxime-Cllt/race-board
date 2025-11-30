"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpeedData } from "@/types/speed-data";
import { Radio, TrendingUp, Zap } from "lucide-react";

interface TopSensorsProps {
  data: SpeedData[];
}

export function TopSensors({ data }: TopSensorsProps) {
  // Group data by sensor
  const sensorData = data.reduce((acc, curr) => {
    const sensorName = curr.sensor_name || "Unknown";
    if (!acc[sensorName]) {
      acc[sensorName] = {
        name: sensorName,
        speeds: [],
        count: 0,
      };
    }
    acc[sensorName].speeds.push(curr.speed);
    acc[sensorName].count += 1;
    return acc;
  }, {} as Record<string, { name: string; speeds: number[]; count: number }>);

  // Calculate statistics for each sensor
  const sensorStats = Object.values(sensorData).map((sensor) => {
    const avgSpeed = sensor.speeds.reduce((a, b) => a + b, 0) / sensor.speeds.length;
    const maxSpeed = Math.max(...sensor.speeds);
    const minSpeed = Math.min(...sensor.speeds);

    return {
      name: sensor.name,
      count: sensor.count,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      minSpeed: Math.round(minSpeed * 10) / 10,
    };
  });

  // Sort by count (most active sensors first)
  const topSensors = sensorStats.sort((a, b) => b.count - a.count).slice(0, 5);

  // Don't render if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Top capteurs actifs
          </CardTitle>
          <CardDescription>Les 5 capteurs les plus actifs avec leurs statistiques</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Top capteurs actifs
        </CardTitle>
        <CardDescription>Les 5 capteurs les plus actifs avec leurs statistiques</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSensors.map((sensor, index) => (
            <div
              key={sensor.name}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      index === 0
                        ? "bg-yellow-500 text-white"
                        : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      {sensor.name}
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sensor.count} passages enregistrés
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Actif
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Moyenne</div>
                  <div className="text-sm font-bold text-blue-500">{sensor.avgSpeed} km/h</div>
                </div>
                <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Max
                  </div>
                  <div className="text-sm font-bold text-green-500">{sensor.maxSpeed} km/h</div>
                </div>
                <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Min</div>
                  <div className="text-sm font-bold text-orange-500">{sensor.minSpeed} km/h</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
