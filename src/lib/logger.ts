/**
 * Production-safe logger utility
 * Disables console logging in production environments
 */

const isProduction = process.env.NODE_ENV === 'production';
const isSimulation = process.env.NEXT_PUBLIC_APP_MODE === 'SIMULATION';

// In production and non-simulation mode, disable logging
const shouldLog = !isProduction || isSimulation;

export const logger = {
  log: (...args: unknown[]) => {
    if (shouldLog) {
      console.log(...args);
    }
  },

  error: (...args: unknown[]) => {
    // Always log errors, but sanitize in production
    if (isProduction && !isSimulation) {
      // In production, log minimal error info
      console.error('An error occurred. Check server logs for details.');
    } else {
      console.error(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (shouldLog) {
      console.warn(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (shouldLog) {
      console.info(...args);
    }
  },

  debug: (...args: unknown[]) => {
    // Debug logs only in development
    if (!isProduction) {
      console.debug(...args);
    }
  },
};
