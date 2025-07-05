import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Get the configured timezone from environment or default to browser's timezone
export const getTimezone = (): string => {
  // Check for environment variable first (Vite uses import.meta.env)
  const envTimezone = import.meta.env.VITE_TIMEZONE;
  if (envTimezone) {
    return envTimezone;
  }
  
  // Fall back to browser's timezone
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Convert UTC date to local timezone
export const utcToLocal = (utcDate: Date | string): dayjs.Dayjs => {
  const timezone = getTimezone();
  return dayjs.utc(utcDate).tz(timezone);
};

// Convert local date to UTC
export const localToUtc = (localDate: Date | string): dayjs.Dayjs => {
  const timezone = getTimezone();
  return dayjs.tz(localDate, timezone).utc();
};

// Format date in local timezone
export const formatDateLocal = (utcDate: Date | string, format = 'YYYY-MM-DD'): string => {
  const timezone = getTimezone();
  return dayjs.utc(utcDate).tz(timezone).format(format);
};

// Format date and time in local timezone
export const formatDateTimeLocal = (utcDate: Date | string, format = 'YYYY-MM-DD HH:mm'): string => {
  const timezone = getTimezone();
  return dayjs.utc(utcDate).tz(timezone).format(format);
};

// Format time in local timezone
export const formatTimeLocal = (utcDate: Date | string, format = 'HH:mm'): string => {
  const timezone = getTimezone();
  return dayjs.utc(utcDate).tz(timezone).format(format);
};

// Check if a UTC date is today in local timezone
export const isTodayLocal = (utcDate: Date | string): boolean => {
  const timezone = getTimezone();
  const today = dayjs().tz(timezone);
  const date = dayjs.utc(utcDate).tz(timezone);
  return date.isSame(today, 'day');
};

// Get start of day in local timezone, converted to UTC
export const getStartOfDayLocal = (date: Date | string): Date => {
  const timezone = getTimezone();
  return dayjs.tz(date, timezone).startOf('day').utc().toDate();
};

// Get end of day in local timezone, converted to UTC
export const getEndOfDayLocal = (date: Date | string): Date => {
  const timezone = getTimezone();
  return dayjs.tz(date, timezone).endOf('day').utc().toDate();
};

// Get current date in local timezone as UTC
export const getCurrentDateUtc = (): Date => {
  const timezone = getTimezone();
  return dayjs().tz(timezone).utc().toDate();
};

// Get today's date range in local timezone as UTC
export const getTodayRangeUtc = (): { start: Date; end: Date } => {
  const timezone = getTimezone();
  const today = dayjs().tz(timezone);
  
  return {
    start: today.startOf('day').utc().toDate(),
    end: today.endOf('day').utc().toDate()
  };
};

// Parse a date string in local timezone and convert to UTC
export const parseLocalToUtc = (dateString: string, format = 'YYYY-MM-DD'): Date => {
  const timezone = getTimezone();
  return dayjs.tz(dateString, format, timezone).utc().toDate();
};

// Get a dayjs object in the configured timezone
export const dayjsInTimezone = (date?: Date | string): dayjs.Dayjs => {
  const timezone = getTimezone();
  return date ? dayjs.tz(date, timezone) : dayjs().tz(timezone);
}; 