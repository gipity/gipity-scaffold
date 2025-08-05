/**
 * Debug utility for conditional console logging
 * Controlled by VITE_DO_CONSOLE_LOGGING environment variable
 */

const shouldLog = import.meta.env.VITE_DO_CONSOLE_LOGGING === 'true';

export const debug = {
  log: (...args: any[]) => shouldLog && console.log(...args),
  error: (...args: any[]) => shouldLog && console.error(...args),
  warn: (...args: any[]) => shouldLog && console.warn(...args),
  info: (...args: any[]) => shouldLog && console.info(...args),
};