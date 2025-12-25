import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  // Refs to track cleanup functions
  const eventSourceRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce timeout for batching SSE updates
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<SpeedData[]>([]);

  // Debug: Track data changes
  useEffect(() => {
    logger.log(`📈 Data state changed: ${data.length} records`);
  }, [data]);

  useEffect(() => {
    logger.log("🔄 useEffect triggered with settings:", {
      dateRangeMode,
      customStartDate,
      customEndDate,
      intervalMs,
      maxDataPoints
    });

    // Flag to track if this effect run should be cancelled
    let isCancelled = false;

    // Close any existing connections from previous effect runs
    if (abortControllerRef.current) {
      logger.log("   🚫 Aborting previous API requests");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (eventSourceRef.current) {
      logger.log("   🔌 Closing existing SSE connection");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup function for when this effect is unmounted or re-run
    const cleanup = () => {
      isCancelled = true;

      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      pendingUpdatesRef.current = [];

      if (abortControllerRef.current) {
        logger.log("   🚫 Aborting pending API requests (cleanup)");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (eventSourceRef.current) {
        logger.log("   🔌 Closing SSE connection (cleanup)");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Create new AbortController for this effect run
    abortControllerRef.current = new AbortController();

    // Clear data immediately when date range settings change
    setData([]);
    setIsConnected(false);
    setIsLoading(true);

    // If custom mode but dates not set, wait for user to select dates
    if (dateRangeMode === "custom" && (!customStartDate || !customEndDate)) {
      logger.log("⏸️ Custom mode selected but dates not set yet. Waiting for user input...");
      setIsLoading(false);
      return cleanup;
    }

    // Simulation mode: Use mock data with simulated real-time updates
    if (config.isSimulation) {
      logger.log("🎮 SIMULATION MODE: Using mock data (no API connection)");
      logger.log(`   Generating data every ${intervalMs / 1000}s`);

      // Initialize with mock data (filtered by date range if needed)
      let initialMockData = mockSpeedData;

      // Filter mock data by date range if in custom mode
      if (dateRangeMode === "custom" && customStartDate && customEndDate) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        initialMockData = mockSpeedData.filter((item) => {
          const itemDate = new Date(item.created_at);
          return itemDate >= startDate && itemDate <= endDate;
        });
        logger.log(`   Filtered ${initialMockData.length} records for date range ${customStartDate} to ${customEndDate}`);
      } else if (dateRangeMode === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        initialMockData = mockSpeedData.filter((item) => {
          const itemDate = new Date(item.created_at);
          return itemDate >= today && itemDate < tomorrow;
        });
        logger.log(`   Filtered ${initialMockData.length} records for today`);
      }

      if (isCancelled) {
        logger.log(`   🚫 Effect was cancelled, not setting simulation data`);
        return cleanup;
      }

      setData(initialMockData);
      setLastId(initialMockData.length);
      setIsConnected(true);
      setIsLoading(false);

      // Simulate real-time updates only in realtime mode
      if (dateRangeMode === "realtime") {
        intervalRef.current = setInterval(() => {
          setLastId((prevId) => {
            const newId = prevId + 1;
            const newDataPoint = generateRealtimeData(newId);

            setData((prevData) => {
              const newData = [...prevData, newDataPoint];
              // Keep only the last maxDataPoints
              if (newData.length > maxDataPoints) {
                return newData.slice(-maxDataPoints);
              }
              return newData;
            });

            return newId;
          });
        }, intervalMs);
      }

      return cleanup;
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

          // Check if this effect run has been cancelled before setting state
          if (isCancelled) {
            logger.log(`   🚫 Effect was cancelled, ignoring fetched data`);
            return;
          }

          logger.log(`   📊 Setting data state with ${initialData.length} records`);
          setData(initialData);
          setIsConnected(true);
          setIsLoading(false);

          if (initialData.length === 0) {
            logger.warn(`   ⚠️  No data available from API`);
          } else {
            logger.log(`   ✅ Data state updated successfully`);
          }
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'AbortError') {
            logger.log(`   🚫 Request was aborted`);
            return;
          }

          if (isCancelled) {
            logger.log(`   🚫 Effect was cancelled, ignoring error`);
            return;
          }

          logger.error(`   ❌ Error fetching initial data:`, error);
          setIsConnected(false);
          setIsLoading(false);
        }
      };

      fetchInitialData();

      // Only connect to SSE stream in realtime mode
      if (dateRangeMode === "realtime") {
        logger.log(`   Establishing SSE connection to ${config.apiBaseUrl}/api/speeds/stream`);
        const streamConnection = speedAPI.connectToSpeedStream(
          (newSpeedData) => {
            logger.log("   📡 Received speed data:", newSpeedData);
            setIsConnected(true);

            // Batch SSE updates to reduce re-render frequency
            pendingUpdatesRef.current.push(newSpeedData);

            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
              if (isCancelled) return;

              const updates = [...pendingUpdatesRef.current];
              pendingUpdatesRef.current = [];

              setData((prevData) => {
                const newData = [...prevData, ...updates];
                // Keep only the last maxDataPoints
                if (newData.length > maxDataPoints) {
                  return newData.slice(-maxDataPoints);
                }
                return newData;
              });
            }, 100); // Batch updates within 100ms window
          },
          (error) => {
            logger.error("   ❌ SSE connection error:", error);
            setIsConnected(false);
          },
          () => {
            logger.log("   ✅ SSE connection established successfully");
            setIsConnected(true);
          }
        );

        // Store the stream connection in ref for cleanup
        eventSourceRef.current = streamConnection as any;
      }

      return cleanup;
    }

    return cleanup;
  }, [intervalMs, maxDataPoints, dateRangeMode, customStartDate, customEndDate]);

  // Client-side filtering to ensure only data within the selected date range is displayed
  const filteredData = useMemo(() => {
    // In realtime mode, show all data
    if (dateRangeMode === "realtime") {
      return data;
    }

    // For "today" mode
    if (dateRangeMode === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= today && itemDate < tomorrow;
      });
    }

    // For "custom" date range mode
    if (dateRangeMode === "custom" && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);

      return data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return data;
  }, [data, dateRangeMode, customStartDate, customEndDate]);

  return {
    data: filteredData,
    isConnected,
    isLoading,
    connectionMode: config.isSimulation ? 'simulation' : 'sse',
  };
}
