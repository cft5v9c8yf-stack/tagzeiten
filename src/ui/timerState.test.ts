import { beforeEach, describe, expect, it } from 'vitest';
import { formatClock, timer } from './timerState';

describe('timer', () => {
  beforeEach(() => timer.reset(45 * 60));

  it('counts down from timestamps and pauses', () => {
    timer.start(0);
    expect(timer.left(60_000)).toBe(44 * 60);
    timer.pause(90_000);
    expect(timer.left(10_000_000)).toBe(45 * 60 - 90);
    timer.start(100_000);
    expect(timer.left(110_000)).toBe(45 * 60 - 100);
  });

  it('keeps elapsed time when switching to the short form', () => {
    timer.start(0);
    timer.pause(5 * 60_000);
    timer.setTotal(20 * 60);
    expect(timer.left()).toBe(15 * 60);
  });

  it('formats overtime with a plus', () => {
    expect(formatClock(125)).toBe('02:05');
    expect(formatClock(-90)).toBe('+01:30');
    expect(formatClock(0)).toBe('00:00');
  });
});
