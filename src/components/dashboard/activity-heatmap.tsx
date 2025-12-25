"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData } from "@/types/speed-data";
import { format } from "date-fns";

interface ActivityHeatmapProps {
  data: SpeedData[];
}

export const ActivityHeatmap = React.memo(function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Memoize heavy computations - only recalculate when data changes
  const processedData = useMemo(() => {
    // Get unique sensors and hours
    const sensors = Array.from(new Set(data.map((d) => d.sensor_name || "Unknown")));
    const hours = Array.from(new Set(data.map((d) => format(new Date(d.created_at), "HH:00")))).sort();

    // Create activity matrix
    const activityMap: Record<string, Record<string, number>> = {};

    sensors.forEach((sensor) => {
      activityMap[sensor] = {};
      hours.forEach((hour) => {
        activityMap[sensor][hour] = 0;
      });
    });

    // Fill activity data
    data.forEach((d) => {
      const sensor = d.sensor_name || "Unknown";
      const hour = format(new Date(d.created_at), "HH:00");
      if (activityMap[sensor] && activityMap[sensor][hour] !== undefined) {
        activityMap[sensor][hour] += 1;
      }
    });

    // Convert to ECharts format [hourIndex, sensorIndex, value]
    const heatmapData: [number, number, number][] = [];
    hours.forEach((hour, hourIdx) => {
      sensors.forEach((sensor, sensorIdx) => {
        const value = activityMap[sensor][hour] || 0;
        heatmapData.push([hourIdx, sensorIdx, value]);
      });
    });

    // Find max value for color scale
    const maxValue = Math.max(...heatmapData.map((d) => d[2]));

    return { sensors, hours, heatmapData, maxValue };
  }, [data]);

  // Memoize ECharts option object
  const option = useMemo(() => ({
    tooltip: {
      position: "top",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#333",
      textStyle: {
        color: "#fff",
      },
      formatter: (params: { data: [number, number, number] }) => {
        const hour = processedData.hours[params.data[0]];
        const sensor = processedData.sensors[params.data[1]];
        const value = params.data[2];
        return `${sensor}<br/>${hour}<br/>Passages: ${value}`;
      },
    },
    grid: {
      left: "15%",
      right: "4%",
      bottom: "15%",
      top: "3%",
      containLabel: false,
    },
    xAxis: {
      type: "category",
      data: processedData.hours,
      splitArea: {
        show: true,
      },
      axisLabel: {
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
      type: "category",
      data: processedData.sensors,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: "#999",
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
    },
    visualMap: {
      min: 0,
      max: processedData.maxValue,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "0%",
      textStyle: {
        color: "#999",
      },
      inRange: {
        color: ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"],
      },
    },
    series: [
      {
        name: "Activité",
        type: "heatmap",
        data: processedData.heatmapData,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  }), [processedData]);

  // Don't render chart if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heatmap d&apos;activité</CardTitle>
          <CardDescription>Densité de passages par capteur et par heure</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap d&apos;activité</CardTitle>
        <CardDescription>Densité de passages par capteur et par heure</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: "400px" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </CardContent>
    </Card>
  );
});
