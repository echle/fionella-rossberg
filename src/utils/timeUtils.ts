/**
 * Time-related utility functions
 */

/**
 * Calculate elapsed time in milliseconds
 */
export function getElapsedTime(previousTimestamp: number): number {
  return Date.now() - previousTimestamp;
}

/**
 * Convert milliseconds to seconds
 */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/**
 * Convert seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}
