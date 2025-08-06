/**
 * Environment Debug Utility
 * 
 * This utility helps debug environment variables in Next.js
 * Only use during development - remove before production
 */

import { logger } from './logger';

/**
 * Log all environment variables with a specific prefix
 * @param prefix The prefix to filter environment variables (e.g., 'NEXT_PUBLIC_')
 */
export function logEnvironmentVariables(prefix: string = ''): void {
  if (typeof process === 'undefined' || !process.env) {
    logger.error('process.env is not available in this context');
    return;
  }

  logger.debug('Environment Variables:');
  
  Object.keys(process.env)
    .filter(key => key.startsWith(prefix))
    .forEach(key => {
      logger.debug(`${key}: ${process.env[key]}`);
    });
}

/**
 * Get a specific environment variable
 * @param name The name of the environment variable
 * @param defaultValue Default value if the environment variable is not set
 * @returns The value of the environment variable or the default value
 */
export function getEnv(name: string, defaultValue: string = ''): string {
  if (typeof process === 'undefined' || !process.env) {
    return defaultValue;
  }
  
  return process.env[name] || defaultValue;
}
