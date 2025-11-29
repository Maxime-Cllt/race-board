"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpeedData, Lane } from "@/types/speed-data";
import { format } from "date-fns";
import { Trophy, TrendingUp } from "lucide-react";

interface SpeedRecordsProps {
  data: SpeedData[];
}

export function SpeedRecords({ data }: SpeedRecordsProps) {
  // Get top 10 speeds
  const topSpeeds = [...data]
    .sort((a, b) => b.speed - a.speed)
    .slice(0, 10);

  // Don't render if no data available
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Records de vitesse
          </CardTitle>
          <CardDescription>Top 10 des vitesses les plus élevées</CardDescription>
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
          <Trophy className="h-5 w-5 text-yellow-500" />
          Records de vitesse
        </CardTitle>
        <CardDescription>Top 10 des vitesses les plus élevées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSpeeds.map((record, index) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                      ? "bg-gray-400 text-white"
                      : index === 2
                      ? "bg-amber-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {record.speed} km/h
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{record.sensor_name || "Unknown"}</span>
                    <span>•</span>
                    <span>{format(new Date(record.created_at), "HH:mm:ss")}</span>
                  </div>
                </div>
              </div>
              <Badge variant={record.lane === Lane.Left ? "default" : "secondary"}>
                {record.lane === Lane.Left ? "Gauche" : "Droite"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
