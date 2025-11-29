"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";
import { SpeedData, Lane } from "@/types/speed-data";

interface LaneDistributionProps {
  data: SpeedData[];
}

export function LaneDistribution({ data }: LaneDistributionProps) {
  const leftCount = data.filter((d) => d.lane === Lane.Left).length;
  const rightCount = data.filter((d) => d.lane === Lane.Right).length;

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#333",
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "#666",
      },
    },
    series: [
      {
        name: "Voies",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          color: "#333",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        data: [
          { value: leftCount, name: "Voie gauche", itemStyle: { color: "#3b82f6" } },
          { value: rightCount, name: "Voie droite", itemStyle: { color: "#f97316" } },
        ],
      },
    ],
  };

  // Don't render chart if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition par voie</CardTitle>
          <CardDescription>Distribution des passages par voie</CardDescription>
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
        <CardTitle>Répartition par voie</CardTitle>
        <CardDescription>Distribution des passages par voie</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: "300px" }} />
      </CardContent>
    </Card>
  );
}
