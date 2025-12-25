"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData } from "@/types/speed-data";

interface SpeedDistributionProps {
  data: SpeedData[];
}

export const SpeedDistribution = React.memo(function SpeedDistribution({ data }: SpeedDistributionProps) {
  const binSize = 25; // 25 km/h per bin

  // Memoize heavy computations - only recalculate when data changes
  const processedData = useMemo(() => {
    const minSpeed = 0;
    const maxSpeed = 400;
    const bins: Record<string, number> = {};

    // Initialize bins
    for (let i = minSpeed; i < maxSpeed; i += binSize) {
      const rangeLabel = `${i}-${i + binSize}`;
      bins[rangeLabel] = 0;
    }

    // Fill bins
    data.forEach((d) => {
      const binIndex = Math.floor(d.speed / binSize) * binSize;
      const rangeLabel = `${binIndex}-${binIndex + binSize}`;
      if (bins[rangeLabel] !== undefined) {
        bins[rangeLabel] += 1;
      }
    });

    const labels = Object.keys(bins);
    const values = Object.values(bins);

    return { labels, values };
  }, [data, binSize]);

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
        return `${param.axisValue} km/h<br/>Nombre de passages: ${param.value}`;
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
      data: processedData.labels,
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
      name: "Nombre",
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
        name: "Distribution",
        type: "bar",
        data: processedData.values,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "#10b981",
              },
              {
                offset: 1,
                color: "#14b8a6",
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
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: "#34d399",
                },
                {
                  offset: 1,
                  color: "#2dd4bf",
                },
              ],
            },
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
          <CardTitle>Distribution des vitesses</CardTitle>
          <CardDescription>Répartition des vitesses par plages de {binSize} km/h</CardDescription>
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
        <CardTitle>Distribution des vitesses</CardTitle>
        <CardDescription>Répartition des vitesses par plages de {binSize} km/h</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: "300px" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </CardContent>
    </Card>
  );
});
