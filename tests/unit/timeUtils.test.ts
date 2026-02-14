import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getElapsedTime, msToSeconds, secondsToMs, formatGameClock } from '../../src/utils/timeUtils';

describe('timeUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getElapsedTime', () => {
    it('should calculate elapsed time in milliseconds', () => {
      const start = 1000;
      vi.setSystemTime(6000);
      
      expect(getElapsedTime(start)).toBe(5000);
    });

    it('should return 0 when no time has passed', () => {
      const now = Date.now();
      expect(getElapsedTime(now)).toBe(0);
    });
  });

  describe('msToSeconds', () => {
    it('should convert milliseconds to seconds', () => {
      expect(msToSeconds(1000)).toBe(1);
      expect(msToSeconds(5000)).toBe(5);
      expect(msToSeconds(500)).toBe(0.5);
    });

    it('should handle 0 milliseconds', () => {
      expect(msToSeconds(0)).toBe(0);
    });

    it('should handle decimal precision', () => {
      expect(msToSeconds(1234)).toBe(1.234);
    });
  });

  describe('secondsToMs', () => {
    it('should convert seconds to milliseconds', () => {
      expect(secondsToMs(1)).toBe(1000);
      expect(secondsToMs(5)).toBe(5000);
      expect(secondsToMs(0.5)).toBe(500);
    });

    it('should handle 0 seconds', () => {
      expect(secondsToMs(0)).toBe(0);
    });

    it('should handle decimal precision', () => {
      expect(secondsToMs(1.5)).toBe(1500);
    });
  });

  describe('formatGameClock', () => {
    it('should format 0 seconds as 00:00:00', () => {
      expect(formatGameClock(0)).toBe('00:00:00');
    });

    it('should format seconds correctly (under 1 minute)', () => {
      expect(formatGameClock(30)).toBe('00:00:30');
      expect(formatGameClock(59)).toBe('00:00:59');
    });

    it('should format minutes correctly (under 1 hour)', () => {
      expect(formatGameClock(60)).toBe('00:01:00');
      expect(formatGameClock(90)).toBe('00:01:30');
      expect(formatGameClock(3599)).toBe('00:59:59');
    });

    it('should format hours correctly', () => {
      expect(formatGameClock(3600)).toBe('01:00:00');
      expect(formatGameClock(3661)).toBe('01:01:01');
      expect(formatGameClock(7200)).toBe('02:00:00');
    });

    it('should handle large hour values (100+ hours)', () => {
      expect(formatGameClock(360000)).toBe('100:00:00');
      expect(formatGameClock(999999)).toBe('277:46:39');
    });

    it('should pad single digits with zeros', () => {
      expect(formatGameClock(3661)).toBe('01:01:01'); // 1h 1m 1s
      expect(formatGameClock(3665)).toBe('01:01:05'); // 1h 1m 5s
    });

    it('should handle typical game session durations', () => {
      expect(formatGameClock(300)).toBe('00:05:00');   // 5 minutes
      expect(formatGameClock(600)).toBe('00:10:00');   // 10 minutes
      expect(formatGameClock(900)).toBe('00:15:00');   // 15 minutes
      expect(formatGameClock(1800)).toBe('00:30:00');  // 30 minutes
    });
  });
});
