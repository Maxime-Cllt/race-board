/**
 * Zod schemas for API response validation
 * Ensures data integrity and type safety from untrusted API sources
 */

import { z } from 'zod';
import { Lane, SpeedDataAPI } from '@/types/speed-data';

/**
 * Schema for API SpeedData response (before conversion)
 */
export const SpeedDataAPISchema = z.object({
  id: z.number().int().positive(),
  sensor_name: z.string().nullable(),
  speed: z.number().min(0).max(500), // Realistic speed limits (0-500 km/h)
  lane: z.union([z.literal(0), z.literal(1)]),
  created_at: z.string().datetime(), // ISO 8601 datetime string
});

/**
 * Schema for internal SpeedData (after conversion)
 */
export const SpeedDataSchema = z.object({
  id: z.number().int().positive(),
  sensor_name: z.string().nullable(),
  speed: z.number().min(0).max(500),
  lane: z.nativeEnum(Lane),
  created_at: z.string().datetime(),
});

/**
 * Schema for array of SpeedDataAPI
 */
export const SpeedDataAPIArraySchema = z.array(SpeedDataAPISchema);

/**
 * Schema for health check response
 */
export const HealthCheckSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

/**
 * Validate and parse API response
 * @param data - Raw API response data
 * @returns Validated SpeedDataAPI object
 * @throws ZodError if validation fails
 */
export function validateSpeedDataAPI(data: unknown): SpeedDataAPI {
  return SpeedDataAPISchema.parse(data);
}

/**
 * Validate and parse array of API responses
 * @param data - Raw API response data array
 * @returns Validated SpeedDataAPI array
 * @throws ZodError if validation fails
 */
export function validateSpeedDataAPIArray(data: unknown): SpeedDataAPI[] {
  return SpeedDataAPIArraySchema.parse(data);
}

/**
 * Safe validation that returns success/error result instead of throwing
 * @param data - Raw API response data
 * @returns Validation result with data or error
 */
export function safeValidateSpeedDataAPI(data: unknown) {
  return SpeedDataAPISchema.safeParse(data);
}

/**
 * Safe validation for array of responses
 * @param data - Raw API response data array
 * @returns Validation result with data or error
 */
export function safeValidateSpeedDataAPIArray(data: unknown) {
  return SpeedDataAPIArraySchema.safeParse(data);
}

/**
 * Validate health check response
 * @param data - Raw health check response
 * @returns Validated health check data
 */
export function validateHealthCheck(data: unknown) {
  return HealthCheckSchema.parse(data);
}
