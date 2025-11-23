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
