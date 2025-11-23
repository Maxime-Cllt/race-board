import { useState, useEffect } from "react";
import { SpeedData, Lane } from "@/types/speed-data";
import { mockSpeedData } from "@/lib/mock-data";

const sensors = [
  "Sector 1 Entry",
  "Sector 1 Exit",
  "Sector 2 Entry",
  "Sector 2 Exit",
  "Sector 3 Entry",
  "Sector 3 Exit",
  "Finish Line",
  "Pit Entry",
];

function generateRealtimeData(id: number): SpeedData {
  const baseSpeed = 150 + Math.random() * 150;
  const variation = (Math.random() - 0.5) * 40;
  const speed = Math.max(80, Math.min(350, baseSpeed + variation));

  return {
    id,
    sensor_name: sensors[Math.floor(Math.random() * sensors.length)],
    speed: Math.round(speed * 10) / 10,
    lane: Math.random() > 0.5 ? Lane.Left : Lane.Right,
    created_at: new Date().toISOString(),
  };
}

export function useRealtimeSpeedData(intervalMs: number = 3000, maxDataPoints: number = 120) {
  const [data, setData] = useState<SpeedData[]>(mockSpeedData);
  const [lastId, setLastId] = useState(mockSpeedData.length);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint = generateRealtimeData(lastId + 1);

      setData((prevData) => {
        const newData = [...prevData, newDataPoint];
        // Keep only the last maxDataPoints
        if (newData.length > maxDataPoints) {
          return newData.slice(-maxDataPoints);
        }
        return newData;
      });

      setLastId((prevId) => prevId + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [lastId, intervalMs, maxDataPoints]);

  return data;
}
