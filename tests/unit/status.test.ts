import { describe, expect, it } from 'vitest';
import {
  determineCurrentStatus,
  findNextScheduleStart,
  parseScheduleItem,
  type RuntimeStatusConfig,
} from '../../src/scripts/status';
import type { ScheduleItem } from '../../src/config/schema';

describe('starter status artwork', () => {
  it('uses the complete SVG presence family', async () => {
    const { default: config } = await import('../../config/starrybio.config');
    const icons = [
      config.status.default.icon,
      config.status.types.available.icon,
      config.status.types.busy.icon,
      config.status.types.sleeping.icon,
    ];

    expect(icons).toEqual([
      'assets/images/offline.svg',
      'assets/images/online.svg',
      'assets/images/dnd.svg',
      'assets/images/idle.svg',
    ]);
  });
});

function createRuntime(schedule: ScheduleItem[]): RuntimeStatusConfig {
  return {
    enabled: true,
    showOwnerTime: false,
    showVisitorTime: false,
    showNextAvailable: true,
    default: { text: 'Offline', color: '#666666' },
    types: {
      available: { text: 'Available', color: '#00FF00' },
      busy: { text: 'Busy', color: '#FF0000' },
    },
    schedule: schedule.map(parseScheduleItem),
  };
}

describe('visitor-local status schedules', () => {
  const config = createRuntime([
    { status: 'busy', days: 'weekdays', start: '09:00', end: '17:00' },
    { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
    { status: 'available', days: 'weekends', start: '13:00', end: '05:00' },
  ]);

  it('matches ordinary weekday windows in the supplied Date local time', () => {
    const mondayMorning = new Date(2026, 7, 24, 10, 30);
    expect(mondayMorning.getDay()).toBe(1);
    expect(determineCurrentStatus(config, mondayMorning)).toBe('busy');
  });

  it('carries overnight weekday ranges into the next calendar day', () => {
    const saturdayEarly = new Date(2026, 7, 29, 2, 0);
    expect(saturdayEarly.getDay()).toBe(6);
    expect(determineCurrentStatus(config, saturdayEarly)).toBe('available');
  });

  it('does not carry a weekday range out of Sunday', () => {
    const weekdayOnly = createRuntime([
      { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
    ]);
    const mondayEarly = new Date(2026, 7, 24, 2, 0);
    expect(determineCurrentStatus(weekdayOnly, mondayEarly)).toBe('default');
  });

  it('matches weekend ranges and their overnight continuation', () => {
    expect(determineCurrentStatus(config, new Date(2026, 7, 29, 15, 0))).toBe('available');
    expect(determineCurrentStatus(config, new Date(2026, 7, 30, 2, 0))).toBe('available');
  });

  it('finds the next real status boundary without minute-by-minute scanning', () => {
    const fridayEvening = new Date(2026, 7, 28, 20, 30);
    const next = findNextScheduleStart(config, 'available', fridayEvening);
    expect(next).not.toBeNull();
    expect(next?.getDay()).toBe(5);
    expect(next?.getHours()).toBe(21);
    expect(next?.getMinutes()).toBe(0);
  });

  it('treats end times as exclusive', () => {
    expect(determineCurrentStatus(config, new Date(2026, 7, 24, 17, 0))).toBe('default');
  });
});
