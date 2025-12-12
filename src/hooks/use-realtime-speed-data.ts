import { useState, useEffect } from "react";
import { SpeedData, Lane } from "@/types/speed-data";
import { mockSpeedData } from "@/lib/mock-data";
import { speedAPI } from "@/services/speed-api";
import { config } from "@/config/env";
import { DateRangeMode } from "@/types/settings";
import { logger } from "@/lib/logger";

/**
 * Mock sensor names for SIMULATION mode only.
 * In DEV/PROD modes, real sensor names come from the API.
 */
const MOCK_SENSORS = [
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
    sensor_name: MOCK_SENSORS[Math.floor(Math.random() * MOCK_SENSORS.length)],
    speed: Math.round(speed * 10) / 10,
    lane: Math.random() > 0.5 ? Lane.Left : Lane.Right,
    created_at: new Date().toISOString(),
  };
}

/**
 * Hook to fetch real-time speed data
 * - In SIMULATION mode: Generates mock data at regular intervals (no API needed)
 * - In DEV mode: Connects to development API via SSE for real-time updates
 * - In PROD mode: Connects to production API via SSE for real-time updates
 */
export function useRealtimeSpeedData(
  intervalMs: number = 3000,
  maxDataPoints: number = 120,
  dateRangeMode: DateRangeMode = "realtime",
  customStartDate: string | null = null,
  customEndDate: string | null = null
) {
  const [data, setData] = useState<SpeedData[]>([]);
  const [lastId, setLastId] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulation mode: Use mock data with simulated real-time updates
    if (config.isSimulation) {
      logger.log("🎮 SIMULATION MODE: Using mock data (no API connection)");
      logger.log(`   Generating data every ${intervalMs / 1000}s`);

      // Initialize with mock data
      setData(mockSpeedData);
      setLastId(mockSpeedData.length);
      setIsConnected(true); // Considered "connected" in simulation

      // Simulate real-time updates
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
    }

    // Development or Production mode: Connect to real API
    if (config.requiresAPI) {
      const mode = config.isDevelopment ? "DEV" : "PROD";
      const emoji = config.isDevelopment ? "🔧" : "🚀";

      logger.log(`${emoji} ${mode} MODE: Connecting to API at ${config.apiBaseUrl}`);

      // Fetch initial data from API based on date range mode
      const fetchInitialData = async () => {
        try {
          let initialData: SpeedData[] = [];

          if (dateRangeMode === "custom" && customStartDate && customEndDate) {
            logger.log(`   📅 Fetching custom date range: ${customStartDate} to ${customEndDate}`);
            initialData = await speedAPI.getSpeedsByRange(customStartDate, customEndDate);
            logger.log(`   ✅ Loaded ${initialData.length} speed records from custom date range`);
          } else if (dateRangeMode === "today") {
            logger.log(`   📅 Fetching today's data...`);
            initialData = await speedAPI.getTodaySpeeds();
            logger.log(`   ✅ Loaded ${initialData.length} speed records from today`);
          } else {
            // realtime mode
            logger.log(`   Fetching initial data (limit: ${maxDataPoints})...`);
            initialData = await speedAPI.getSpeeds(maxDataPoints);
            logger.log(`   ✅ Loaded ${initialData.length} initial speed records from API`);
          }

          if (initialData.length > 0) {
            setData(initialData);
          } else {
            logger.warn(`   ⚠️  No data available from API`);
          }
          setIsConnected(true);
        } catch (error) {
          logger.error(`   ❌ Error fetching initial data:`, error);
          setIsConnected(false);
        }
      };

      fetchInitialData().then(() => undefined);

      // Only connect to SSE stream in realtime mode
      if (dateRangeMode === "realtime") {
        logger.log(`   Establishing SSE connection to ${config.apiBaseUrl}/api/speeds/stream`);
        const eventSource = speedAPI.connectToSpeedStream(
          (newSpeedData) => {
            logger.log("   📡 Received speed data:", newSpeedData);
            setIsConnected(true);

            setData((prevData) => {
              const newData = [...prevData, newSpeedData];
              // Keep only the last maxDataPoints
              if (newData.length > maxDataPoints) {
                return newData.slice(-maxDataPoints);
              }
              return newData;
            });
          },
          (error) => {
            logger.error("   ❌ SSE connection error:", error);
            setIsConnected(false);
          }
        );

        eventSource.onopen = () => {
          logger.log("   ✅ SSE connection established successfully");
          setIsConnected(true);
        };

        // Cleanup: Close SSE connection on unmount
        return () => {
          logger.log(`   🔌 Closing SSE connection`);
          eventSource.close();
          setIsConnected(false);
        };
      }
    }
  }, [intervalMs, maxDataPoints, lastId, dateRangeMode, customStartDate, customEndDate]);

  return {
    data,
    isConnected,
    connectionMode: config.isSimulation ? 'simulation' : 'sse',
  };
}
