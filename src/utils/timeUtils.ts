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

/**
 * Format elapsed seconds as HH:MM:SS
 * @feature 006-economy-game-clock
 * @param totalSeconds - Total elapsed seconds
 * @returns Formatted time string (e.g., "01:23:45", "100:00:00")
 */
export function formatGameClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
