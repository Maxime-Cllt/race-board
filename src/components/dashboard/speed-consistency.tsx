"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData } from "@/types/speed-data";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SpeedConsistencyProps {
  data: SpeedData[];
}

export function SpeedConsistency({ data }: SpeedConsistencyProps) {
  // Calculate statistics
  const calculateConsistency = () => {
    if (data.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        variance: 0,
        coefficientOfVariation: 0,
        speedRanges: {},
      };
    }

    const speeds = data.map((d) => d.speed).sort((a, b) => a - b);
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const median = speeds[Math.floor(speeds.length / 2)];

    // Calculate standard deviation
    const squaredDiffs = speeds.map((speed) => Math.pow(speed - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / speeds.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (CV) - measures relative variability
    const coefficientOfVariation = (stdDev / mean) * 100;

    // Group speeds into ranges for distribution
    const ranges = ["0-50", "50-100", "100-150", "150-200", "200+"];
    const speedRanges = ranges.reduce((acc, range) => {
      acc[range] = 0;
      return acc;
    }, {} as Record<string, number>);

    speeds.forEach((speed) => {
      if (speed < 50) speedRanges["0-50"]++;
      else if (speed < 100) speedRanges["50-100"]++;
      else if (speed < 150) speedRanges["100-150"]++;
      else if (speed < 200) speedRanges["150-200"]++;
      else speedRanges["200+"]++;
    });

    return {
      mean: Math.round(mean * 10) / 10,
      median: Math.round(median * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      variance: Math.round(variance * 10) / 10,
      coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10,
      speedRanges,
    };
  };

  const stats = calculateConsistency();

  // Determine consistency level based on coefficient of variation
  const getConsistencyLevel = (cv: number) => {
    if (cv < 10) return { label: "Très Consistant", color: "bg-green-500" };
    if (cv < 20) return { label: "Consistant", color: "bg-blue-500" };
    if (cv < 30) return { label: "Modéré", color: "bg-yellow-500" };
    return { label: "Variable", color: "bg-red-500" };
  };

  const consistencyLevel = getConsistencyLevel(stats.coefficientOfVariation);

  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#333",
      textStyle: {
        color: "#fff",
      },
      formatter: (params: any) => {
        return `${params.name}: ${params.value} passages (${params.percent}%)`;
      },
    },
    legend: {
      orient: "vertical",
      right: "5%",
      top: "center",
      textStyle: {
        color: "#999",
      },
    },
    series: [
      {
        name: "Distribution des vitesses",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#1a1a1a",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
          },
        },
        labelLine: {
          show: false,
        },
        data: Object.entries(stats.speedRanges).map(([range, count]) => ({
          value: count,
          name: `${range} km/h`,
        })),
        color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
      },
    ],
  };

  // Don't render chart if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Consistance des vitesses
          </CardTitle>
          <CardDescription>Analyse de la variabilité et distribution des vitesses</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Consistance des vitesses
        </CardTitle>
        <CardDescription>Analyse de la variabilité et distribution des vitesses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Niveau de consistance:</span>
            <Badge className={`${consistencyLevel.color} text-white`}>
              {consistencyLevel.label}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            CV: {stats.coefficientOfVariation}%
          </div>
        </div>

        <ReactECharts option={option} style={{ height: "300px" }} />

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Moyenne</div>
            <div className="text-lg font-bold">{stats.mean} km/h</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Médiane</div>
            <div className="text-lg font-bold">{stats.median} km/h</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Écart-type</div>
            <div className="text-lg font-bold">{stats.stdDev}</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Variance</div>
            <div className="text-lg font-bold">{stats.variance}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
