"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData } from "@/types/speed-data";

interface AverageSpeedBySensorProps {
  data: SpeedData[];
}

export const AverageSpeedBySensor = React.memo(function AverageSpeedBySensor({ data }: AverageSpeedBySensorProps) {
  // Memoize heavy computations - only recalculate when data changes
  const processedData = useMemo(() => {
    // Calculate average speed per sensor
    const sensorStats = data.reduce((acc, curr) => {
      const sensor = curr.sensor_name || "Unknown";
      if (!acc[sensor]) {
        acc[sensor] = { total: 0, count: 0 };
      }
      acc[sensor].total += curr.speed;
      acc[sensor].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const sensorNames = Object.keys(sensorStats);
    const averageSpeeds = sensorNames.map(
      (sensor) => Math.round((sensorStats[sensor].total / sensorStats[sensor].count) * 10) / 10
    );

    return { sensorNames, averageSpeeds };
  }, [data]);

  // Memoize ECharts option object
  const option = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#333",
      textStyle: {
        color: "#fff",
      },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.axisValue}<br/>Vitesse moyenne: ${param.value} km/h`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: processedData.sensorNames,
      axisLabel: {
        rotate: 45,
        color: "#999",
        fontSize: 11,
      },
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
        name: "Vitesse moyenne",
        type: "bar",
        data: processedData.averageSpeeds,
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
                color: "#8b5cf6",
              },
              {
                offset: 1,
                color: "#6366f1",
              },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
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
                  color: "#a78bfa",
                },
                {
                  offset: 1,
                  color: "#818cf8",
                },
              ],
            },
          },
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c} km/h",
          color: "#999",
          fontSize: 10,
        },
      },
    ],
  }), [processedData]);

  // Don't render chart if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitesse moyenne par capteur</CardTitle>
          <CardDescription>Comparaison des performances sur chaque secteur</CardDescription>
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
        <CardTitle>Vitesse moyenne par capteur</CardTitle>
        <CardDescription>Comparaison des performances sur chaque secteur</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: "350px" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </CardContent>
    </Card>
  );
});
