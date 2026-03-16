/** Format a date string to a readable format */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/** Format a number with commas */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/** Format duration in minutes to "Xh Ym" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Format calories to "X kcal" */
export function formatCalories(calories: number): string {
  return `${formatNumber(Math.round(calories))} kcal`;
}

/** Format weight in kg */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}
