"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData, Lane } from "@/types/speed-data";
import { format } from "date-fns";

interface SpeedChartProps {
  data: SpeedData[];
  title?: string;
  description?: string;
}

export function SpeedChart({ data, title = "Vitesses en temps réel", description }: SpeedChartProps) {
  // Separate data by lane
  const leftLaneData = data.filter((d) => d.lane === Lane.Left);
  const rightLaneData = data.filter((d) => d.lane === Lane.Right);

  // Get all unique timestamps and sort them
  const allTimestamps = Array.from(new Set(data.map((d) => d.created_at))).sort();

  // Create maps for quick lookup
  const leftLaneMap = new Map(leftLaneData.map((d) => [d.created_at, d.speed]));
  const rightLaneMap = new Map(rightLaneData.map((d) => [d.created_at, d.speed]));

  // Build data arrays with null for missing values
  const leftSpeeds = allTimestamps.map((ts) => leftLaneMap.get(ts) ?? null);
  const rightSpeeds = allTimestamps.map((ts) => rightLaneMap.get(ts) ?? null);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#333",
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      data: ["Voie gauche", "Voie droite"],
      textStyle: {
        color: "#999",
      },
      top: "0%",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: allTimestamps.map((ts) => format(new Date(ts), "HH:mm")),
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Vitesse (km/h)",
      nameTextStyle: {
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
        name: "Voie gauche",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        sampling: "lttb",
        connectNulls: false,
        itemStyle: {
          color: "#dc2626",
        },
        lineStyle: {
          width: 2,
        },
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
                color: "rgba(220, 38, 38, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(220, 38, 38, 0.05)",
              },
            ],
          },
        },
        data: leftSpeeds,
      },
      {
        name: "Voie droite",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        sampling: "lttb",
        connectNulls: false,
        itemStyle: {
          color: "#ea580c",
        },
        lineStyle: {
          width: 2,
        },
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
                color: "rgba(234, 88, 12, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(234, 88, 12, 0.05)",
              },
            ],
          },
        },
        data: rightSpeeds,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: "300px" }} />
      </CardContent>
    </Card>
  );
}
