export enum Lane {
  Left = "Left",
  Right = "Right",
}

export interface SpeedData {
  id: number;
  sensor_name: string | null;
  speed: number; // km/h
  lane: Lane;
  created_at: string; // ISO date string
}

/**
 * API response format where lane is a number (0 = Left, 1 = Right)
 */
export interface SpeedDataAPI {
  id: number;
  sensor_name: string | null;
  speed: number;
  lane: 0 | 1;
  created_at: string;
}

/**
 * Convert API format (lane as number) to internal format (lane as enum)
 */
export function apiToSpeedData(apiData: SpeedDataAPI): SpeedData {
  return {
    ...apiData,
    lane: apiData.lane === 0 ? Lane.Left : Lane.Right,
  };
}
