import { SpeedData, SpeedDataAPI, apiToSpeedData } from '@/types/speed-data';
import { config } from '@/config/env';

/**
 * SpeedStream API Service
 * Handles all API interactions with the SpeedStream backend
 */
export class SpeedStreamAPI {
  private baseUrl: string;

  constructor(baseUrl: string = config.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch the latest speed measurement
   * GET /api/speeds/latest
   */
  async getLatestSpeed(): Promise<SpeedData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/speeds/latest`);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest speed: ${response.statusText}`);
      }
      const apiData: SpeedDataAPI = await response.json();
      return apiToSpeedData(apiData);
    } catch (error) {
      console.error('Error fetching latest speed:', error);
      return null;
    }
  }

  /**
   * Fetch speed measurements with optional limit
   * GET /api/speeds?limit={n}
   */
  async getSpeeds(limit: number = 100): Promise<SpeedData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/speeds?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch speeds: ${response.statusText}`);
      }
      const apiData: SpeedDataAPI[] = await response.json();
      return apiData.map(apiToSpeedData);
    } catch (error) {
      console.error('Error fetching speeds:', error);
      return [];
    }
  }

  /**
   * Fetch today's speed measurements
   * GET /api/speeds/today?limit={n}
   */
  async getTodaySpeeds(limit: number = 1000): Promise<SpeedData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/speeds/today?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch today's speeds: ${response.statusText}`);
      }
      const apiData: SpeedDataAPI[] = await response.json();
      return apiData.map(apiToSpeedData);
    } catch (error) {
      console.error("Error fetching today's speeds:", error);
      return [];
    }
  }

  /**
   * Fetch paginated speed measurements
   * GET /api/speeds/paginated?offset={n}&limit={m}
   */
  async getPaginatedSpeeds(offset: number = 0, limit: number = 100): Promise<SpeedData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/speeds/paginated?offset=${offset}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch paginated speeds: ${response.statusText}`);
      }
      const apiData: SpeedDataAPI[] = await response.json();
      return apiData.map(apiToSpeedData);
    } catch (error) {
      console.error('Error fetching paginated speeds:', error);
      return [];
    }
  }

  /**
   * Fetch speed measurements within a date range
   * GET /api/speeds/range?start_date={start}&end_date={end}
   * @param startDate Start date in ISO format (e.g., "2024-01-08 08:30:00" or "2024-01-08T08:30:00")
   * @param endDate End date in ISO format (e.g., "2024-01-14 18:45:00" or "2024-01-14T18:45:00")
   */
  async getSpeedsByRange(startDate: string, endDate: string): Promise<SpeedData[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      const response = await fetch(`${this.baseUrl}/api/speeds/range?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch speeds by range: ${response.statusText}`);
      }
      const apiData: SpeedDataAPI[] = await response.json();
      return apiData.map(apiToSpeedData);
    } catch (error) {
      console.error('Error fetching speeds by range:', error);
      return [];
    }
  }

  /**
   * Create a new speed measurement
   * POST /api/speeds
   */
  async createSpeed(data: {
    sensor_name?: string;
    speed: number;
    lane: number;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/speeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.status === 201;
    } catch (error) {
      console.error('Error creating speed measurement:', error);
      return false;
    }
  }

  /**
   * Establish a Server-Sent Events connection for real-time speed updates
   * GET /api/speeds/stream
   * @param onMessage Callback function to handle incoming speed data
   * @param onError Callback function to handle connection errors
   * @returns EventSource instance
   */
  connectToSpeedStream(
    onMessage: (data: SpeedData) => void,
    onError?: (error: Event) => void
  ): EventSource {
    const eventSource = new EventSource(`${this.baseUrl}/api/speeds/stream`);

    eventSource.onmessage = (event) => {
      try {
        const apiData: SpeedDataAPI = JSON.parse(event.data);
        const speedData = apiToSpeedData(apiData);
        onMessage(speedData);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (onError) {
        onError(error);
      }
    };

    return eventSource;
  }

  /**
   * Check API health status
   * GET /health
   */
  async checkHealth(): Promise<{ status: string; message: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const speedAPI = new SpeedStreamAPI();
