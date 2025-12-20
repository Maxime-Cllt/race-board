/**
 * Application environment configuration
 * Supports three modes:
 * - SIMULATION: Mock data with simulated real-time updates (no API needed)
 * - DEV: Connect to development API server
 * - PROD: Connect to production API server
 */

import { logger } from '@/lib/logger';

export type AppMode = 'SIMULATION' | 'DEV' | 'PROD';

export const APP_MODE = (process.env.NEXT_PUBLIC_APP_MODE || 'SIMULATION') as AppMode;
// Empty string means use relative paths (for nginx routing)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
export const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

export const isSimulation = APP_MODE === 'SIMULATION';
export const isDevelopment = APP_MODE === 'DEV';
export const isProduction = APP_MODE === 'PROD';

// Helper to check if we need to connect to an API
export const requiresAPI = isDevelopment || isProduction;

// Proxy configuration
// In browser context with HTTPS backend, use the Next.js API proxy to handle SSL certificates
export const USE_API_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true';

// Get the effective API URL (either direct or through proxy)
export function getEffectiveApiUrl(): string {
  if (USE_API_PROXY && typeof window !== 'undefined') {
    // Use the Next.js proxy route for client-side requests
    return '/api/proxy';
  }
  // If API_BASE_URL is empty, use relative paths (nginx will handle routing)
  // Otherwise use the full URL
  return API_BASE_URL;
}

// Get the effective SSE stream URL
export function getEffectiveStreamUrl(): string {
  if (USE_API_PROXY && typeof window !== 'undefined') {
    // Use the Next.js SSE proxy route for client-side requests
    return '/api/proxy-stream/speeds/stream';
  }
  // If API_BASE_URL is empty, use relative path (nginx routing)
  if (!API_BASE_URL) {
    return '/api/speeds/stream';
  }
  return `${API_BASE_URL}/api/speeds/stream`;
}

/**
 * Validate environment configuration for security
 */
function validateEnvironment() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if API URL is provided when needed
  // Empty string is allowed (means using nginx relative paths)
  if (requiresAPI && process.env.NEXT_PUBLIC_API_URL === undefined) {
    warnings.push('NEXT_PUBLIC_API_URL is not set. Using relative paths (nginx routing).');
  }

  // Warn about localhost/HTTP in development
  if (isDevelopment && API_BASE_URL) {
    if (API_BASE_URL.startsWith('http://localhost') || API_BASE_URL.startsWith('http://127.0.0.1')) {
      warnings.push(
        'Using localhost in DEV mode. Other devices on the network will not be able to connect. ' +
        'Consider using your machine\'s IP address instead.'
      );
    }
  }

  // Validate URL format (only if not empty - empty means relative paths)
  if (requiresAPI && API_BASE_URL && API_BASE_URL !== '') {
    try {
      new URL(API_BASE_URL);
    } catch (e) {
      errors.push(`Invalid API URL format: ${API_BASE_URL}`);
    }
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    warnings.forEach(warning => logger.warn(`⚠️  ${warning}`));
  }

  if (errors.length > 0) {
    errors.forEach(error => logger.error(`❌ ${error}`));

    // In production, throw an error to prevent deployment with insecure config
    if (isProduction && typeof window === 'undefined') {
      throw new Error(
        'Environment validation failed. Check the errors above and fix your configuration.'
      );
    }
  }
}

// Run validation on module load (server-side only to avoid client errors)
if (typeof window === 'undefined') {
  validateEnvironment();
}

export const config = {
  mode: APP_MODE,
  apiBaseUrl: API_BASE_URL,
  apiToken: API_TOKEN,
  isSimulation,
  isDevelopment,
  isProduction,
  requiresAPI,
  useApiProxy: USE_API_PROXY,
  getEffectiveApiUrl,
  getEffectiveStreamUrl,
} as const;
