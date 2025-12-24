import { SpeedData, SpeedDataAPI, apiToSpeedData } from '@/types/speed-data';
import { config } from '@/config/env';
import { logger } from '@/lib/logger';
import { validateSpeedDataAPI, validateSpeedDataAPIArray, validateHealthCheck } from '@/lib/validation';

/**
 * SpeedStream API Service
 * Handles all API interactions with the SpeedStream backend
 */
export class SpeedStreamAPI {
  private baseUrl: string;
  private apiToken: string;

  constructor(baseUrl: string = config.apiBaseUrl, apiToken: string = config.apiToken) {
    this.baseUrl = baseUrl;
    this.apiToken = apiToken;
  }

  /**
   * Get the effective API URL (direct or through proxy)
   */
  private getApiUrl(): string {
    return config.API_BASE_URL;
  }

  /**
   * Get the effective SSE stream URL (direct or through proxy)
   */
  private getStreamUrl(): string {
    return config.getEffectiveStreamUrl();
  }

  /**
   * Get headers for API requests, including authentication if API token is set
   */
  private getHeaders(includeContentType: boolean = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Bearer token to headers if configured
    // When using proxy, the proxy will forward this header to the API
    // When not using proxy, this header is sent directly to nginx/API
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  /**
   * Fetch the latest speed measurement
   * GET /api/speeds/latest
   */
  async getLatestSpeed(): Promise<SpeedData | null> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/speeds/latest`, {
        headers: this.getHeaders(false),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch latest speed: ${response.statusText}`);
      }
      const rawData = await response.json();
      const apiData = validateSpeedDataAPI(rawData); // Validate response
      return apiToSpeedData(apiData);
    } catch (error) {
      logger.error('Error fetching latest speed:', error);
      return null;
    }
  }

  /**
   * Fetch speed measurements with optional limit
   * GET /api/speeds?limit={n}
   */
  async getSpeeds(limit: number = 100): Promise<SpeedData[]> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/speeds?limit=${limit}`, {
        headers: this.getHeaders(false),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch speeds: ${response.statusText}`);
      }
      const rawData = await response.json();
      const apiData = validateSpeedDataAPIArray(rawData); // Validate response
      return apiData.map(apiToSpeedData);
    } catch (error) {
      logger.error('Error fetching speeds:', error);
      return [];
    }
  }

  /**
   * Fetch today's speed measurements
   * GET /api/speeds/today?limit={n}
   */
  async getTodaySpeeds(limit: number = 1000): Promise<SpeedData[]> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/speeds/today?limit=${limit}`, {
        headers: this.getHeaders(false),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch today's speeds: ${response.statusText}`);
      }
      const rawData = await response.json();
      const apiData = validateSpeedDataAPIArray(rawData); // Validate response
      return apiData.map(apiToSpeedData);
    } catch (error) {
      logger.error("Error fetching today's speeds:", error);
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
        `${this.getApiUrl()}/api/speeds/paginated?offset=${offset}&limit=${limit}`,
        { headers: this.getHeaders(false) }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch paginated speeds: ${response.statusText}`);
      }
      const rawData = await response.json();
      const apiData = validateSpeedDataAPIArray(rawData); // Validate response
      return apiData.map(apiToSpeedData);
    } catch (error) {
      logger.error('Error fetching paginated speeds:', error);
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
      const response = await fetch(`${this.getApiUrl()}/api/speeds/range?${params.toString()}`, {
        headers: this.getHeaders(false),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch speeds by range: ${response.statusText}`);
      }
      const rawData = await response.json();
      const apiData = validateSpeedDataAPIArray(rawData); // Validate response
      return apiData.map(apiToSpeedData);
    } catch (error) {
      logger.error('Error fetching speeds by range:', error);
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
      const response = await fetch(`${this.getApiUrl()}/api/speeds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return response.status === 201;
    } catch (error) {
      logger.error('Error creating speed measurement:', error);
      return false;
    }
  }

  /**
   * Establish a Server-Sent Events connection for real-time speed updates
   * GET /api/speeds/stream
   * Note: Using fetch with ReadableStream instead of EventSource to support Bearer token authentication
   * @param onMessage Callback function to handle incoming speed data
   * @param onError Callback function to handle connection errors
   * @param onOpen Callback function to handle connection open event
   * @returns Object with close() method to terminate the connection
   */
  connectToSpeedStream(
    onMessage: (data: SpeedData) => void,
    onError?: (error: Error) => void,
    onOpen?: () => void
  ): { close: () => void } {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let aborted = false;

    const streamConnection = {
      close: () => {
        aborted = true;
        if (reader) {
          reader.cancel();
          reader = null;
        }
      },
    };

    // Start the connection
    (async () => {
      try {
        const response = await fetch(this.getStreamUrl(), {
          headers: this.getHeaders(false),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Call onOpen callback if provided
        if (onOpen) {
          onOpen();
        }

        reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (!aborted) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const rawData = JSON.parse(line.substring(6));
                const apiData = validateSpeedDataAPI(rawData); // Validate SSE data
                const speedData = apiToSpeedData(apiData);
                onMessage(speedData);
              } catch (error) {
                logger.error('Error parsing SSE data:', error);
              }
            }
          }
        }
      } catch (error) {
        if (!aborted) {
          logger.error('SSE connection error:', error);
          if (onError && error instanceof Error) {
            onError(error);
          }
        }
      }
    })();

    return streamConnection;
  }

  /**
   * Check API health status
   * GET /health
   */
  async checkHealth(): Promise<{ status: string; message?: string } | null> {
    try {
      const response = await fetch(`${this.getApiUrl()}/health`, {
        headers: this.getHeaders(false),
      });
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      const rawData = await response.json();
      return validateHealthCheck(rawData); // Validate health check response
    } catch (error) {
      logger.error('Error checking API health:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const speedAPI = new SpeedStreamAPI();
