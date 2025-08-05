/**
 * Debug utility for conditional console logging
 * Controlled by DO_CONSOLE_LOGGING environment variable
 */

const shouldLog = process.env.DO_CONSOLE_LOGGING === 'true';

export const debug = {
  log: (...args: any[]) => shouldLog && console.log(...args),
  error: (...args: any[]) => shouldLog && console.error(...args),
  warn: (...args: any[]) => shouldLog && console.warn(...args),
  info: (...args: any[]) => shouldLog && console.info(...args),
};