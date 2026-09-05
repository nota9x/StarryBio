import { getSvgPathData, resolveIconSource } from '../config/icons';
import type { NormalizedStatusConfig, ScheduleItem } from '../config/schema';

export interface ParsedScheduleItem extends ScheduleItem {
  startMinutes: number;
  endMinutes: number;
  wrapsMidnight: boolean;
}

export interface RuntimeStatusConfig extends Omit<NormalizedStatusConfig, 'schedule'> {
  schedule: ParsedScheduleItem[];
}

export function parseScheduleItem(item: ScheduleItem): ParsedScheduleItem {
  const startMinutes = parseTimeToMinutes(item.start);
  const endMinutes = parseTimeToMinutes(item.end);
  return {
    ...item,
    startMinutes,
    endMinutes,
    wrapsMidnight: startMinutes > endMinutes,
  };
}

export function determineCurrentStatus(config: RuntimeStatusConfig, now = new Date()): string {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    config.schedule.find((item) => scheduleItemMatches(item, day, minutes))?.status || 'default'
  );
}

export function findNextScheduleStart(
  config: RuntimeStatusConfig,
  statusName: string,
  now = new Date()
): Date | null {
  let next: Date | null = null;

  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    for (const item of config.schedule) {
      if (item.status !== statusName) continue;
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + dayOffset);
      candidate.setHours(Math.floor(item.startMinutes / 60), item.startMinutes % 60, 0, 0);
      if (candidate <= now || !appliesToDay(item.days, candidate.getDay())) continue;

      const previous = new Date(candidate.getTime() - 60_000);
      if (
        determineCurrentStatus(config, candidate) === statusName &&
        determineCurrentStatus(config, previous) !== statusName &&
        (!next || candidate < next)
      ) {
        next = candidate;
      }
    }
  }
  return next;
}

export function scheduleItemMatches(
  item: ParsedScheduleItem,
  localDay: number,
  localMinutes: number
): boolean {
  if (!item.wrapsMidnight) {
    return appliesToDay(item.days, localDay) && inMinuteRange(localMinutes, item);
  }
  if (localMinutes >= item.startMinutes) return appliesToDay(item.days, localDay);
  return localMinutes < item.endMinutes && appliesToDay(item.days, (localDay + 6) % 7);
}

export function setupStatus(signal: AbortSignal): () => void {
  const rawConfig = readStatusConfig();
  const trigger = document.querySelector<HTMLButtonElement>('#status-indicator-container');
  if (!rawConfig?.enabled || !trigger) return () => undefined;

  const config: RuntimeStatusConfig = {
    ...rawConfig,
    schedule: rawConfig.schedule.map(parseScheduleItem),
  };
  const dialog = document.querySelector<HTMLDialogElement>('#status-modal');
  const closeButton = document.querySelector<HTMLButtonElement>('#status-modal-close');

  trigger.addEventListener(
    'click',
    () => {
      dialog?.showModal();
      trigger.setAttribute('aria-expanded', 'true');
    },
    { signal }
  );
  closeButton?.addEventListener('click', () => dialog?.close(), { signal });
  dialog?.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) dialog.close();
    },
    { signal }
  );
  dialog?.addEventListener(
    'close',
    () => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    },
    { signal }
  );

  populateScheduleModal(config);
  updateStatus(config);

  let intervalId: number | undefined;
  const delay = 60_000 - (Date.now() % 60_000) + 25;
  const timeoutId = window.setTimeout(() => {
    updateStatus(config);
    intervalId = window.setInterval(() => updateStatus(config), 60_000);
  }, delay);

  return () => {
    window.clearTimeout(timeoutId);
    if (intervalId !== undefined) window.clearInterval(intervalId);
    if (dialog?.open) dialog.close();
  };
}

function readStatusConfig(): NormalizedStatusConfig | null {
  const template = document.querySelector<HTMLTemplateElement>('#starrybio-status-config');
  const json = template?.content.textContent || '';
  if (!json) return null;
  try {
    return JSON.parse(json) as NormalizedStatusConfig;
  } catch (error) {
    console.warn('[StarryBio] Unable to parse embedded status config.', error);
    return null;
  }
}

