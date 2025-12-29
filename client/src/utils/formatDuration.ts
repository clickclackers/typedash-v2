/**
 * Converts a duration in seconds to a human-readable string format.
 * Returns the string in the format: "Xd Xh Xm Xs" (e.g., "2d 3h 15m 30s")
 * Only includes non-zero units for a cleaner display.
 *
 * @param seconds - The duration in seconds
 * @returns A formatted string representation of the duration
 *
 * @example
 * formatDuration(3661) // "1h 1m 1s"
 * formatDuration(86400) // "1d"
 * formatDuration(90) // "1m 30s"
 * formatDuration(45) // "45s"
 * formatDuration(0) // "0s"
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 0 || !Number.isFinite(seconds)) {
    return '0s';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
};
