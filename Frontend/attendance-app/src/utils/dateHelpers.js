// eslint-disable-next-line import/no-unresolved
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy');
};

/**
 * Format time to readable string
 */
export const formatTime = (date) => {
  return format(new Date(date), 'hh:mm a');
};

/**
 * Get month name
 */
export const getMonthName = (monthNumber) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[monthNumber - 1];
};

/**
 * Get all days in a month
 */
export const getDaysInMonth = (month, year) => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return eachDayOfInterval({ start, end });
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
};