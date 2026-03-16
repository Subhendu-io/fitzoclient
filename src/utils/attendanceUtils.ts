/**
 * Utility functions for attendance timestamp normalization and formatting
 */

export const parseAttendanceTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  } else if (timestamp._seconds !== undefined || timestamp.seconds !== undefined) {
    const secs = timestamp._seconds !== undefined ? timestamp._seconds : timestamp.seconds;
    return new Date(Math.floor(secs * 1000));
  }

  if (typeof timestamp === 'string') {
    if (timestamp.includes('T') || timestamp.includes('Z')) {
      return new Date(timestamp);
    }
    const biometricMatch = timestamp.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
    if (biometricMatch) {
      const [, year, month, day, hours, minutes, seconds] = biometricMatch;
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds, 10)
      );
    }
  }
  return new Date(timestamp);
};

export const getDateStringFromTimestamp = (timestamp: any): string => {
  const date = parseAttendanceTimestamp(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
