import { formatDateLocal, formatDateTimeLocal, formatTimeLocal } from './dayjs';

export const formatDate = (date: Date | string): string => {
  return formatDateLocal(date, 'MMM D, YYYY');
};

export const formatDateTime = (date: Date | string): string => {
  return formatDateTimeLocal(date, 'MMM D, YYYY HH:mm');
};

export const formatTime = (date: Date | string): string => {
  return formatTimeLocal(date, 'HH:mm');
};

import { isTodayLocal } from './dayjs';

export const isToday = (date: Date | string): boolean => {
  return isTodayLocal(date);
};

export const isThisWeek = (date: Date | string): boolean => {
  const today = new Date();
  const d = new Date(date);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return d >= startOfWeek && d <= endOfWeek;
};

export const isThisMonth = (date: Date | string): boolean => {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  );
};

import { getStartOfDayLocal, getEndOfDayLocal } from './dayjs';

export const getStartOfDay = (date: Date | string): Date => {
  return getStartOfDayLocal(date);
};

export const getEndOfDay = (date: Date | string): Date => {
  return getEndOfDayLocal(date);
};
