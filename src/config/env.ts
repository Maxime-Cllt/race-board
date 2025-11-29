/**
 * Application environment configuration
 * Supports three modes:
 * - SIMULATION: Mock data with simulated real-time updates (no API needed)
 * - DEV: Connect to development API server
 * - PROD: Connect to production API server
 */

export type AppMode = 'SIMULATION' | 'DEV' | 'PROD';

export const APP_MODE = (process.env.NEXT_PUBLIC_APP_MODE || 'SIMULATION') as AppMode;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:3000';

export const isSimulation = APP_MODE === 'SIMULATION';
export const isDevelopment = APP_MODE === 'DEV';
export const isProduction = APP_MODE === 'PROD';

// Helper to check if we need to connect to an API
export const requiresAPI = isDevelopment || isProduction;

export const config = {
  mode: APP_MODE,
  apiBaseUrl: API_BASE_URL,
  isSimulation,
  isDevelopment,
  isProduction,
  requiresAPI,
} as const;