function updateStatus(config: RuntimeStatusConfig): void {
  const currentStatus = determineCurrentStatus(config);
  const definition = config.types[currentStatus] || config.default;
  const isAvailable = currentStatus === 'available';
  const message = definition.message || config.responseText || '';
  const icon = document.querySelector<HTMLElement>('#status-indicator-icon');

  if (icon)
    setMaskedIcon(
      icon,
      resolveIconSource(definition.icon || config.default.icon),
      definition.color
    );
  setText('#tooltip-status', definition.text);

  const availability = isAvailable ? `Available now${message ? ` · ${message}` : ''}` : message;
  setOptionalText('#tooltip-availability', availability);

  const ownerTime =
    config.showOwnerTime && config.ownerTimeZone
      ? `Owner: ${formatClock(new Date(), config.ownerTimeZone)}`
      : '';
  setOptionalText('#tooltip-owner-time', ownerTime);
  document.querySelector('#tooltip-owner-time-row')?.classList.toggle('hidden', !ownerTime);

  const visitorTime = config.showVisitorTime ? `Your time: ${formatClock(new Date())}` : '';
  setOptionalText('#tooltip-visitor-time', visitorTime);

  const nextAvailable =
    config.showNextAvailable && !isAvailable ? findNextScheduleStart(config, 'available') : null;
  setOptionalText(
    '#tooltip-next-available',
    nextAvailable ? `Next available ${formatDateTime(nextAvailable)}` : ''
  );
}

function populateScheduleModal(config: RuntimeStatusConfig): void {
  const weekdayList = document.querySelector('#weekday-schedule-list');
  const weekendList = document.querySelector('#weekend-schedule-list');
  weekdayList?.replaceChildren();
  weekendList?.replaceChildren();

  config.schedule.forEach((item) => {
    const element = createScheduleItem(item, config);
    if (item.days === 'daily') {
      weekdayList?.append(element.cloneNode(true));
      weekendList?.append(element);
    } else if (item.days === 'weekdays') {
      weekdayList?.append(element);
    } else {
      weekendList?.append(element);
    }
  });
}

function createScheduleItem(item: ParsedScheduleItem, config: RuntimeStatusConfig): HTMLLIElement {
  const definition = config.types[item.status];
  const listItem = document.createElement('li');
  listItem.className = 'schedule-item';

  const status = document.createElement('span');
  status.className = 'schedule-status';
  const dot = document.createElement('span');
  dot.className = 'schedule-color';
  dot.style.backgroundColor = definition.color;
  const label = document.createElement('span');
  label.textContent = definition.text;
  status.append(dot, label);

  const range = document.createElement('span');
  range.className = 'schedule-time';
  range.textContent = formatScheduleRange(item);
  listItem.append(status, range);
  return listItem;
}

function formatScheduleRange(item: ParsedScheduleItem): string {
  const suffix = item.wrapsMidnight ? ' (next day)' : '';
  return `${formatMinutes(item.startMinutes)} - ${formatMinutes(item.endMinutes)}${suffix}`;
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const date = new Date(2000, 0, 1, hours, minutes % 60);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatClock(date: Date, timeZone?: string): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function appliesToDay(days: ScheduleItem['days'], day: number): boolean {
  if (days === 'daily') return true;
  const weekend = day === 0 || day === 6;
  return days === 'weekends' ? weekend : !weekend;
}

function inMinuteRange(minutes: number, item: ParsedScheduleItem): boolean {
  return minutes >= item.startMinutes && minutes < item.endMinutes;
}

function setText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = text;
}

function setOptionalText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;
  element.textContent = text;
  element.classList.toggle('hidden', !text);
}

function setMaskedIcon(element: HTMLElement, source: string, color: string): void {
  const pathData = getSvgPathData(source);
  const iconUrl = pathData
    ? `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${pathData}"/></svg>`
      )}`
    : '';
  const artworkUrl = pathData ? '' : toAbsoluteUrl(source);
  element.classList.toggle('status-icon-artwork', Boolean(artworkUrl));
  element.style.backgroundColor = artworkUrl ? 'transparent' : color;
  element.style.backgroundImage = artworkUrl ? `url('${cssEscapeUrl(artworkUrl)}')` : 'none';
  const maskImage = iconUrl ? `url('${cssEscapeUrl(iconUrl)}')` : 'none';
  element.style.setProperty('-webkit-mask-image', maskImage);
  element.style.maskImage = maskImage;
}

function toAbsoluteUrl(value: string): string {
  if (!value || /^(?:data:|https?:|\/)/i.test(value)) return value;
  return `/${value}`;
}

function cssEscapeUrl(value: string): string {
  return value
    .replace(/[\r\n\f]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}
