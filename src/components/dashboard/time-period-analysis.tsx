"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData } from "@/types/speed-data";
import { Clock } from "lucide-react";

interface TimePeriodAnalysisProps {
  data: SpeedData[];
}

export function TimePeriodAnalysis({ data }: TimePeriodAnalysisProps) {
  // Define time periods
  const getTimePeriod = (hour: number): string => {
    if (hour >= 6 && hour < 12) return "Matin (6h-12h)";
    if (hour >= 12 && hour < 18) return "Après-midi (12h-18h)";
    if (hour >= 18 && hour < 22) return "Soirée (18h-22h)";
    return "Nuit (22h-6h)";
  };

  // Group data by time period
  const periodData = data.reduce((acc, curr) => {
    const hour = new Date(curr.created_at).getHours();
    const period = getTimePeriod(hour);

    if (!acc[period]) {
      acc[period] = {
        speeds: [],
        count: 0,
      };
    }
    acc[period].speeds.push(curr.speed);
    acc[period].count += 1;
    return acc;
  }, {} as Record<string, { speeds: number[]; count: number }>);

  // Calculate statistics for each period
  const periods = ["Matin (6h-12h)", "Après-midi (12h-18h)", "Soirée (18h-22h)", "Nuit (22h-6h)"];

  const periodStats = periods.map((period) => {
    const data = periodData[period];
    if (!data || data.speeds.length === 0) {
      return {
        period,
        avgSpeed: 0,
        maxSpeed: 0,
        count: 0,
      };
    }

    const avgSpeed = data.speeds.reduce((a, b) => a + b, 0) / data.speeds.length;
    const maxSpeed = Math.max(...data.speeds);

    return {
      period,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      count: data.count,
    };
  });

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
      data: ["Vitesse moyenne", "Vitesse max", "Nombre de passages"],
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
      data: periods,
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
    yAxis: [
      {
        type: "value",
        name: "Vitesse (km/h)",
        position: "left",
        nameTextStyle: {
          color: "#999",
        },
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
      {
        type: "value",
        name: "Passages",
        position: "right",
        nameTextStyle: {
          color: "#999",
        },
        axisLabel: {
          color: "#999",
        },
        axisLine: {
          lineStyle: {
            color: "#999",
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: "Vitesse moyenne",
        type: "bar",
        yAxisIndex: 0,
        data: periodStats.map((s) => s.avgSpeed),
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
      },
      {
        name: "Vitesse max",
        type: "bar",
        yAxisIndex: 0,
        data: periodStats.map((s) => s.maxSpeed),
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
                color: "#10b981",
              },
              {
                offset: 1,
                color: "#059669",
              },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#10b981",
          },
        },
      },
      {
        name: "Nombre de passages",
        type: "line",
        yAxisIndex: 1,
        data: periodStats.map((s) => s.count),
        smooth: true,
        itemStyle: {
          color: "#ec4899",
        },
        lineStyle: {
          width: 3,
        },
        symbol: "circle",
        symbolSize: 8,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(236, 72, 153, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(236, 72, 153, 0.05)",
              },
            ],
          },
        },
      },
    ],
  };

  // Don't render chart if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Analyse par période
          </CardTitle>
          <CardDescription>Vitesses et activité selon les périodes de la journée</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  // Find the most active period
  const mostActivePeriod = periodStats.reduce((max, current) =>
    current.count > max.count ? current : max
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Analyse par période
        </CardTitle>
        <CardDescription>Vitesses et activité selon les périodes de la journée</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: "350px" }} />
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Période la plus active</div>
              <div className="text-lg font-bold text-primary">{mostActivePeriod.period}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Passages</div>
              <div className="text-lg font-bold">{mostActivePeriod.count}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
