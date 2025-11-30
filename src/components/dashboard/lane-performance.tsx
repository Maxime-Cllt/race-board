"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData, Lane } from "@/types/speed-data";
import { ArrowLeftRight } from "lucide-react";

interface LanePerformanceProps {
  data: SpeedData[];
}

export function LanePerformance({ data }: LanePerformanceProps) {
  // Separate data by lane
  const leftLaneData = data.filter((d) => d.lane === Lane.Left);
  const rightLaneData = data.filter((d) => d.lane === Lane.Right);

  // Calculate statistics for each lane
  const calculateStats = (laneData: SpeedData[]) => {
    if (laneData.length === 0) return { avg: 0, max: 0, min: 0, count: 0 };
    const speeds = laneData.map((d) => d.speed);
    return {
      avg: Math.round((speeds.reduce((a, b) => a + b, 0) / speeds.length) * 10) / 10,
      max: Math.max(...speeds),
      min: Math.min(...speeds),
      count: laneData.length,
    };
  };

  const leftStats = calculateStats(leftLaneData);
  const rightStats = calculateStats(rightLaneData);

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#333",
      textStyle: {
        color: "#fff",
      },
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Corridor Gauche", "Corridor Droit"],
      textStyle: {
        color: "#999",
      },
      top: "0%",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["Vitesse Moyenne", "Vitesse Max", "Vitesse Min", "Nombre de Passages"],
      axisLabel: {
        color: "#999",
        interval: 0,
        rotate: 15,
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#999",
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#333",
          opacity: 0.3,
        },
      },
    },
    series: [
      {
        name: "Corridor Gauche",
        type: "bar",
        data: [leftStats.avg, leftStats.max, leftStats.min, leftStats.count],
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#3b82f6",
              },
              {
                offset: 1,
                color: "#1d4ed8",
              },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#2563eb",
          },
        },
        barWidth: "40%",
      },
      {
        name: "Corridor Droit",
        type: "bar",
        data: [rightStats.avg, rightStats.max, rightStats.min, rightStats.count],
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#ec4899",
              },
              {
                offset: 1,
                color: "#be185d",
              },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#db2777",
          },
        },
        barWidth: "40%",
      },
    ],
  };

  // Don't render chart if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Comparaison des corridors
          </CardTitle>
          <CardDescription>Performance comparative entre corridors gauche et droit</CardDescription>
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
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          Comparaison des corridors
        </CardTitle>
        <CardDescription>Performance comparative entre corridors gauche et droit</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: "350px" }} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Corridor Gauche</div>
            <div className="text-2xl font-bold text-blue-500">{leftStats.count}</div>
            <div className="text-xs text-muted-foreground">passages enregistrés</div>
          </div>
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Corridor Droit</div>
            <div className="text-2xl font-bold text-pink-500">{rightStats.count}</div>
            <div className="text-xs text-muted-foreground">passages enregistrés</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
