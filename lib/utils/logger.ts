/**
 * Logger Utility
 * 
 * This utility provides a consistent logging interface that automatically
 * disables logs in production environments for security and performance.
 * Supports configurable log levels via storage.
 */

import { plainLocalStorage } from './secure-storage';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Log levels
export enum LogLevel {
  NONE = 0,   // No logging
  ERROR = 1,  // Only errors
  WARN = 2,   // Errors and warnings
  INFO = 3,   // Errors, warnings, and info
  DEBUG = 4   // All logs
}

// Storage key for log level
const LOG_LEVEL_KEY = 'serenenow_log_level';

/**
 * Get the current log level from storage or default based on environment
 */
function getLogLevel(): LogLevel {
  // Check if we have a stored log level
  const storedLevel = plainLocalStorage.getItem<number>(LOG_LEVEL_KEY);
  
  if (storedLevel !== null) {
    return storedLevel;
  }
  
  // Default log level based on environment
  return isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
}

/**
 * Set the log level
 */
export function setLogLevel(level: LogLevel): void {
  plainLocalStorage.setItem(LOG_LEVEL_KEY, level);
}

/**
 * Logger interface with methods for different log levels
 */
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Create a logger that respects the configured log level
 */
function createLogger(): Logger {
  return {
    debug: (message: string, ...args: any[]) => {
      if (getLogLevel() >= LogLevel.DEBUG) {
        logger.debug(`[DEBUG] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (getLogLevel() >= LogLevel.INFO) {
        logger.info(`[INFO] ${message}`, ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (getLogLevel() >= LogLevel.WARN) {
        logger.warn(`[WARN] ${message}`, ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (getLogLevel() >= LogLevel.ERROR) {
        logger.error(`[ERROR] ${message}`, ...args);
      }
    }
  };
};

/**
 * Export the logger instance
 */
export const logger = createLogger();

/**
 * Helper function to safely stringify objects for logging
 * @param obj Object to stringify
 * @returns Safe string representation of the object
 */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Object cannot be stringified: ${error}]`;
  }
}
