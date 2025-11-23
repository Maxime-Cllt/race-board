"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData } from "@/types/speed-data";

interface SensorStatsProps {
  data: SpeedData[];
}

export function SensorStats({ data }: SensorStatsProps) {
  // Group data by sensor and calculate average speed
  const sensorData = data.reduce((acc, curr) => {
    const sensorName = curr.sensor_name || "Unknown";
    if (!acc[sensorName]) {
      acc[sensorName] = { speeds: [], count: 0 };
    }
    acc[sensorName].speeds.push(curr.speed);
    acc[sensorName].count++;
    return acc;
  }, {} as Record<string, { speeds: number[]; count: number }>);

  const sensors = Object.keys(sensorData);
  const avgSpeeds = sensors.map((sensor) => {
    const speeds = sensorData[sensor].speeds;
    return Math.round((speeds.reduce((a, b) => a + b, 0) / speeds.length) * 10) / 10;
  });
  const counts = sensors.map((sensor) => sensorData[sensor].count);

  const option = {
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
        const sensor = params[0].name;
        const avgSpeed = params[0].value;
        const count = sensorData[sensor].count;
        return `${sensor}<br/>Vitesse moyenne: ${avgSpeed} km/h<br/>Passages: ${count}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: sensors,
      axisLabel: {
        rotate: 45,
        color: "#666",
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Vitesse moy. (km/h)",
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
        data: avgSpeeds,
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
                color: "#dc2626",
              },
              {
                offset: 1,
                color: "#ea580c",
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
                  color: "#b91c1c",
                },
                {
                  offset: 1,
                  color: "#c2410c",
                },
              ],
            },
          },
        },
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques par capteur</CardTitle>
        <CardDescription>Vitesse moyenne par point de mesure</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: "300px" }} />
      </CardContent>
    </Card>
  );
}
