export function isSameMonth(a: Date | string | null | undefined, b: Date | string | null | undefined): boolean {
  const da = new Date(a as Date);
  const db = new Date(b as Date);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

export function isInNextMonth(now: Date | string, start: Date | string | null | undefined): boolean {
  const dNow = new Date(now);
  const dStart = new Date(start as Date);
  if (isNaN(dNow.getTime()) || isNaN(dStart.getTime())) return false;
  const nowMonthIndex = dNow.getFullYear() * 12 + dNow.getMonth();
  const startMonthIndex = dStart.getFullYear() * 12 + dStart.getMonth();
  return startMonthIndex === nowMonthIndex + 1;
}