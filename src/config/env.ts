/**
 * Application environment configuration
 * Supports three modes:
 * - SIMULATION: Mock data with simulated real-time updates (no API needed)
 * - DEV: Connect to development API server
 * - PROD: Connect to production API server
 */

import {logger} from '@/lib/logger';

export type AppMode = 'SIMULATION' | 'DEV' | 'PROD';

export const APP_MODE = (process.env.NEXT_PUBLIC_APP_MODE || 'SIMULATION') as AppMode;

/**
 * Get the API URL from localStorage if available (client-side only)
 * Falls back to environment variable
 */
function getDynamicApiUrl(): string {
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('race-board-settings');
            if (stored) {
                const settings = JSON.parse(stored);
                if (settings.apiUrl) {
                    return settings.apiUrl;
                }
            }
        } catch (error) {
            logger.error('Error reading API URL from localStorage:', error);
        }
    }
    // Fallback to environment variable
    return process.env.NEXT_PUBLIC_API_URL ?? '';
}

// Empty string means use relative paths (for nginx routing)
export const API_BASE_URL = getDynamicApiUrl();
export const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

export const isSimulation = APP_MODE === 'SIMULATION';
export const isDevelopment = APP_MODE === 'DEV';
export const isProduction = APP_MODE === 'PROD';

// Helper to check if we need to connect to an API
export const requiresAPI = isDevelopment || isProduction;


// Get the effective SSE stream URL
export function getEffectiveStreamUrl(): string {
    return `${getDynamicApiUrl()}/api/speeds/stream`;
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
        } catch {
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
    API_BASE_URL,
    getEffectiveStreamUrl,
    getDynamicApiUrl,
} as const;
